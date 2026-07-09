const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');
// ====================================================================
// 🛠️ HELPER: Issue Unified JWT Session Tokens
// ====================================================================
const issueToken = (userPayload, isSecretAdmin = false) => {
  const secretKey = isSecretAdmin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET;
  return jwt.sign(
    { id: userPayload.id, email: userPayload.email, role: userPayload.role },
    secretKey,
    { expiresIn: isSecretAdmin ? '12h' : '7d' } // Admins get 12 hours, users get 7 days
  );
};

// ====================================================================
// 1. TRADITIONAL EMAIL/PASSWORD REGISTRATION
// ====================================================================
exports.clientRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Optional Check: Confirm Password logic is usually handled on the frontend, 
    // but you can add a check here if frontend sends 'confirmPassword'.

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Identity footprint already configured within system databases.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        password_hash: passwordHash, 
        role: 'user' 
      }])
      .select('id, name, email, role')
      .single();

    if (error) throw error;

    const sessionToken = issueToken(newUser);
    return res.status(201).json({ success: true, token: sessionToken, user: newUser });
  } catch (err) { next(err); }
};

// ====================================================================
// 2. UNIFIED LOGIN (Handles both Standard Users and CRM Admins)
// ====================================================================
exports.unifiedLogin = async (req, res, next) => {
  try {
    const { email, password, requestedPlatform } = req.body; // requestedPlatform: 'shop' or 'crm'

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error || !userProfile || !userProfile.password_hash) {
      return res.status(401).json({ success: false, message: 'Invalid verification credentials supplied.' });
    }

    const passwordsMatch = await bcrypt.compare(password, userProfile.password_hash);
    if (!passwordsMatch) {
      return res.status(401).json({ success: false, message: 'Invalid verification credentials supplied.' });
    }

    // Role Isolation: Block normal users from entering the hidden CRM route
    if (requestedPlatform === 'crm' && userProfile.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access Denied: Insufficient systems clearance.' });
    }

    const isAdmin = userProfile.role === 'superadmin';
    const activeToken = issueToken(userProfile, isAdmin);

    return res.status(200).json({
      success: true,
      token: activeToken,
      user: { id: userProfile.id, name: userProfile.name, email: userProfile.email, role: userProfile.role, avatarUrl: userProfile.avatar_url }
    });
  } catch (err) { next(err); }
};

// ====================================================================
// 3. GENERATE OTP & SEND VIA NODEMAILER (NO EMAILJS REQUIRED)
// ====================================================================
exports.forgotPasswordPipeline = async (req, res, next) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : "";

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email)
      .maybeSingle();

    if (fetchError || !user) {
      return res.status(404).json({ success: false, message: "No account found with this email." });
    }

    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 5 * 60000).toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_password_token: plainOtp, 
        reset_password_expires: expiryTime
      })
      .eq('email', email);

    if (updateError) throw updateError;

    // 🔥 BYE BYE EMAILJS! NATIVE SYSTEM ZINDABAD
    const emailSubject = "Preedarshini - Password Recovery OTP";
    
    // Tu khud ka sundar HTML email design kar sakta hai
    const emailHtmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #b5862a; text-align: center;">Account Recovery</h2>
        <p>Hello ${user.name || 'Valued Customer'},</p>
        <p>We received a request to reset your password for your Preedarshini account.</p>
        <div style="background-color: #f7f4ef; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: #555; text-transform: uppercase; letter-spacing: 2px;">Your Secure OTP</p>
          <h1 style="margin: 10px 0 0 0; color: #1a1a1a; letter-spacing: 5px;">${plainOtp}</h1>
        </div>
        <p style="font-size: 12px; color: #888;">This OTP is valid for exactly 5 minutes. Please do not share it with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">Preedarshini Couture / Est. 2024</p>
      </div>
    `;

    // Seedha function call, no API limits!
    await sendEmail(email, emailSubject, emailHtmlBody);

    return res.status(200).json({ success: true, message: "OTP sent securely to your email." });
  } catch (err) { 
    console.error("❌ [FORGOT PASSWORD ERROR]:", err.message);
    next(err); 
  }
};

// ====================================================================
// 4. VERIFY OTP AND RESET PASSWORD
// ====================================================================
exports.executePasswordReset = async (req, res, next) => {
  try {
    // 1. Normalize Inputs (Capital email ya extra space ka tension khatam)
    const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
    const otp = req.body.otp ? req.body.otp.toString().trim() : "";
    const { newPassword } = req.body;

    // 🔥 CRITICAL FIX: Match plain OTP directly with database
    const { data: matchingUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('reset_password_token', otp) // Compare direct plain text
      .gt('reset_password_expires', new Date().toISOString()) // Check 5 min validity
      .maybeSingle();

    // Agar OTP galat hai ya 5 minute nikal gaye
    if (error || !matchingUser) {
      return res.status(400).json({ success: false, message: 'OTP is invalid or has expired.' });
    }

    // 2. Hash the NEW password securely
    const salt = await bcrypt.genSalt(12);
    const updatedPasswordHash = await bcrypt.hash(newPassword, salt);

    // 3. Update Password & Flush out OTP data from database
    const { error: resetError } = await supabase
      .from('users')
      .update({
        password_hash: updatedPasswordHash,
        reset_password_token: null, // Clear OTP
        reset_password_expires: null // Clear Expiry
      })
      .eq('id', matchingUser.id);

    if (resetError) throw resetError;

    return res.status(200).json({ success: true, message: "Account access credentials updated seamlessly." });
  } catch (err) { 
    console.error("❌ [RESET PASSWORD ERROR]:", err.message);
    next(err); 
  }
};

// ====================================================================
// 5. GOOGLE OAUTH IDENTITY SYNC
// ====================================================================
exports.googleIdentitySync = async (req, res, next) => {
  try {
    const { googleId, email, name, avatarUrl } = req.body;

    let { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .maybeSingle();

    if (!userProfile) {
      let { data: emailMatch } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (emailMatch) {
        const { data: updatedUser } = await supabase
          .from('users')
          .update({ google_id: googleId, avatar_url: avatarUrl })
          .eq('id', emailMatch.id)
          .select('*')
          .single();
        userProfile = updatedUser;
      } else {
        const { data: newUser } = await supabase
          .from('users')
          .insert([{
            name,
            email: email.toLowerCase().trim(),
            google_id: googleId,
            avatar_url: avatarUrl,
            role: 'user'
          }])
          .select('*')
          .single();
        userProfile = newUser;
      }
    }

    // Role check to ensure we issue the right token power
    const isAdmin = userProfile.role === 'superadmin';
    const sessionToken = issueToken(userProfile, isAdmin);
    
    return res.status(200).json({
      success: true,
      token: sessionToken,
      user: { id: userProfile.id, name: userProfile.name, email: userProfile.email, role: userProfile.role, avatarUrl: userProfile.avatar_url }
    });
  } catch (err) { next(err); }
};
// ====================================================================
// NEW: REQUEST SIGNUP OTP (Generates OTP for fresh registrations)
// ====================================================================
exports.requestSignupOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if email already belongs to a registered user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please log in.' });
    }

    // Generate a fresh 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP back to frontend so EmailJS can dispatch it
    return res.status(200).json({
      success: true,
      message: 'OTP generated for registration.',
      otp: otpCode 
    });
  } catch (err) { 
    next(err); 
  }
};

// ====================================================================
// 👑 SECRET ADMIN GATE LOGIN (Bypasses standard user table for .env handshake)
// ====================================================================
exports.adminSecretLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Credential parameters are mandatory." });
    }

    // Direct strict environmental variables handshake verification
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      
      // Sign an absolute production JWT token payload
      const token = jwt.sign(
        { email: email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '12h' } // Token auto expires in 12 hours
      );

      console.log(`🔑 [CMS AUTH SUCCESS]: Verified administrative session for: ${email}`);
      return res.status(200).json({
        success: true,
        message: "Authentication handshake verified successfully.",
        token: token
      });
    }

    console.warn(`⚠️ [CMS AUTH REJECTION]: Access signature match failed for email entry: ${email}`);
    return res.status(401).json({ success: false, message: "Invalid administrative credentials match." });

  } catch (err) {
    next(err);
  }
};

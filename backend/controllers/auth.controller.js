const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
// 3. GENERATE OTP FOR EMAILJS (Frontend integration ready)
// ====================================================================
// ====================================================================
// 3. SECURE FORGOT PASSWORD PIPELINE (Backend EmailJS Integration)
// ====================================================================
exports.forgotPasswordPipeline = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Generate a 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash it for DB storage
    const secureTokenHash = crypto.createHash('sha256').update(otpCode).digest('hex');
    const tokenExpirationWindow = new Date(Date.now() + 15 * 60 * 1000); // 15-minute OTP

    const { data: userExists } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    
    if (!userExists) {
      return res.status(404).json({ success: false, message: 'No account found with that email.' });
    }

    const { error } = await supabase
      .from('users')
      .update({
        reset_password_token: secureTokenHash,
        reset_password_expires: tokenExpirationWindow.toISOString()
      })
      .eq('email', email.toLowerCase().trim());

    if (error) throw error;

    // 🔥 SEND EMAILJS FROM BACKEND USING .ENV VARIABLES
    const emailJsPayload = {
      service_id: process.env.EMAILJS_SERVICE_ID,       
      template_id: process.env.EMAILJS_TEMPLATE_ID,     
      user_id: process.env.EMAILJS_PUBLIC_KEY,          
      accessToken: process.env.EMAILJS_PRIVATE_KEY,     
      template_params: {
        to_email: email,
        to_name: userExists.name || 'Valued Customer',
        otp: otpCode
      }
    };

    // Make API call to EmailJS servers directly
    await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailJsPayload);

    // Return ONLY success message. NO RAW OTP EXPOSED!
    return res.status(200).json({
      success: true,
      message: 'OTP has been securely dispatched to your email address.'
    });
    
  } catch (err) { 
    console.error("❌ EmailJS Backend Error:", err.response?.data || err.message);
    next(err); 
  }
};
// ====================================================================
// 4. VERIFY OTP AND RESET PASSWORD
// ====================================================================
exports.executePasswordReset = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const secureTokenHash = crypto.createHash('sha256').update(otp.toString()).digest('hex');

    const { data: matchingUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('reset_password_token', secureTokenHash)
      .gt('reset_password_expires', new Date().toISOString())
      .maybeSingle();

    if (error || !matchingUser) {
      return res.status(400).json({ success: false, message: 'OTP is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(12);
    const updatedPasswordHash = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: updatedPasswordHash,
        reset_password_token: null, // Flush out OTP after use
        reset_password_expires: null
      })
      .eq('id', matchingUser.id);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, message: "Account access credentials updated seamlessly." });
  } catch (err) { next(err); }
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

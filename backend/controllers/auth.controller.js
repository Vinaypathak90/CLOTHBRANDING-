const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Helper to sign unified JWT tokens
const issueToken = (userPayload, isSecretAdmin = false) => {
  const secretKey = isSecretAdmin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET;
  return jwt.sign(
    { id: userPayload.id, email: userPayload.email, role: userPayload.role },
    secretKey,
    { expiresIn: isSecretAdmin ? '12h' : '7d' }
  );
};

// 1. Traditional Email/Password Signup
exports.clientRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check database for pre-existing email profiles
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Identity footprint already configured within system databases.' });
    }

    // Hash user passwords safely before leaving the server frame
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        { name, email: email.toLowerCase().trim(), password_hash: passwordHash, role: 'user' }
      ])
      .select('id, name, email, role')
      .single();

    if (error) throw error;

    const sessionToken = issueToken(newUser);
    return res.status(201).json({ token: sessionToken, user: newUser });
  } catch (err) { next(err); }
};

// 2. Client & Admin Dynamic Login Router Handler
exports.unifiedLogin = async (req, res, next) => {
  try {
    const { email, password, requestedPlatform } = req.body; // platform: 'shop' or 'crm'

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !userProfile || !userProfile.password_hash) {
      return res.status(401).json({ message: 'Invalid verification credentials supplied.' });
    }

    const passwordsMatch = await bcrypt.compare(password, userProfile.password_hash);
    if (!passwordsMatch) {
      return res.status(401).json({ message: 'Invalid verification credentials supplied.' });
    }

    // Route isolation checks
    if (requestedPlatform === 'crm' && userProfile.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access Denied: Insufficient systems clearance.' });
    }

    const isAdmin = userProfile.role === 'superadmin';
    const activeToken = issueToken(userProfile, isAdmin);

    return res.status(200).json({
      token: activeToken,
      user: { id: userProfile.id, name: userProfile.name, email: userProfile.email, role: userProfile.role }
    });
  } catch (err) { next(err); }
};

// 3. Forgot Password Entry Pipeline (Generates an exposed reset key token)
exports.forgotPasswordPipeline = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Create unhashed random token for the email link
    const cleanResetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token immediately for secure database storage
    const secureTokenHash = crypto.createHash('sha256').update(cleanResetToken).digest('hex');
    const tokenExpirationWindow = new Date(Date.now() + 60 * 60 * 1000); // Stable 1-hour lifecycle window

    const { data, error } = await supabase
      .from('users')
      .update({
        reset_password_token: secureTokenHash,
        reset_password_expires: tokenExpirationWindow.toISOString()
      })
      .eq('email', email.toLowerCase().trim())
      .select('name, email');

    if (error) throw error;

    // In production, send cleanResetToken via Nodemailer/SendGrid to the user's email address
    // For local development, we return it directly so you can verify the logic instantly
    return res.status(200).json({
      message: 'System recovery parameters validated. Reset sequence initialized.',
      developmentLink: `/reset-password/${cleanResetToken}`
    });
  } catch (err) { next(err); }
};

// 4. Reset Password Core Update
exports.executePasswordReset = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const secureTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Retrieve records with matching token states that are still within their expiration window
    const { data: matchingUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_password_token', secureTokenHash)
      .gt('reset_password_expires', new Date().toISOString())
      .single();

    if (error || !matchingUser) {
      return res.status(400).json({ message: 'Recovery authentication footprint is malformed or expired.' });
    }

    // Encrypt the new incoming password string
    const salt = await bcrypt.genSalt(12);
    const updatedPasswordHash = await bcrypt.hash(newPassword, salt);

    // Flush out reset token allocations upon successful mutation
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: updatedPasswordHash,
        reset_password_token: null,
        reset_password_expires: null
      })
      .eq('id', matchingUser.id);

    if (updateError) throw updateError;

    return res.status(200).json({ status: "success", message: "Account access credentials updated seamlessly." });
  } catch (err) { next(err); }
};

// 5. Google OAuth Identity Sync Controller
exports.googleIdentitySync = async (req, res, next) => {
  try {
    const { googleId, email, name, avatarUrl } = req.body;

    // Check if the identity exists under Google authentication metrics
    let { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    // Alternate structural cleanup: Check if the user exists via email fallback matching
    if (!userProfile) {
      let { data: emailMatch } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (emailMatch) {
        // Link the Google identity to their existing account
        const { data: updatedUser } = await supabase
          .from('users')
          .update({ google_id: googleId, avatar_url: avatarUrl })
          .eq('id', emailMatch.id)
          .select('*')
          .single();
        userProfile = updatedUser;
      } else {
        // Build a brand new profile for first-time signups via Google OAuth
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

    const sessionToken = issueToken(userProfile);
    return res.status(200).json({
      token: sessionToken,
      user: { id: userProfile.id, name: userProfile.name, email: userProfile.email, role: userProfile.role }
    });
  } catch (err) { next(err); }
};

const router = require('express').Router();
const { loginLimiter } = require('../middleware/rateLimiter');
const {
  clientRegister,
  unifiedLogin,
  forgotPasswordPipeline,
  executePasswordReset,
  googleIdentitySync,
  requestSignupOtp,
  adminSecretLogin
} = require('../controllers/auth.controller');

// ==========================================
// PUBLIC AUTHENTICATION GATEWAYS
// ==========================================

// Traditional Auth
router.post('/register', clientRegister);
router.post('/login', loginLimiter, unifiedLogin); // Rate-limited to prevent brute-forcing

// Secret Admin Gate
router.post('/admin-secret-login', adminSecretLogin);

// Google OAuth Sync
router.post('/google-sync', googleIdentitySync);

// OTP & Password Reset via Frontend EmailJS
router.post('/forgot-password', loginLimiter, forgotPasswordPipeline);
router.post('/reset-password', executePasswordReset);
router.post('/request-signup-otp', loginLimiter, requestSignupOtp);
module.exports = router;
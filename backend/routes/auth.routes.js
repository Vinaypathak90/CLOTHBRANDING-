const router = require('express').Router();
const { loginLimiter } = require('../middleware/rateLimiter');
const { 
  clientRegister, 
  unifiedLogin, 
  forgotPasswordPipeline, 
  executePasswordReset, 
  googleIdentitySync 
} = require('../controllers/auth.controller');

// Registration & Core Sessions Entries
router.post('/register', clientRegister);
router.post('/login', loginLimiter, unifiedLogin);

// Account Password Recovery Vectors
router.post('/forgot-password', forgotPasswordPipeline);
router.put('/reset-password/:token', executePasswordReset);

// Google Third-Party Federation Matrix Connector
router.post('/google-sync', googleIdentitySync);

module.exports = router;
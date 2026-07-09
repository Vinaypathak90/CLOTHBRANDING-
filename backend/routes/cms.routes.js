const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { 
  getCMSManifest, 
  adminUpdateCMSManifest, 
  adminInitializeCMSManifest, 
  adminSecretLogin,
  getStoreSettings, 
  updateStoreSettings 
} = require('../controllers/cms.controller');

// ====================================================================
// 🔒 UPDATED: MULTI-ADMIN PRODUCTION GUARD
// ====================================================================
const verifyCmsAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Access denied. Token missing." });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'preeti_haute_couture_secret_matrix_2026';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Check both Admin Emails defined in .env
    const isAuthorizedAdmin = (decoded.email === process.env.ADMIN_EMAIL_1 || decoded.email === process.env.ADMIN_EMAIL_2);
    
    if (decoded.role === 'admin' && isAuthorizedAdmin) {
      req.admin = decoded;
      return next(); 
    }

    return res.status(403).json({ success: false, message: "Forbidden. Invalid admin clearance." });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized. Session expired." });
  }
};

// ====================================================================
// 🌍 ROUTE MAPPINGS
// ====================================================================

// Public viewport link
router.get('/manifest', getCMSManifest);

// Hidden entry door lock
router.post('/admin-gate-login', adminSecretLogin); 

// Secure design mutations locked with our updated Multi-Admin guard
router.put('/crm-update', verifyCmsAdminToken, adminUpdateCMSManifest);
router.post('/initialize', verifyCmsAdminToken, adminInitializeCMSManifest);

// ====================================================================
// 💳 PAYMENT & CONTACT ENGINE ROUTES
// ====================================================================
// GET route is public (so Checkout page can read the QR data)
router.get('/settings', getStoreSettings);

// POST route is now protected and ready for use
router.post('/settings', verifyCmsAdminToken, updateStoreSettings);

module.exports = router;
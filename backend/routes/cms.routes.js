const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { 
  getCMSManifest, 
  adminUpdateCMSManifest, 
  adminInitializeCMSManifest, 
  adminSecretLogin 
} = require('../controllers/cms.controller');

// ====================================================================
// 🔒 PRODUCTION CMS ADMIN GUARD (Database-Independent Verification)
// ====================================================================
const verifyCmsAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("⚠️ [CMS GUARD]: Token missing in request headers.");
      return res.status(401).json({ success: false, message: "Access denied. Token missing." });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'preeti_haute_couture_secret_matrix_2026';
    
    // Decode and verify the token signature
    const decoded = jwt.verify(token, jwtSecret);
    
    // Strictly validate if the role is 'admin' and matches env email
    const targetEmail = process.env.ADMIN_EMAIL || 'vinaypathak2772@gmail.com';
    if (decoded.role === 'admin' && decoded.email === targetEmail) {
      req.admin = decoded;
      return next(); // Token verified! Move to controller
    }

    console.warn("⚠️ [CMS GUARD]: Token payload validation failed.");
    return res.status(403).json({ success: false, message: "Forbidden. Invalid admin clearance." });

  } catch (err) {
    console.error("❌ [CMS GUARD ERROR]:", err.message);
    return res.status(401).json({ success: false, message: "Unauthorized. Session expired or corrupted token." });
  }
};

// ====================================================================
// 🌍 ROUTE MAPPINGS
// ====================================================================

// Public viewport link
router.get('/manifest', getCMSManifest);

// Hidden entry door lock
router.post('/admin-gate-login', adminSecretLogin); 

// Secure design mutations locked with our independent CMS guard
router.put('/crm-update', verifyCmsAdminToken, adminUpdateCMSManifest);
router.post('/initialize', verifyCmsAdminToken, adminInitializeCMSManifest);

module.exports = router;
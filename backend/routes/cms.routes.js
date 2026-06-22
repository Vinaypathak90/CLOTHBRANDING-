const router = require('express').Router();
const { getCMSManifest, adminUpdateCMSManifest } = require('../controllers/cms.controller');
const { verifyAdminClearance } = require('../middleware/auth.middleware');

// Public route mapping to load style elements instantly in the app
router.get('/manifest', getCMSManifest);

// High Security Admin Dashboard modification node gateway
router.put('/crm-update', verifyAdminClearance, adminUpdateCMSManifest);

module.exports = router;
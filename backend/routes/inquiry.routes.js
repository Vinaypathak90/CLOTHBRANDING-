const router = require('express').Router();
const { submitContactForm, adminGetAllInquiries, adminUpdateInquiryStatus } = require('../controllers/inquiry.controller');
const { verifyAdminClearance } = require('../middleware/auth.middleware');

// Public contact page submission node
router.post('/submit', submitContactForm);

// Admin secure CRM endpoints
router.get('/crm-list', verifyAdminClearance, adminGetAllInquiries);
router.put('/crm-status/:id', verifyAdminClearance, adminUpdateInquiryStatus);

module.exports = router;

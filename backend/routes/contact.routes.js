const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

// ==========================================
// 🧑‍💻 CLIENT ROUTE (Public)
// ==========================================
// Endpoint: POST /api/contact/submit
// Use: User website se message submit karega
router.post('/submit', contactController.submitMessage);

// ==========================================
// 👑 ADMIN CRM ROUTES (Protected)
// ==========================================
// Endpoint: GET /api/contact/admin/list
// Use: Admin dashboard mein saare messages fetch karega
router.get('/admin/list', contactController.adminGetMessages);

// Endpoint: POST /api/contact/admin/reply-email
// Use: Admin dashboard se direct Email send karega
router.post('/admin/reply-email', contactController.adminReplyEmail);

// Endpoint: POST /api/contact/admin/reply-wa
// Use: WhatsApp par reply mark karega
router.post('/admin/reply-wa', contactController.adminMarkWhatsappReplied);
router.delete('/admin/delete/:id', contactController.adminDeleteMessage);

module.exports = router;
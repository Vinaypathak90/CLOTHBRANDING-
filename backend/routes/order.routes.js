const router = require('express').Router();

// 🔥 FIX: Importing the EXACT function names that exist in your new controller
const { 
  createWhatsAppOrder, 
  getUserOrders,
  adminGetAllOrdersDashboard, 
  adminMutateOrderStatus 
} = require('../controllers/order.controller');

// Middlewares
const { verifyUserAuth, verifyCmsAdminToken } = require('../middleware/auth.middleware');

// ==========================================
// 👤 USER ROUTES (Frontend Profile)
// ==========================================
// Creating order (Public/Guest allowed, so no auth middleware for now)
router.post('/create-qr', createWhatsAppOrder); 

// Fetch history (Requires user login)
router.get('/my-history', verifyUserAuth, getUserOrders);


// ==========================================
// 👑 ADMIN ROUTES (Dashboard CRM)
// ==========================================
// Admin views all orders
router.get('/admin/all', verifyCmsAdminToken, adminGetAllOrdersDashboard);

// Admin updates an order
router.put('/admin/update-status/:orderId', verifyCmsAdminToken, adminMutateOrderStatus);


module.exports = router;
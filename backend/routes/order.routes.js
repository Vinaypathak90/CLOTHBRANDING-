const router = require('express').Router();
const {
  instantiateCheckoutOrder,
  getOrderTrackingPipeline,
  getClientOrderHistory,
  getMyOrders,
  adminGetAllOrdersDashboard,
  adminMutateOrderStatus,
  adminAssignCourierAgent
} = require('../controllers/order.controller');

const { verifyUserAuth, verifyAdminClearance } = require('../middleware/auth.middleware');

// ==========================================
// CLIENT GATEWAYS (PUBLIC / SECURED SESSIONS)
// ==========================================
router.post('/checkout-instantiate', verifyUserAuth, instantiateCheckoutOrder);
router.get('/track/:order_id_string', getOrderTrackingPipeline);
router.get('/my-orders-summary', verifyUserAuth, getClientOrderHistory);
router.get('/my-orders', verifyUserAuth, getMyOrders); // 🔥 Core dashboard panel pipeline hook

// ==========================================
// SECURE ADMINISTRATIVE CRM GATEWAYS 
// ==========================================
router.get('/admin/dashboard', verifyAdminClearance, adminGetAllOrdersDashboard);
router.put('/admin/mutate-status/:id', verifyAdminClearance, adminMutateOrderStatus);
router.post('/admin/assign-agent', verifyAdminClearance, adminAssignCourierAgent);

module.exports = router;
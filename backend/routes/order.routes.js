const router = require('express').Router();
const {
  instantiateCheckoutOrder,
  getOrderTrackingPipeline,
  getClientOrderHistory,
  adminGetAllOrdersDashboard,
  adminMutateOrderStatus,
  adminAssignCourierAgent
} = require('../controllers/order.controller');
const { verifyAdminClearance, verifyClientToken } = require('../middleware/auth.middleware');

// Public checkout & validation entry channels vectors
router.post('/checkout-instantiate', instantiateCheckoutOrder);
router.get('/track/:order_id_string', getOrderTrackingPipeline);

// Client account private validation logs viewports
router.get('/history', verifyClientToken, getClientOrderHistory);

// High Security Admin Control Panel Operations (CRM Module Nodes)
router.get('/crm-dashboard', verifyAdminClearance, adminGetAllOrdersDashboard);
router.put('/crm-advance-pipeline/:id', verifyAdminClearance, adminMutateOrderStatus);
router.post('/crm-allocate-delivery', verifyAdminClearance, adminAssignCourierAgent);

module.exports = router;

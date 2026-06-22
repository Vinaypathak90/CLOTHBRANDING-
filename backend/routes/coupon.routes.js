const router = require('express').Router();
const { validateCoupon, adminCreateCoupon, adminGetAllCoupons, adminDeleteCoupon } = require('../controllers/coupon.controller');
const { verifyAdminClearance, verifyClientToken } = require('../middleware/auth.middleware');

// Public processing validation checkpoint for dynamic carts engine
router.post('/validate', validateCoupon);

// Administrative restricted access operational profiles
router.get('/crm-list', verifyAdminClearance, adminGetAllCoupons);
router.post('/crm-insert', verifyAdminClearance, adminCreateCoupon);
router.delete('/crm-purge/:id', verifyAdminClearance, adminDeleteCoupon);

module.exports = router;

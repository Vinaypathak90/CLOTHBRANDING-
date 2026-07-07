const router = require('express').Router();
const { 
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  getUserCart,
  syncGuestCart
} = require('../controllers/cart.controller');

// Import authentication middleware
const { verifyUserAuth } = require('../middleware/auth.middleware');

// ==========================================
// 🛒 CART API PIPELINE MAPPINGS
// ==========================================

// Get user cart (Requires login token)
router.get('/my-cart', verifyUserAuth, getUserCart);

// Add item to cart
router.post('/add', verifyUserAuth, addToCart);

// Update quantity (+ / -) -> Expects ID in the URL and quantity in the body
router.put('/update/:cartItemId', verifyUserAuth, updateQuantity);

// Remove item (Trash can icon) -> Expects ID in the URL
router.delete('/remove/:cartItemId', verifyUserAuth, removeFromCart);

// Guest Cart Sync Bypass -> Kept public so it can handle migrations smoothly
router.post('/sync-guest-cart', syncGuestCart);

module.exports = router;
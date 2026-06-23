const router = require('express').Router();
const { 
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  getUserCart 
} = require('../controllers/cart.controller');

// 🔥 IMPORT AUTH MIDDLEWARE: Ensures user sessions (usr_tk / adm_tk) are verified safely
const { verifyUserAuth } = require('../middleware/auth.middleware');

// ====================================================================
// GATEWAY PATH CONFIGURATIONS (All routes are strictly authenticated)
// ====================================================================

// Route A: GET - Hydrate active user's cart page grid with relational products mapping
router.get('/my-cart', verifyUserAuth, getUserCart);

// Route B: POST - Fresh insertion matrix or real-time incremental multiplier logic
router.post('/add', verifyUserAuth, addToCart);

// Route C: POST - Update line-item counts natively (+ / - buttons sync layer)
router.post('/update-qty', verifyUserAuth, updateQuantity);

// Route D: DELETE - Absolute execution purge token to wipe product out of database row
router.delete('/remove/:cartItemId', verifyUserAuth, removeFromCart);

module.exports = router;

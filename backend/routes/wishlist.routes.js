const router = require('express').Router();
const { toggleWishlist, getUserWishlist } = require('../controllers/wishlist.controller');
const { verifyUserAuth } = require('../middleware/auth.middleware'); // Aapka auth check middleware

router.post('/toggle', verifyUserAuth, toggleWishlist);
router.get('/my-list', verifyUserAuth, getUserWishlist);

module.exports = router;

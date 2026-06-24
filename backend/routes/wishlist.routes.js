const router = require('express').Router();
const { toggleWishlist, getUserWishlist } = require('../controllers/wishlist.controller');

// Endpoints mapped flexibly to accept both system clients and guests inside controllers
router.post('/toggle', toggleWishlist);
router.get('/my-list', getUserWishlist); // Matches the frontend /my-list fetch pattern cleanly

module.exports = router;
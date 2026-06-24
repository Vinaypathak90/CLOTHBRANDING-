const router = require('express').Router();

// 🔥 THE FIX: Import the entire controller object instead of destructuring.
// This prevents the "silent skip undefined" bug in Express.
const productController = require('../controllers/product.controller');

// ====================================================================
// 🚨 STARTUP SANITY CHECK (Terminal mein batayega agar koi function miss hua)
// ====================================================================
if (!productController.adminGetFullCatalog) {
    console.error("❌ CRITICAL ERROR: 'adminGetFullCatalog' is MISSING in product.controller.js!");
}
if (!productController.getProductById) {
    console.error("❌ CRITICAL ERROR: 'getProductById' is MISSING in product.controller.js!");
}

// ====================================================================
// 👑 EXACT MATCH ROUTES (MUST BE AT THE VERY TOP)
// ====================================================================
// Ab Express inko skip nahi kar payega!
router.get('/all-catalog', productController.adminGetFullCatalog);
router.get('/shop-list', productController.getPublicProducts);

// ====================================================================
// 🛠️ ADMINISTRATIVE MUTATIONS
// ====================================================================
router.post('/create', productController.adminCreateProduct);
router.put('/update/:id', productController.adminUpdateProduct);
router.delete('/delete/:id', productController.adminDeleteProduct);

// ====================================================================
// ⚠️ DYNAMIC WILDCARD ROUTES (MUST BE AT THE VERY BOTTOM)
// ====================================================================
router.get('/detail/:identifier', productController.getProductDetailMasterDispatcher);

// 🔥 Yeh route sabse aakhri mein hi rehna chahiye!
router.get('/:id', productController.getProductById);

module.exports = router;
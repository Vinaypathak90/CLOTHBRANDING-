const router = require('express').Router();
const {
  getPublicProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetFullCatalog,
  getProductDetailMasterDispatcher // 🔥 Naya Master function import kiya
} = require('../controllers/product.controller');

// Import authentication security clear check blocks from middleware path
const { verifyAdminClearance } = require('../middleware/auth.middleware');

// ==========================================
// CLIENT FACING GATEWAYS (PUBLIC ACCESS PATHS)
// ==========================================

// Route A: Catalog listing queries (Matches: /api/products/shop-list)
router.get('/shop-list', getPublicProducts);

// Route B: 🔥 CLEAN UNIFIED PATHWAY (No more path-to-regexp crashes!)
// Yeh single route numbers (ID) aur strings (Slug) dono ke inputs dynamically accept karega
router.get('/detail/:identifier', getProductDetailMasterDispatcher);


// ==========================================
// SECURE ADMINISTRATIVE HOOKS (CRM CLEARANCE REQUIRED)
// ==========================================
router.get('/admin/catalog', verifyAdminClearance, adminGetFullCatalog);
router.post('/admin/product-add', verifyAdminClearance, adminCreateProduct);
router.put('/admin/product-update/:id', verifyAdminClearance, adminUpdateProduct);
router.delete('/admin/product-delete/:id', verifyAdminClearance, adminDeleteProduct);

module.exports = router;
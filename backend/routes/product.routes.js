const router = require('express').Router();
const {
  getPublicProducts,
  getProductDetailBySlug,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetFullCatalog
} = require('../controllers/product.controller');

// Import authentication security clear check blocks from your middleware path
const { verifyAdminClearance } = require('../middleware/auth.middleware');

// ==========================================
// CLIENT FACING GATEWAYS (PUBLIC ACCESS PATHS)
// ==========================================
router.get('/shop-list', getPublicProducts);
router.get('/detail/:slug', getProductDetailBySlug);
router.get('/detail-by-id/:id', getProductDetailById);

// ==========================================
// SECURE ADMISTRATIVE HOOKS (CRM CLEARANCE REQUIRED)
// ==========================================
router.get('/admin/catalog', verifyAdminClearance, adminGetFullCatalog);
router.post('/admin/product-add', verifyAdminClearance, adminCreateProduct);
router.put('/admin/product-update/:id', verifyAdminClearance, adminUpdateProduct);
router.delete('/admin/product-delete/:id', verifyAdminClearance, adminDeleteProduct);

module.exports = router;
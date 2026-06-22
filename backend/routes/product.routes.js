const router = require('express').Router();
const { 
  getPublicProducts, 
  getProductDetailBySlug, 
  adminCreateProduct, 
  adminUpdateProduct, 
  adminDeleteProduct,
  adminGetFullCatalog
} = require('../controllers/product.controller');
const { verifyAdminClearance } = require('../middleware/auth.middleware');

// Public Pipeline Endpoints Context Map
router.get('/', getPublicProducts);
router.get('/profile/:slug', getProductDetailBySlug);

// High Security Admin Privilege Operations (CRM Engine Entry Points)
router.get('/crm-inventory', verifyAdminClearance, adminGetFullCatalog);
router.post('/crm-insert', verifyAdminClearance, adminCreateProduct);
router.put('/crm-modify/:id', verifyAdminClearance, adminUpdateProduct);
router.delete('/crm-purge/:id', verifyAdminClearance, adminDeleteProduct);

module.exports = router;
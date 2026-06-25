const router = require('express').Router();
const {
  getPublicCategories,
  getCategoryBySlug,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  getAllCategories,
  
} = require('../controllers/category.controller');
const { verifyAdminClearance } = require('../middleware/auth.middleware');

// Public Client Interfacing Access Endpoints
router.get('/', getPublicCategories);
router.get('/profile/:slug', getCategoryBySlug);

// High-Clearance Management Operations (Admin CRM Workspace Entries)
router.post('/crm-insert', verifyAdminClearance, adminCreateCategory);
router.put('/crm-modify/:id', verifyAdminClearance, adminUpdateCategory);
router.delete('/crm-purge/:id', verifyAdminClearance, adminDeleteCategory);
router.get('/list', getAllCategories);
module.exports = router;

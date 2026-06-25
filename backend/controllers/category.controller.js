const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');


// ==========================================
// CLIENT FACING OPERATIONS (PUBLIC ROUTES)
// ==========================================

// 1. Fetch all categories optimized by display order (for navigation menus and sidebars)
exports.getPublicCategories = async (req, res, next) => {
  try {
    // Select all categorical fields and bring along details if a parent category exists
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, image_url, display_order, parent_id')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) { next(err); }
};

// 2. Fetch details for a specific category using its slug lookup signature
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('categories')
      .select('*, parent:parent_id(id, name, slug)')
      .eq('slug', slug.toLowerCase().trim())
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Requested product category context does not exist.' });
    }

    return res.status(200).json(data);
  } catch (err) { next(err); }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    console.log("[ATELIER CATEGORIES]: Hydrating category trees directly from Supabase...");
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      categories: categories || []
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// ADMIN CRM OPERATIONS (SECURE ROUTES)
// ==========================================

// 3. Admin Module: Instantiate a new Category node
exports.adminCreateCategory = async (req, res, next) => {
  try {
    const { name, slug, image_url, display_order, parent_id } = req.body;

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: name.trim(),
        slug: slug.toLowerCase().trim(),
        image_url: image_url || '',
        display_order: display_order || 0,
        parent_id: parent_id || null // Links subcategories natively
      }])
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'A classification matrix with this exact slug variant is already configured.' });
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: 'Dynamic category element initialized within server schema.',
      category: data
    });
  } catch (err) { next(err); }
};

// 4. Admin Module: Edit / Modify an existing classification layer
exports.adminUpdateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, image_url, display_order, parent_id } = req.body;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (slug !== undefined) updatePayload.slug = slug.toLowerCase().trim();
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (display_order !== undefined) updatePayload.display_order = display_order;
    if (parent_id !== undefined) updatePayload.parent_id = parent_id || null;

    const { data, error } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Structural data modifications for target category applied cleanly.',
      category: data
    });
  } catch (err) { next(err); }
};

// 5. Admin Module: Purge / Hard Delete Execution Matrix
exports.adminDeleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      // Handles PostgreSQL system dependency errors securely
      if (error.code === '23503') {
        return res.status(400).json({
          message: 'Operation aborted: This node is currently referenced by active products. Re-route your inventory items first.'
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Category profile erased from relational tables matching tracking indices.'
    });
  } catch (err) { next(err); }
};


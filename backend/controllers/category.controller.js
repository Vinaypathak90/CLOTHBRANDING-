const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');

// ==========================================
// CLIENT FACING OPERATIONS (PUBLIC ROUTES)
// ==========================================

// 1. Fetch all categories optimized by display order (for navigation menus and sidebars)
exports.getPublicCategories = async (req, res, next) => {
  try {
    // 🔥 FIX: Removed 'image_url' from products query. Only fetching 'images' array.
    let { data, error } = await supabase
      .from('categories')
      .select(`
        id, name, slug, image_url, display_order, parent_id,
        products ( images )
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn("Relation fetch failed in getPublicCategories, falling back to basic category fetch.", error.message);
      const fallback = await supabase
        .from('categories')
        .select('id, name, slug, image_url, display_order, parent_id')
        .order('display_order', { ascending: true });
      data = fallback.data || [];
    }

    // Strict Backend Filter & Smart Image Logic
    const validData = (data || [])
      .filter(cat => cat && cat.name && cat.name.trim() !== '')
      .map(cat => {
        let finalImageUrl = cat.image_url;

        // 🔥 FIX: Logic updated to strictly use the 'images' array from products
        if ((!finalImageUrl || finalImageUrl.trim() === '') && cat.products && cat.products.length > 0) {
          const firstProduct = cat.products[0];
          if (firstProduct.images && Array.isArray(firstProduct.images) && firstProduct.images.length > 0) {
            finalImageUrl = firstProduct.images[0]; // Gets the first image of the product
          }
        }

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image_url: finalImageUrl,
          display_order: cat.display_order,
          parent_id: cat.parent_id
        };
      });

    // Anti-Caching Headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json(validData);
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

// 3. Fetch all categories for showcase and general listing
exports.getAllCategories = async (req, res, next) => {
  try {
    console.log("[ATELIER CATEGORIES]: Hydrating category trees and fetching product fallbacks...");
    
    // 🔥 FIX: Removed 'image_url' from products query. Only fetching 'images' array.
    let { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id, name, slug, image_url, display_order,
        products ( images )
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn("Relation fetch failed in getAllCategories, falling back to basic fetch.", error.message);
      const fallback = await supabase
        .from('categories')
        .select('id, name, slug, image_url, display_order')
        .order('display_order', { ascending: true });
      categories = fallback.data || [];
    }

    // Strict Backend Filter & Smart Fallback Logic
    const validCategories = (categories || [])
      .filter(cat => cat && cat.name && cat.name.trim() !== '')
      .map(cat => {
        let finalImageUrl = cat.image_url;

        // 🔥 FIX: Logic updated to strictly use the 'images' array from products
        if ((!finalImageUrl || finalImageUrl.trim() === '') && cat.products && cat.products.length > 0) {
          const firstProduct = cat.products[0];
          if (firstProduct.images && Array.isArray(firstProduct.images) && firstProduct.images.length > 0) {
            finalImageUrl = firstProduct.images[0]; // Gets the first image of the product
          }
        }

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image_url: finalImageUrl, 
          display_order: cat.display_order
        };
      });

    // Anti-Caching Headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json({
      success: true,
      categories: validCategories
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// ADMIN CRM OPERATIONS (SECURE ROUTES)
// ==========================================

// 4. Admin Module: Instantiate a new Category node
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
        parent_id: parent_id || null
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

// 5. Admin Module: Edit / Modify an existing classification layer
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

// 6. Admin Module: Purge / Hard Delete Execution Matrix
exports.adminDeleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
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
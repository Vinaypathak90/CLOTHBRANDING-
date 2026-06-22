const { supabase } = require('../config/db');

// ==========================================
// CLIENT FACING OPERATIONS (PUBLIC ROUTES)
// ==========================================

// 1. Fetch filtered and sorted products for shop views
exports.getPublicProducts = async (req, res, next) => {
  try {
    const { category, sort, minPrice, maxPrice, isFeatured, isNewArrival } = req.query;
    
    let query = supabase
      .from('products')
      .select('id, name, slug, sku, description, images, price, discount_price, variants, is_featured, is_bestseller, is_new_arrival')
      .eq('is_hidden', false);

    // Apply strict filtering values dynamically
    if (category) query = query.eq('category_id', category);
    if (isFeatured) query = query.eq('is_featured', isFeatured === 'true');
    if (isNewArrival) query = query.eq('is_new_arrival', isNewArrival === 'true');
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));

    // High fashion sorting setups
    if (sort === 'price-low-high') query = query.order('price', { ascending: true });
    else if (sort === 'price-high-low') query = query.order('price', { ascending: false });
    else if (sort === 'bestseller') query = query.order('is_bestseller', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) { next(err); }
};

// 2. Fetch single descriptive product profile data
exports.getProductDetailBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('slug', slug)
      .eq('is_hidden', false)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Requested design silhouette cannot be mapped within current collections.' });
    }
    return res.status(200).json(data);
  } catch (err) { next(err); }
};

// ==========================================
// ADMIN CRM OPERATIONS (SECURE ROUTES)
// ==========================================

// 3. Admin Module: Create/Instantiate Product Node
exports.adminCreateProduct = async (req, res, next) => {
  try {
    const { name, slug, sku, description, images, category_id, variants, price, cost_price, discount_price, is_featured, is_bestseller, is_new_arrival, is_hidden, tags } = req.body;

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        slug: slug.toLowerCase().trim(),
        sku: sku.toUpperCase().trim(),
        description,
        images, // Pass list structure of loaded cloud urls
        category_id,
        variants, // JSONB structure input validation passed from CRM form panel
        price,
        cost_price,
        discount_price,
        is_featured,
        is_bestseller,
        is_new_arrival,
        is_hidden,
        tags
      }])
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, message: 'New design initialized within system matrix.', product: data });
  } catch (err) { next(err); }
};

// 4. Admin Module: Edit / Modify System Record
exports.adminUpdateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatePayload = req.body;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Catalog record mutations executed successfully.', product: data });
  } catch (err) { next(err); }
};

// 5. Admin Module: Purge / Hard Delete Execution Matrix
exports.adminDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Product profile permanently deleted from server registries.' });
  } catch (err) { next(err); }
};

// 6. Admin Module: Master view fetching all items (including hidden assets and metrics for profit logs)
exports.adminGetFullCatalog = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) { next(err); }
};

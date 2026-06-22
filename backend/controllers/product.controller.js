const { supabase } = require('../config/db');

// Secure automatic slug formatting helper layer function
const generateCleanSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
};

// ====================================================================
// 👥 CLIENT FACING OPERATIONS (PUBLIC ENDPOINTS)
// ====================================================================

// 1. Fetch filtered and sorted products for frontend catalog views
exports.getPublicProducts = async (req, res, next) => {
  try {
    const { category, sort, minPrice, maxPrice, isFeatured, isNewArrival } = req.query;
    
    let query = supabase
      .from('products')
      .select('id, name, slug, sku, description, images, price, discount_price, variants, bullet_points, model_info, is_featured, is_bestseller, is_new_arrival')
      .eq('is_hidden', false);

    // Apply strict filtering dynamics
    if (category) query = query.eq('category_id', category);
    if (isFeatured) query = query.eq('is_featured', isFeatured === 'true');
    if (isNewArrival) query = query.eq('is_new_arrival', isNewArrival === 'true');
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));

    // High fashion index sorting management structures
    if (sort === 'price-low-high') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-high-low') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'bestseller') {
      query = query.order('is_bestseller', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) { 
    next(err); 
  }
};

// 2. Fetch single descriptive product profile data matching unique slug index
exports.getProductDetailBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('slug', slug.toLowerCase().trim())
      .eq('is_hidden', false)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false,
        message: 'Requested design silhouette cannot be mapped within current active collections.' 
      });
    }
    return res.status(200).json(data);
  } catch (err) { 
    next(err); 
  }
};

// ====================================================================
// 🛠️ ADMIN CRM OPERATIONS (SECURE ROUTES GATEWAY)
// ====================================================================

// 3. Admin Module: Instantiate / Add New Product Entry Node
exports.adminCreateProduct = async (req, res, next) => {
  try {
    const { 
      name, slug, sku, description, images, category_id, variants, 
      bullet_points, model_info, price, cost_price, discount_price, 
      is_featured, is_bestseller, is_new_arrival, is_hidden, tags 
    } = req.body;

    // Strict structural parameter integrity validation
    if (!name || !sku || !price || !cost_price) {
      return res.status(400).json({
        success: false,
        message: "Mandatory system entries missing. Provide Name, SKU, Price, and Cost Price parameters."
      });
    }

    const computedSlug = slug ? generateCleanSlug(slug) : generateCleanSlug(name);

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: name.trim(),
        slug: computedSlug,
        sku: sku.toUpperCase().trim(),
        description: description || '',
        images: images || [],
        category_id: category_id || null,
        variants: variants || [],         // Structural JSONB variants tracking grid mapping
        bullet_points: bullet_points || [], // Kostume County specifications matching setup
        model_info: model_info || {},       // Formatted JSONB metadata metrics block
        price: parseFloat(price),
        cost_price: parseFloat(cost_price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        is_featured: !!is_featured,
        is_bestseller: !!is_bestseller,
        is_new_arrival: is_new_arrival !== undefined ? !!is_new_arrival : true,
        is_hidden: !!is_hidden,
        tags: tags || []
      }])
      .select('*')
      .single();

    if (error) throw error;
    
    return res.status(201).json({ 
      success: true, 
      message: 'New design successfully initialized within apparel system matrix.', 
      product: data 
    });
  } catch (err) { 
    next(err); 
  }
};

// 4. Admin Module: Edit / Modify System Parameters and Overrides Safely
exports.adminUpdateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatePayload = req.body;
    
    const sanitizedPayload = {};
    
    // Explicit string formatting sanitizations mapping values array hooks
    if (updatePayload.name !== undefined) {
      sanitizedPayload.name = updatePayload.name.trim();
      if (!updatePayload.slug) sanitizedPayload.slug = generateCleanSlug(updatePayload.name);
    }
    if (updatePayload.slug !== undefined) sanitizedPayload.slug = generateCleanSlug(updatePayload.slug);
    if (updatePayload.sku !== undefined) sanitizedPayload.sku = updatePayload.sku.toUpperCase().trim();
    if (updatePayload.description !== undefined) sanitizedPayload.description = updatePayload.description;

    // Direct string numeric conversions metrics
    if (updatePayload.price !== undefined) sanitizedPayload.price = parseFloat(updatePayload.price);
    if (updatePayload.cost_price !== undefined) sanitizedPayload.cost_price = parseFloat(updatePayload.cost_price);
    if (updatePayload.discount_price !== undefined) {
      sanitizedPayload.discount_price = updatePayload.discount_price ? parseFloat(updatePayload.discount_price) : null;
    }

    // Explicit bool conditions enforcement flags mappings
    if (updatePayload.is_featured !== undefined) sanitizedPayload.is_featured = !!updatePayload.is_featured;
    if (updatePayload.is_bestseller !== undefined) sanitizedPayload.is_bestseller = !!updatePayload.is_bestseller;
    if (updatePayload.is_new_arrival !== undefined) sanitizedPayload.is_new_arrival = !!updatePayload.is_new_arrival;
    if (updatePayload.is_hidden !== undefined) sanitizedPayload.is_hidden = !!updatePayload.is_hidden;

    // Relational arrays object properties allocation
    if (updatePayload.images !== undefined) sanitizedPayload.images = updatePayload.images;
    if (updatePayload.variants !== undefined) sanitizedPayload.variants = updatePayload.variants;
    if (updatePayload.bullet_points !== undefined) sanitizedPayload.bullet_points = updatePayload.bullet_points;
    if (updatePayload.model_info !== undefined) sanitizedPayload.model_info = updatePayload.model_info;
    if (updatePayload.tags !== undefined) sanitizedPayload.tags = updatePayload.tags;
    if (updatePayload.category_id !== undefined) sanitizedPayload.category_id = updatePayload.category_id || null;

    sanitizedPayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(sanitizedPayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Catalog record mutations executed successfully.', 
      product: data 
    });
  } catch (err) { 
    next(err); 
  }
};

// 5. Admin Module: Purge / Hard Delete Specified Inventory Entry Matrix
exports.adminDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Product profile permanently deleted from server registries.' 
    });
  } catch (err) { 
    next(err); 
  }
};

// 6. Admin Module: Master Full Catalog Fetching for Admin Grid System
exports.adminGetFullCatalog = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) { 
    next(err); 
  }
};

// 2b. Fetch single product by numeric id (public)
exports.getProductDetailById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('id', id)
      .eq('is_hidden', false)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Requested product cannot be found.'
      });
    }
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
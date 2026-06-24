const { supabase } = require('../config/db');

// ====================================================================
// 🛠️ INTERNAL HELPER MATRIX LAYER
// ====================================================================
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
// 👥 CLIENT FACING OPERATIONS (PUBLIC CATALOG CHANNELS)
// ====================================================================

// 1. Fetch filtered and sorted products for frontend catalog viewports
exports.getPublicProducts = async (req, res, next) => {
  try {
    const { category, sort, minPrice, maxPrice, isFeatured, isNewArrival } = req.query;
    
    // Explicit selection ignores internal parameters like cost_price for security leaks
    let queryBuilder = supabase
      .from('products')
      .select('id, name, slug, sku, description, images, price, discount_price, variants, bullet_points, model_info, is_featured, is_bestseller, is_new_arrival')
      .eq('is_hidden', false);

    // Apply strict schema filters natively
    if (category) queryBuilder = queryBuilder.eq('category_id', category);
    if (isFeatured) queryBuilder = queryBuilder.eq('is_featured', isFeatured === 'true');
    if (isNewArrival) queryBuilder = queryBuilder.eq('is_new_arrival', isNewArrival === 'true');
    if (minPrice) queryBuilder = queryBuilder.gte('price', Number(minPrice));
    if (maxPrice) queryBuilder = queryBuilder.lte('price', Number(maxPrice));

    // Haute Couture catalog index sorting management
    if (sort === 'price-low-high') {
      queryBuilder = queryBuilder.order('price', { ascending: true });
    } else if (sort === 'price-high-low') {
      queryBuilder = queryBuilder.order('price', { ascending: false });
    } else if (sort === 'bestseller') {
      queryBuilder = queryBuilder.order('is_bestseller', { ascending: false });
    } else {
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
    }

    const { data: products, error } = await queryBuilder;
    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: products.length,
      products: products
    });
  } catch (err) { next(err); }
};

// 2. 🔥 MASTER DISPATCHER: Resolves polymorphic queries cleanly by parsing alphanumeric identifiers
exports.getProductDetailMasterDispatcher = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Verification parameter identifier is mandatory.' });
    }

    // 🛡️ REGEX GUARD: Route decision based on pure numerical string match criteria
    const isNumericId = /^\d+$/.test(identifier);

    if (isNumericId) {
      console.log(`[ATELIER ENGINE]: Resolving details via numeric database key row: ${identifier}`);
      
      const { data: product, error } = await supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .eq('id', Number(identifier))
        .eq('is_hidden', false)
        .maybeSingle();

      if (error) return next(error);
      if (!product) return res.status(404).json({ success: false, message: 'Product silhouette not mapped by ID reference.' });
      
      return res.status(200).json({ success: true, product: product });

    } else {
      console.log(`[ATELIER ENGINE]: Resolving details via semantic slug text string: ${identifier}`);
      
      const { data: product, error } = await supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .eq('slug', identifier.toLowerCase().trim())
        .eq('is_hidden', false)
        .maybeSingle();

      if (error) return next(error);
      if (!product) return res.status(404).json({ success: false, message: 'Product silhouette not mapped by Slug reference.' });
      
      return res.status(200).json({ success: true, product: product });
    }
  } catch (err) { next(err); }
};


// ====================================================================
// 👑 ADMINISTRATIVE CRM MODULES (SECURED EXECUTIVE CONTROL PANEL)
// ====================================================================

// 3. Admin Module: Instantiate brand new garment profile entry nodes
exports.adminCreateProduct = async (req, res, next) => {
  try {
    const { 
      name, slug, sku, description, images, category_id, variants, 
      bullet_points, model_info, price, cost_price, discount_price, 
      is_featured, is_bestseller, is_new_arrival, is_hidden, tags 
    } = req.body;

    if (!name || !sku || !price || !cost_price) {
      return res.status(400).json({
        success: false,
        message: "Mandatory system entries missing. Provide Name, SKU, Price, and Cost Price configurations."
      });
    }

    const computedSlug = slug ? generateCleanSlug(slug) : generateCleanSlug(name);

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([{
        name: name.trim(),
        slug: computedSlug,
        sku: sku.toUpperCase().trim(),
        description: description || '',
        images: images || [],
        category_id: category_id ? parseInt(category_id) : null,
        variants: variants || [],          // Ingests array-objects into PostgreSQL JSONB block natively
        bullet_points: bullet_points || [], // Custom technical descriptions array
        model_info: model_info || {},       // Height, wear sizes matrix
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
      message: 'New couture layout blueprint successfully saved onto ledger registries.', 
      product: newProduct 
    });
  } catch (err) { next(err); }
};

// 4. Admin Module: Execute isolated mutations changes across existing products properties
exports.adminUpdateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatePayload = req.body;
    
    const sanitizedPayload = {};
    
    // Type casting and sanitization matrix alignments
    if (updatePayload.name !== undefined) {
      sanitizedPayload.name = updatePayload.name.trim();
      if (!updatePayload.slug) sanitizedPayload.slug = generateCleanSlug(updatePayload.name);
    }
    if (updatePayload.slug !== undefined) sanitizedPayload.slug = generateCleanSlug(updatePayload.slug);
    if (updatePayload.sku !== undefined) sanitizedPayload.sku = updatePayload.sku.toUpperCase().trim();
    if (updatePayload.description !== undefined) sanitizedPayload.description = updatePayload.description;

    if (updatePayload.price !== undefined) sanitizedPayload.price = parseFloat(updatePayload.price);
    if (updatePayload.cost_price !== undefined) sanitizedPayload.cost_price = parseFloat(updatePayload.cost_price);
    if (updatePayload.discount_price !== undefined) {
      sanitizedPayload.discount_price = updatePayload.discount_price ? parseFloat(updatePayload.discount_price) : null;
    }

    if (updatePayload.is_featured !== undefined) sanitizedPayload.is_featured = !!updatePayload.is_featured;
    if (updatePayload.is_bestseller !== undefined) sanitizedPayload.is_bestseller = !!updatePayload.is_bestseller;
    if (updatePayload.is_new_arrival !== undefined) sanitizedPayload.is_new_arrival = !!updatePayload.is_new_arrival;
    if (updatePayload.is_hidden !== undefined) sanitizedPayload.is_hidden = !!updatePayload.is_hidden;

    if (updatePayload.images !== undefined) sanitizedPayload.images = updatePayload.images;
    if (updatePayload.variants !== undefined) sanitizedPayload.variants = updatePayload.variants;
    if (updatePayload.bullet_points !== undefined) sanitizedPayload.bullet_points = updatePayload.bullet_points;
    if (updatePayload.model_info !== undefined) sanitizedPayload.model_info = updatePayload.model_info;
    if (updatePayload.tags !== undefined) sanitizedPayload.tags = updatePayload.tags;
    if (updatePayload.category_id !== undefined) sanitizedPayload.category_id = updatePayload.category_id ? parseInt(updatePayload.category_id) : null;

    sanitizedPayload.updated_at = new Date().toISOString();

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(sanitizedPayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Garment profile structural attributes updated successfully.', 
      product: updatedProduct 
    });
  } catch (err) { next(err); }
};

// 5. Admin Module: Hard purge permanent deletion parameters from relational schema entries
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
      message: 'Design asset blueprint wiped completely from storage server nodes.' 
    });
  } catch (err) { next(err); }
};

// 6. Admin Module: Master query pull fetches unhidden & hidden elements parameters for dashboard table
exports.adminGetFullCatalog = async (req, res, next) => {
  try {
    const { data: fullCatalog, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({
      success: true,
      count: fullCatalog.length,
      catalog: fullCatalog
    });
  } catch (err) { next(err); }
};

// ====================================================================
// 🎯 PUBLIC: FETCH SINGLE PRODUCT BY DIRECT NUMERIC DATABASE ID
// ====================================================================
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`[ATELIER ENGINE]: Querying database blueprints for item ID: ${id}`);

    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error("❌ [SUPABASE ID QUERY FAULT]:", error.message);
      return next(error);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Garment blueprint footprint not found." });
    }

    return res.status(200).json({
      success: true,
      product: product
    });
  } catch (err) { next(err); }
};
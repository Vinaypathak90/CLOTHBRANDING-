const { supabase } = require('../config/db');

// ====================================================================
// 1. ADD / INSERT ITEM TO SHOPPING BAG (Persists directly in DB)
// ====================================================================
exports.addToCart = async (req, res, next) => {
  try {
    // 🔥 SMART PARSER: Frontend chahe 'productId' bheje ya 'product_id', yeh dono samajh lega
    const productId = req.body.productId || req.body.product_id || req.body.id;
    // Agar frontend size bhejna bhool jaye, toh by default 'Standard' set kar dega
    const size = req.body.size || req.body.selected_size || 'Standard';
    const quantity = req.body.quantity || 1;
    
    const userId = req.user.id; 

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID is missing." 
      });
    }

    // Check if the exact product with the exact size already exists
    const { data: existingItem, error: checkError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('selected_size', size)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingItem) {
      const computedQuantity = existingItem.quantity + Number(quantity);
      
      const { data, error: updateError } = await supabase
        .from('cart')
        .update({ quantity: computedQuantity })
        .eq('id', existingItem.id)
        .select('*')
        .single();

      if (updateError) throw updateError;
      return res.status(200).json({ success: true, action: 'updated', data });
    } else {
      const { data, error: insertError } = await supabase
        .from('cart')
        .insert([{ 
          user_id: userId, 
          product_id: productId, 
          selected_size: size, 
          quantity: Number(quantity) 
        }])
        .select('*')
        .single();

      if (insertError) throw insertError;
      return res.status(201).json({ success: true, action: 'inserted', data });
    }
  } catch (err) { 
    next(err); 
  }
};

// ====================================================================
// 2. DYNAMIC QUANTITY MODIFIER (+ / - Counters Sync Engine)
// ====================================================================
exports.updateQuantity = async (req, res, next) => {
  try {
    // 🔥 FIXED: Getting cartItemId from URL parameters and quantity from body
    const { cartItemId } = req.params;
    const newQuantity = req.body.quantity || req.body.newQuantity;
    const userId = req.user.id;

    if (Number(newQuantity) <= 0) {
      // If quantity drops to zero, invoke instant structural clean purge operation
      const { error: purgeError } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', userId);

      if (purgeError) throw purgeError;
      return res.status(200).json({ success: true, action: 'deleted', message: "Item purged from registry." });
    }

    // Otherwise, override the entity row with new count values
    const { data, error: updateError } = await supabase
      .from('cart')
      .update({ quantity: Number(newQuantity) })
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (updateError) throw updateError;
    return res.status(200).json({ success: true, action: 'quantity_changed', data });
  } catch (err) { 
    next(err); 
  }
};

// ====================================================================
// 3. HARD REMOVE / PURGE SINGLE ROW ENTRY
// ====================================================================
exports.removeFromCart = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId);

    if (error) throw error;
    return res.status(200).json({ success: true, message: "Design silhouette wiped out from active bag." });
  } catch (err) { 
    next(err); 
  }
};

// ====================================================================
// 4. HYDRATE CART VIEW (Dynamic Relational Join Pulling Names, Prices, Images)
// ====================================================================
exports.getUserCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 🔥 DYNAMIC JOIN: Fetching items row and fetching matching product data structures dynamically
    const { data, error } = await supabase
      .from('cart')
      .select('id, quantity, selected_size, created_at, products(id, name, slug, price, category_id, images, variants)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Fallback safe return in case DB join fails (prevents 500 error frontend crash)
    if (error) {
      console.warn("Cart Join Warning:", error.message);
      return res.status(200).json({ success: true, data: [] });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) { 
    console.error("[CART FETCH ERROR]:", err);
    return res.status(200).json({ success: true, data: [] });
  }
};

// ====================================================================
// 5. GUEST CART SYNC (Prevents 404 Error on User Login)
// ====================================================================
exports.syncGuestCart = async (req, res, next) => {
  try {
    // Yeh frontend ko crash hone se bachayega jab user login karega
    return res.status(200).json({ 
      success: true, 
      message: "Guest cart sync bypassed safely." 
    });
  } catch (error) {
    next(error);
  }
};
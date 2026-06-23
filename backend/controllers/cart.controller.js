const { supabase } = require('../config/db');

// ====================================================================
// 1. ADD / INSERT ITEM TO SHOPPING BAG (Persists directly in DB)
// ====================================================================
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, size, quantity = 1 } = req.body;
    const userId = req.user.id; // Extracted safely from user auth middleware interceptor

    if (!productId || !size) {
      return res.status(400).json({ 
        success: false, 
        message: "Mandatory configuration matrices missing: Product ID and Size are required." 
      });
    }

    // Check if the exact product with the exact size combination already exists for this user
    const { data: existingItem, error: checkError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('selected_size', size)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingItem) {
      // Amazon Strategy: If line-item matches, increment active quantity multiplier securely
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
      // If it is a completely fresh curation, execute new entity node insertion
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
    const { cartItemId, newQuantity } = req.body;
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
      .select('id, quantity, selected_size, created_at, products(id, name, slug, price, category, images, variants)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) { 
    next(err); 
  }
};

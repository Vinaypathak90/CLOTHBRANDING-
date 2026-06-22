const { supabase } = require('../config/db');

// 1. TOGGLE WISHLIST (Add / Remove)
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id; // Assuming req.user is populated by your auth middleware

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is mandatory." });
    }

    // Check if item already exists in user's wishlist
    const { data: existing, error: checkError } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // If exists -> REMOVE (Unlike)
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (deleteError) throw deleteError;
      return res.status(200).json({ success: true, action: 'removed', message: "Removed from wishlist." });
    } else {
      // If not exists -> ADD (Like)
      const { data: insertData, error: insertError } = await supabase
        .from('wishlist')
        .insert([{ user_id: userId, product_id: productId }])
        .select('*, products(*)')
        .single();

      if (insertError) throw insertError;
      return res.status(201).json({ success: true, action: 'added', message: "Added to wishlist.", data: insertData.products });
    }
  } catch (err) { next(err); }
};

// 2. FETCH ALL WISHLIST PRODUCTS FOR ACTIVE USER
exports.getUserWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id, products(*)')
      .eq('user_id', userId);

    if (error) throw error;

    // Flatten array to send direct clean product profiles
    const cleanProducts = data.map(item => item.products);
    return res.status(200).json({ success: true, data: cleanProducts });
  } catch (err) { next(err); }
};

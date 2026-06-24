const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node module for secure standard UUID validation
const { supabase } = require('../config/db');

// ====================================================================
// 🟩 1. TOGGLE WISHLIST (Handles Clients & Anonymous Guests Safely)
// ====================================================================
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId, guestUuid } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product verification ID is mandatory." });
    }

    let userId = null;
    let isGuest = true;

    // 1. Identify Authorization State (Check if Client Token exists)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwtSecret = process.env.JWT_SECRET || 'preeti_haute_couture_secret_matrix_2026';
        const decoded = jwt.verify(token, jwtSecret);
        
        if (decoded && (decoded.id || decoded._id)) {
          userId = decoded.id || decoded._id;
          isGuest = false;
        }
      } catch (tokenErr) {
        console.log("ℹ️ [WISHLIST ENGINE]: Invalid token parsed. Falling back to Guest tracking channels.");
      }
    }

    // 2. If no valid client session token found, handle Guest fingerprinting
    if (isGuest) {
      let clientGuestId = req.headers['x-guest-uuid'] || guestUuid;

      if (!clientGuestId || clientGuestId === 'undefined' || clientGuestId === 'null') {
        clientGuestId = crypto.randomUUID(); 
      }
      userId = clientGuestId;
    }

    // 3. Absolute Validation check before touching Supabase to prevent typecast crashes
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      userId = crypto.randomUUID(); 
    }

    console.log(`[WISHLIST ACTION]: Toggle request for User Matrix Pointer: ${userId} (Guest Status: ${isGuest})`);

    // Check database tracking registry for an existing record mapping
    const { data: existing, error: checkError } = await supabase
      .from('wishlist')
      .select('id') // Optimization: Only select ID instead of *
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Match found -> Proceed to REMOVE allocation entry node safely
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (deleteError) throw deleteError;
      
      return res.status(200).json({ 
        success: true, 
        action: 'removed', 
        message: "Resource removed from curation board.",
        guestUuid: isGuest ? userId : undefined 
      });
    } else {
      // Insert smoothly without forcing dynamic PostgREST nested joins inside write loop
      const { error: insertError } = await supabase
        .from('wishlist')
        .insert([{ user_id: userId, product_id: productId }]);

      if (insertError) throw insertError;

      // SECURE QUERY: Query product table independently to maintain absolute server stability
      const { data: productData, error: productFetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (productFetchError) {
        console.warn("⚠️ [WISHLIST ENGINE]: Row written but product details query skipped:", productFetchError.message);
      }
      
      return res.status(201).json({ 
        success: true, 
        action: 'added', 
        message: "Resource mapped onto curation matrix.", 
        data: productData || { id: productId }, 
        guestUuid: isGuest ? userId : undefined
      });
    }
  } catch (err) { 
    console.error("🚨 [WISHLIST CRITICAL FAULT]:", err.message);
    next(err); 
  }
};

// ====================================================================
// 🟩 2. FETCH WISHLIST PAYLOADS (Client Session / Guest Header Sync)
// ====================================================================
exports.getUserWishlist = async (req, res, next) => {
  try {
    let userId = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'preeti_haute_couture_secret_matrix_2026');
        userId = decoded.id || decoded._id;
      } catch (err) {}
    }

    if (!userId) {
      userId = req.headers['x-guest-uuid'] || req.query.guestUuid;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!userId || userId === 'undefined' || userId === 'null' || !uuidRegex.test(userId)) {
      return res.status(200).json({ success: true, count: 0, wishlist: [] });
    }

    console.log(`[ATELIER ENGINE]: Extracting curation matrix grid logs for registry target: ${userId}`);

    // 🔥 THE 500 ERROR FIX: Explicit column selection inside the join relation
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id, 
        created_at, 
        product_id, 
        products (
          id, name, price, discount_price, images, slug
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error("❌ [SUPABASE WISHLIST LOGS ERROR]:", error.message);
      return next(error);
    }

    return res.status(200).json({ 
      success: true, 
      count: data.length,
      wishlist: data 
    });
  } catch (err) { 
    next(err); 
  }
};

// ====================================================================
// 🟩 3. SYNC GUEST WISHLIST TO USER ACCOUNT (Post-Login Merge)
// ====================================================================
exports.syncWishlist = async (req, res, next) => {
  try {
    const { guestUuid } = req.body;
    
    // Safety checks: We need both the logged-in user and the old guest ID
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized. Valid user session required to sync." });
    }
    
    const userId = req.user.id;

    if (!guestUuid || guestUuid === 'undefined' || guestUuid === 'null') {
      return res.status(200).json({ success: true, message: "No guest data to sync." });
    }

    console.log(`[WISHLIST SYNC]: Merging records from Guest(${guestUuid}) -> User(${userId})`);

    // Transfer ownership of all wishlist items from the Guest ID to the User ID
    const { error } = await supabase
      .from('wishlist')
      .update({ user_id: userId })
      .eq('user_id', guestUuid);

    if (error) {
      console.error("❌ [SUPABASE SYNC FAULT]:", error.message);
      // Even if it fails (e.g., duplicate constraints), we catch it smoothly so the user logs in fine
      return res.status(200).json({ success: false, message: "Partial sync failure due to constraints.", details: error.message });
    }

    return res.status(200).json({ success: true, message: "Guest wishlist synced successfully to permanent account." });
  } catch (err) { 
    next(err); 
  }
};
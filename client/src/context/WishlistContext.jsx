import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; 

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Helper utility to dynamically compute defensive request headers configuration vectors
  const getRequestConfig = () => {
    const config = { headers: {} };
    const guestId = localStorage.getItem('gst_wish_id');
    if (guestId && guestId !== 'undefined' && guestId !== 'null') {
      config.headers['x-guest-uuid'] = guestId;
    }
    return config;
  };

  // 1. Fetch entire wishlist dynamically for both verified clients & guests
  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('usr_tk') || localStorage.getItem('adm_tk');
      const guestId = localStorage.getItem('gst_wish_id');
      
      // Dynamic query payload binding parameters setup
      let urlPath = '/wishlist/my-list';
      if (!token && guestId) {
        urlPath += `?guestUuid=${guestId}`;
      }

      const res = await axiosInstance.get(urlPath, getRequestConfig());
      
      if (res.data?.success && Array.isArray(res.data.wishlist)) {
        // Normalize the database structures layout array down to standalone product vectors cleanly
        const normalizedProducts = res.data.wishlist
          .map(item => item.products || item.product)
          .filter(Boolean);
        
        setWishlistItems(normalizedProducts);
      }
    } catch (err) {
      console.error("❌ [WISHLIST CONTEXT FETCH FAULT]: Centralized sync ledger execution failed:", err);
      
      // Standalone safe backup: Fallback to local storage if API node throws structural network errors
      const backupStored = localStorage.getItem('local_wishlist');
      if (backupStored) {
        try { setWishlistItems(JSON.parse(backupStored)); } catch (e) { setWishlistItems([]); }
      }
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // 2. Main Toggle Action Handler Map (Supports full object payloads or numerical IDs seamlessly)
  const toggleWishlist = async (productOrId) => {
    if (!productOrId) return;

    let productId;
    let productObj = null;

    if (typeof productOrId === 'object') {
      productObj = productOrId;
      productId = productOrId.id || productOrId._id;
    } else {
      productId = productOrId;
    }

    if (!productId) return;

    try {
      const currentGuestId = localStorage.getItem('gst_wish_id');
      const payloadBody = { 
        productId, 
        guestUuid: currentGuestId !== 'undefined' ? currentGuestId : null 
      };

      const res = await axiosInstance.post('/wishlist/toggle', payloadBody, getRequestConfig());

      if (res.data?.success) {
        // 🛡️ SECURITY MEMORY LAYER HANDSHAKE: If server assigned a new tracking UUID vector, lock it instantly
        if (res.data?.guestUuid) {
          localStorage.setItem('gst_wish_id', res.data.guestUuid);
        }

        if (res.data.action === 'added') {
          // Explicit target append mutation logic execution
          const targetItemToAdd = productObj || res.data.data || { id: productId };
          
          setWishlistItems((prev) => {
            const exists = prev.some(i => String(i.id || i._id) === String(productId));
            if (exists) return prev;
            const updated = [...prev, targetItemToAdd];
            localStorage.setItem('local_wishlist', JSON.stringify(updated));
            return updated;
          });
        } else {
          // Explicit remove allocation sequence loop trigger
          setWishlistItems((prev) => {
            const updated = prev.filter(item => String(item.id || item._id) !== String(productId));
            localStorage.setItem('local_wishlist', JSON.stringify(updated));
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("❌ [WISHLIST CONTEXT TOGGLE FAULT]: Mutation sequence loop failed. Deploying local state fallback updates:", err);
      
      // OPTIMISTIC LOCAL DESCENT RECOVERY: Keeps app interactive even if remote engine drops connection
      const itemExists = wishlistItems.some(i => String(i.id || i._id) === String(productId));
      setWishlistItems((prev) => {
        let nextState;
        if (itemExists) {
          nextState = prev.filter(item => String(item.id || item._id) !== String(productId));
        } else {
          const fallbackPlaceholder = productObj ? productObj : { id: productId };
          nextState = [...prev, fallbackPlaceholder];
        }
        localStorage.setItem('local_wishlist', JSON.stringify(nextState));
        return nextState;
      });
    }
  };

  // 3. Status Watcher: String comparison check layer mapping values safely across frameworks layout monitors
  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistItems.some(item => String(item.id || item._id) === String(productId));
  };

  
  return (
    <WishlistContext.Provider value={{ 
      wishlist: wishlistItems, 
      wishlistCount: wishlistItems.length, 
      toggleWishlist, 
      isInWishlist,
      refreshWishlist: fetchWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
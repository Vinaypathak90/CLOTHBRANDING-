import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; 

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // 1. Fetch entire wishlist on mount securely
  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('usr_tk') || localStorage.getItem('adm_tk');
      if (!token) {
        // Load local wishlist when user is not authenticated
        const stored = localStorage.getItem('local_wishlist');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setWishlistItems(parsed);
          } catch (e) {
            setWishlistItems([]);
          }
        }
        return;
      }

      const res = await axiosInstance.get('/wishlist/my-list');
      if (res.data.success) {
        setWishlistItems(res.data.data);
      }
    } catch (err) {
      console.error("Error retrieving wishlist via centralized registry:", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Accept either a full product object or a productId (string/number)
  const toggleWishlist = async (productOrId) => {
    if (!productOrId) return;

    // Normalize to productId and optional product object
    let productId;
    let productObj = null;

    if (typeof productOrId === 'object') {
      productObj = productOrId;
      productId = productOrId.id || productOrId._id;
    } else {
      productId = productOrId;
    }

    if (!productId) return;

    // If user is not authenticated, use localStorage-backed wishlist (local UX)
    const token = localStorage.getItem('usr_tk') || localStorage.getItem('adm_tk');
    if (!token) {
      const itemExists = wishlistItems.some(i => String(i.id || i._id) === String(productId));
      if (itemExists) {
        // remove locally
        setWishlistItems((prev) => {
          const next = prev.filter(item => String(item.id || item._id) !== String(productId));
          localStorage.setItem('local_wishlist', JSON.stringify(next));
          return next;
        });
        return;
      } else {
        const toAdd = productObj ? productObj : { id: productId };
        setWishlistItems((prev) => {
          const next = [...prev, toAdd];
          localStorage.setItem('local_wishlist', JSON.stringify(next));
          return next;
        });
        return;
      }
    }

    try {
      const res = await axiosInstance.post('/wishlist/toggle', { productId });

      if (res.data.success) {
        if (res.data.action === 'added') {
          // If we have the full product object use it; otherwise create a minimal placeholder with id
          if (productObj) {
            setWishlistItems((prev) => {
              if (prev.some(i => String(i.id) === String(productId) || String(i._id) === String(productId))) return prev;
              return [...prev, productObj];
            });
          } else {
            // fetch full product details from server by id to populate UI
            try {
              const prodRes = await axiosInstance.get(`/products/detail-by-id/${productId}`);
              const fetched = prodRes.data;
              const itemToAdd = fetched ? fetched : { id: productId };
              setWishlistItems((prev) => {
                if (prev.some(i => String(i.id) === String(productId) || String(i._id) === String(productId))) return prev;
                return [...prev, itemToAdd];
              });
            } catch (fetchErr) {
              // fallback to minimal placeholder if fetch fails
              setWishlistItems((prev) => {
                if (prev.some(i => String(i.id) === String(productId) || String(i._id) === String(productId))) return prev;
                return [...prev, { id: productId }];
              });
            }
          }
        } else {
          setWishlistItems((prev) => prev.filter(item => String(item.id || item._id) !== String(productId)));
        }
      }
    } catch (err) {
      console.error("Failed to toggle wishlist item:", err);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => Number(item.id) === Number(productId));
  };

  return (
    <WishlistContext.Provider value={{ wishlist: wishlistItems, wishlistCount: wishlistItems.length, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
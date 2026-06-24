import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axiosInstance from '../api/axiosInstance';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { currentUser } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // ==========================================
  // 🔄 INITIAL LOAD: HYDRATE BROWSER CORDILLERA
  // ==========================================
  useEffect(() => {
    const hydrateCart = async () => {
      if (currentUser) {
        // CASE A: User Logged In -> Database Manifest Sync
        try {
          setIsCartLoading(true);
          const res = await axiosInstance.get('/cart/my-cart');
          if (res.data.success) {
            setCartItems(res.data.cart || []);
          }
        } catch (err) {
          console.error("❌ [CART FETCH ERROR]:", err);
        } finally {
          // 🔥 FIXED: Changed the broken brackets to a clean finally block
          setIsCartLoading(false);
        }
      } else {
        // CASE B: Guest Mode -> Instant LocalStorage Pipeline Recovery
        try {
          const localCart = localStorage.getItem('guest_cart');
          const parsedCart = localCart ? JSON.parse(localCart) : [];
          console.log("📦 [GUEST CART HYDRATE]: Recovered items from browser memory:", parsedCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        } catch (err) {
          console.error("❌ [LOCAL CART PARSE FAULT]:", err);
          setCartItems([]);
        }
      }
    };

    hydrateCart();
  }, [currentUser]);

  // ==========================================
  // ⚡ AUTOMATIC GUEST TO AUTH USER MERGE
  // ==========================================
  useEffect(() => {
    const syncGuestCartToBackend = async () => {
      if (currentUser) {
        const localCart = localStorage.getItem('guest_cart');
        if (localCart) {
          try {
            const parsedLocalCart = JSON.parse(localCart);
            if (Array.isArray(parsedLocalCart) && parsedLocalCart.length > 0) {
              console.log("🔄 [CART MERGE SYNC]: Migrating guest items into active DB account...");
              await axiosInstance.post('/cart/sync-guest-cart', { items: parsedLocalCart });
              
              const res = await axiosInstance.get('/cart/my-cart');
              if (res.data.success) {
                setCartItems(res.data.cart || []);
              }
              localStorage.removeItem('guest_cart'); // Flush memory after safe ingestion
            }
          } catch (err) {
            console.error("❌ [CART SYNC ERROR]:", err);
          }
        }
      }
    };

    syncGuestCartToBackend();
  }, [currentUser]);

  // ==========================================
  // 📦 CORE DEFENSIVE OPERATIONS
  // ==========================================
  
  // 1. Unbreakable Add to Cart Engine
  const addToCart = async (product, variantId = null, quantity = 1) => {
    if (!product) {
      console.error("❌ [CART ENGINE REJECTED]: Product parameter is undefined.");
      return;
    }

    // Defensive check to extract identification keys universally
    const targetProductId = product.id || product._id || product.product_id;
    
    if (!targetProductId) {
      console.error("❌ [CART SCHEMA CRITICAL]: Cannot extract product identification token.", product);
      return;
    }

    if (currentUser) {
      // Authenticated User Network Post
      try {
        const res = await axiosInstance.post('/cart/add', { productId: targetProductId, variantId, quantity });
        if (res.data.success) setCartItems(res.data.cart);
      } catch (err) { console.error("❌ [DB ADD ERROR]:", err); }
    } else {
      // Guest Local Storage Engine Execution
      console.log("🎯 [GUEST INTERACTION]: Adding item to local storage ledger...", product);
      
      setCartItems((prevItems) => {
        const safePrevItems = Array.isArray(prevItems) ? prevItems : [];
        
        const existingItemIndex = safePrevItems.findIndex(
          (item) => item.product_id === targetProductId && item.variant_id === variantId
        );

        let updatedItems = [...safePrevItems];
        if (existingItemIndex > -1) {
          updatedItems[existingItemIndex].quantity += quantity;
        } else {
          updatedItems.push({
            id: `guest-${Date.now()}-${Math.random()}`,
            product_id: targetProductId,
            variant_id: variantId,
            quantity: quantity,
            // 🔥 THE DEFENSIVE MASTER TRICK: Injects both singular and plural mapping anchors
            product: product, 
            products: product 
          });
        }
        
        localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
        console.log("✅ [GUEST CART STORAGE WRITTEN]: Current items status:", updatedItems);
        return updatedItems;
      });
    }
  };

  // 2. Remove Product Hook
  const removeFromCart = async (cartItemId) => {
    if (currentUser) {
      try {
        const res = await axiosInstance.delete(`/cart/remove/${cartItemId}`);
        if (res.data.success) setCartItems(res.data.cart);
      } catch (err) { console.error(err); }
    } else {
      setCartItems((prevItems) => {
        const safePrevItems = Array.isArray(prevItems) ? prevItems : [];
        const updatedItems = safePrevItems.filter(item => item.id !== cartItemId);
        localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
        return updatedItems;
      });
    }
  };

  // 3. Update Quantity Controller
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (currentUser) {
      try {
        const res = await axiosInstance.put(`/cart/update/${cartItemId}`, { quantity: newQuantity });
        if (res.data.success) setCartItems(res.data.cart);
      } catch (err) { console.error(err); }
    } else {
      setCartItems((prevItems) => {
        const safePrevItems = Array.isArray(prevItems) ? prevItems : [];
        const updatedItems = safePrevItems.map(item => 
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
        return updatedItems;
      });
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, isCartLoading, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}
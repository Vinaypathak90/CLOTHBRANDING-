import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axiosInstance from '../api/axiosInstance';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { currentUser } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // ==========================================
  // 🔄 UTILITY: FETCH LIVE CART FROM DATABASE
  // ==========================================
  const fetchUserCart = async () => {
    try {
      setIsCartLoading(true);
      const res = await axiosInstance.get('/cart/my-cart');
      console.log("📥 [CART FETCH SUCCESS]: Live cart synchronized from database:", res.data);
      if (res.data.success) {
        // Backend maps it as res.data.cart or res.data.data depending on configuration
        setCartItems(res.data.cart || res.data.data || []);
      }
    } catch (err) {
      console.error("❌ [CART FETCH ERROR]: Failed to synchronize live cart desk logs:", err);
    } finally {
      setIsCartLoading(false);
    }
  };

  // ==========================================
  // 🔄 INITIAL LOAD: HYDRATE BROWSER CORDILLERA
  // ==========================================
  useEffect(() => {
    const hydrateCart = async () => {
      if (currentUser) {
        // CASE A: User Logged In -> Database Sync
        await fetchUserCart();
      } else {
        // CASE B: Guest Mode -> LocalStorage Pipeline Recovery
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
              
              // Safe re-fetch loop integration to sync global ledger cleanly
              await fetchUserCart();
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
  const addToCart = async (product, sizeVariant = 'Standard', quantity = 1) => {
    console.log("🛒 [FRONTEND CART CALLED]: Input trace properties initialization:", { product, sizeVariant, quantity });

    if (!product) {
      console.error("❌ [CART ENGINE REJECTED]: Product parameter is undefined.");
      return;
    }

    // Defensive check to extract identification keys universally across structural properties
    const targetProductId = product.id || product._id || product.product_id;
    const finalSize = sizeVariant || 'Standard';
    
    if (!targetProductId) {
      console.error("❌ [CART SCHEMA CRITICAL]: Cannot extract product identification token.", product);
      return;
    }

    if (currentUser) {
      // Authenticated User Network Post API Pipe
      try {
        console.log("🌐 Sending network request payload data node to backend database...");
        const res = await axiosInstance.post('/cart/add', { 
          productId: targetProductId, 
          size: finalSize, 
          quantity 
        });
        
        console.log("🌐 Backend operation execution complete message logging details:", res.data);
        if (res.data.success) {
          // Re-fetch ensures the full detailed relational models load safely into states
          await fetchUserCart();
          alert("Item added to bag successfully!");
        }
      } catch (err) { 
        console.error("❌ [DB ADD ERROR]: Failed execution cycle validation tracking parameters:", err); 
      }
    } else {
      // Guest Local Storage Engine Execution Loop
      console.log("🎯 [GUEST INTERACTION]: Adding item to local storage ledger...", product);
      
      setCartItems((prevItems) => {
        const safePrevItems = Array.isArray(prevItems) ? prevItems : [];
        
        const existingItemIndex = safePrevItems.findIndex(
          (item) => item.product_id === targetProductId && item.selected_size === finalSize
        );

        let updatedItems = [...safePrevItems];
        if (existingItemIndex > -1) {
          updatedItems[existingItemIndex].quantity += quantity;
        } else {
          updatedItems.push({
            id: `guest-${Date.now()}-${Math.random()}`,
            product_id: targetProductId,
            selected_size: finalSize,
            quantity: quantity,
            product: product, 
            products: product 
          });
        }
        
        localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
        console.log("✅ [GUEST CART STORAGE WRITTEN]: Current items status:", updatedItems);
        alert("Item added to local bag!");
        return updatedItems;
      });
    }
  };

  // 2. Remove Product Hook
  const removeFromCart = async (cartItemId) => {
    if (currentUser) {
      try {
        const res = await axiosInstance.delete(`/cart/remove/${cartItemId}`);
        if (res.data.success) {
          await fetchUserCart();
        }
      } catch (err) { console.error("❌ [DB DELETE FAULT]:", err); }
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
        if (res.data.success) {
          await fetchUserCart();
        }
      } catch (err) { console.error("❌ [DB UPDATE FAULT]:", err); }
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
    <CartContext.Provider value={{ cartItems, isCartLoading, addToCart, removeFromCart, updateQuantity, refreshCart: fetchUserCart }}>
      {children}
    </CartContext.Provider>
  );
}
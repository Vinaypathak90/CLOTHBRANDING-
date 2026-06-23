import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // 🔥 Linked safely with your interceptor system

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotalPrice, setCartTotalPrice] = useState(0);

  // ====================================================================
  // 1. GET: FETCH & RECOMPUTE ENTIRE SHOPPING BAG FROM DATABASE
  // ====================================================================
  const fetchCart = async () => {
    // Read secure token signatures instantly from storage to avoid guest session crashes
    const activeToken = localStorage.getItem('usr_tk') || localStorage.getItem('adm_tk');
    
    // Strict Guard: If no user context token is allocated, abort to prevent 401 unauth console dumps
    if (!activeToken) {
      setCartItems([]);
      setCartCount(0);
      setCartTotalPrice(0);
      return;
    }

    try {
      // Relative routing strategy utilizing internal interceptor baseURL defaults
      const res = await axiosInstance.get('/cart/my-cart');
      
      if (res.data.success) {
        const liveItemsArray = res.data.data || [];
        setCartItems(liveItemsArray);
        
        // Dynamic Counter Aggregation: Compute physical product items dynamically from backend node entries
        const runningItemsTotal = liveItemsArray.reduce((acc, item) => acc + (item.quantity || 0), 0);
        setCartCount(runningItemsTotal);

        // Dynamic Subtotal Aggregation: Calculate active row item price x total counts live
        const runningSubtotalPrice = liveItemsArray.reduce((acc, item) => {
          const individualPrice = Number(item.products?.price || 0);
          const itemQuantity = Number(item.quantity || 0);
          return acc + (individualPrice * itemQuantity);
        }, 0);
        setCartTotalPrice(runningSubtotalPrice);
      }
    } catch (err) {
      console.error("Critical State Anomaly: Failed to hydrate user bag database nodes: ", err);
    }
  };

  // Hydrate global matrices immediately upon view initialization execution
  useEffect(() => {
    fetchCart();
  }, []);

  // ====================================================================
  // 2. POST: COMMITS FRESH PRODUCT/SIZE PARAMETERS DIRECT TO BACKEND
  // ====================================================================
  const addToCart = async (product, size, quantity = 1) => {
    if (!product || !product.id || !size) return;
    
    try {
      const res = await axiosInstance.post('/cart/add', { 
        productId: product.id, 
        size, 
        quantity 
      });
      
      if (res.data.success) {
        // Core Live Sync Re-fetch: Forces immediate recalculation of counters across navbar automatically
        await fetchCart();
      }
    } catch (err) {
      console.error("Pipeline Transmission Error: Insertion token commit failed: ", err);
    }
  };

  // ====================================================================
  // 3. POST: REALTIME QUANTITY INCREMENTS (+ / - Trigger Controls Sync)
  // ====================================================================
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (!cartItemId) return;
    
    try {
      const res = await axiosInstance.post('/cart/update-qty', { 
        cartItemId, 
        newQuantity 
      });
      
      if (res.data.success) {
        // Immediate dynamic state hydration recompute trigger
        await fetchCart();
      }
    } catch (err) {
      console.error("Modifier Pipeline Exception: Realtime value mutation crashed: ", err);
    }
  };

  // ====================================================================
  // 4. DELETE: PURGE INDIVIDUAL ELEMENT OUT OF THE SERVER REGISTRY
  // ====================================================================
  const removeItem = async (cartItemId) => {
    if (!cartItemId) return;
    
    try {
      const res = await axiosInstance.delete(`/cart/remove/${cartItemId}`);
      
      if (res.data.success) {
        // Clear interface metrics instantly upon server row cleanup validation
        await fetchCart();
      }
    } catch (err) {
      console.error("Destruction Sequence Error: Failed wiping matching schema node row: ", err);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart: cartItems, 
      cartCount, 
      cartTotalPrice, 
      addToCart, 
      updateQuantity, 
      removeItem, 
      refreshCart: fetchCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};
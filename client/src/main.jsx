import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// System Framework Global Context Providers
import { CMSProvider } from './context/CMSContext';
import { AuthProvider } from './context/AuthContext'; 
import { WishlistProvider } from './context/WishlistContext'; // 🔥 Step 1: Wishlist context repository import kiya
import { CartProvider } from './context/CartContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CMSProvider>
      <AuthProvider>
        <WishlistProvider> {/* 🔥 Step 2: Injected under Auth pipeline to capture usr_tk/adm_tk states */}
          <CartProvider>
          <App />
          </CartProvider>
          
        </WishlistProvider>
      </AuthProvider>
    </CMSProvider>
  </React.StrictMode>
);
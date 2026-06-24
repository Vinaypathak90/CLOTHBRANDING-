import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// System Framework Global Context Providers
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CMSProvider } from './context/CMSContext';
import { AuthProvider } from './context/AuthContext'; 
import { WishlistProvider } from './context/WishlistContext'; 
import { CartProvider } from './context/CartContext';

// Safe extraction layer for your Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Top level wrapper handles OAuth context safely across the app */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <CMSProvider>
        <AuthProvider>
          <WishlistProvider> 
            <CartProvider>
              
              {/* CORE APP VIEW ROUTER MATRIX */}
              <App />
              
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </CMSProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { CMSProvider } from './context/CMSContext';
import { AuthProvider } from './context/AuthContext'; // 🔥 Fixed: Path badal kar AuthContext kar diya hai

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CMSProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </CMSProvider>
  </React.StrictMode>
);
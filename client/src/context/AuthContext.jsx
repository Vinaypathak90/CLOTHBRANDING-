import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ====================================================================
  // 1. INITIAL LOAD: Hydrate session from LocalStorage
  // ====================================================================
  useEffect(() => {
    const initializeAuth = () => {
      // Safely check for both standard user and admin tokens
      const storedToken = localStorage.getItem('usr_tk') || localStorage.getItem('adm_tk');
      const storedUserData = localStorage.getItem('usr_data');

      if (storedToken && storedUserData) {
        setAuthToken(storedToken);
        setCurrentUser(JSON.parse(storedUserData));
      }
      setIsAuthLoading(false);
    };
    
    initializeAuth();
  }, []);

  // ====================================================================
  // 2. STANDARD LOGIN PIPELINE (Email & Password)
  // ====================================================================
  const loginUser = async (email, password, platform = 'shop') => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password, requestedPlatform: platform });
      
      if (res.data.success) {
        const { token, user } = res.data;
        
        // Isolate admin tokens from normal user tokens for security
        const tokenKey = user.role === 'superadmin' ? 'adm_tk' : 'usr_tk';
        localStorage.setItem(tokenKey, token);
        localStorage.setItem('usr_data', JSON.stringify(user));

        setAuthToken(token);
        setCurrentUser(user);
        
        return { success: true, user };
      }
    } catch (error) {
      // Extract exact backend error message or provide fallback
      throw error.response?.data?.message || 'Login sequence failed. Please try again.';
    }
  };

  // ====================================================================
  // 🌟 NEW: SECRET ADMIN GATE LOGIN PIPELINE
  // ====================================================================
  const adminLogin = async (email, password) => {
    try {
      // Hits the specific admin secret route you created in backend
      const res = await axiosInstance.post('/auth/admin-secret-login', { email, password });
      
      if (res.data.success) {
        const { token } = res.data;
        const adminUser = { email, role: 'superadmin', name: 'System Admin' }; // Mock user info since backend only sends token
        
        localStorage.setItem('adm_tk', token);
        localStorage.setItem('usr_data', JSON.stringify(adminUser));

        setAuthToken(token);
        setCurrentUser(adminUser);
        
        return { success: true };
      }
    } catch (error) {
      throw error.response?.data?.message || 'Admin authentication denied.';
    }
  };

  // ====================================================================
  // 3. REQUEST REGISTRATION OTP (STEP 1 - HASH SYSTEM)
  // ====================================================================
  const requestRegistrationOtp = async (email) => {
    try {
      const res = await axiosInstance.post('/auth/request-signup-otp', { email });
      if (res.data.success) {
        // 🔥 Returning the FULL data so AuthPage can store otpHash and expiry
        return res.data; 
      }
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate signup OTP.';
    }
  };

  // ====================================================================
  // 4. REGISTRATION PIPELINE (STEP 2 - VERIFY & CREATE)
  // ====================================================================
  // 🔥 Now accepts otpHash and expiry from the frontend state
  const registerUser = async (name, email, password, otp, otpHash, expiry) => {
    try {
      const res = await axiosInstance.post('/auth/register', { 
        name, email, password, otp, otpHash, expiry 
      });
      
      if (res.data.success) {
        const { token, user } = res.data;
        
        localStorage.setItem('usr_tk', token);
        localStorage.setItem('usr_data', JSON.stringify(user));

        setAuthToken(token);
        setCurrentUser(user);
        
        return { success: true, user };
      }
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed or invalid OTP.';
    }
  };

  // ====================================================================
  // 5. GOOGLE OAUTH IDENTITY SYNC
  // ====================================================================
  const syncGoogleUser = async (googleId, email, name, avatarUrl) => {
    try {
      const res = await axiosInstance.post('/auth/google-sync', { googleId, email, name, avatarUrl });
      
      if (res.data.success) {
        const { token, user } = res.data;
        
        const tokenKey = user.role === 'superadmin' ? 'adm_tk' : 'usr_tk';
        localStorage.setItem(tokenKey, token);
        localStorage.setItem('usr_data', JSON.stringify(user));

        setAuthToken(token);
        setCurrentUser(user);
        
        return { success: true, user };
      }
    } catch (error) {
      throw error.response?.data?.message || 'Google identity handshake failed.';
    }
  };

  // ====================================================================
  // 6. GLOBAL LOGOUT EXECUTION
  // ====================================================================
  const logoutUser = () => {
    localStorage.removeItem('usr_tk');
    localStorage.removeItem('adm_tk');
    localStorage.removeItem('usr_data');
    
    setAuthToken(null);
    setCurrentUser(null);
  };

  // 🔥 DYNAMIC ADMIN CHECK: Fast boolean to check if current session belongs to admin
  const isAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      authToken, 
      isAuthLoading,
      isAdmin, // 🔥 Exposed this so your Router can strictly block standard users
      loginUser, 
      adminLogin, // 🔥 Exposed secret admin login
      requestRegistrationOtp, // 🔥 Fixed: This was missing in your code!
      registerUser, 
      syncGoogleUser, 
      logoutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
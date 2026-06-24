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
  // 3. REGISTRATION PIPELINE (New User Setup)
  // ====================================================================
  const registerUser = async (name, email, password) => {
    try {
      const res = await axiosInstance.post('/auth/register', { name, email, password });
      
      if (res.data.success) {
        const { token, user } = res.data;
        
        localStorage.setItem('usr_tk', token);
        localStorage.setItem('usr_data', JSON.stringify(user));

        setAuthToken(token);
        setCurrentUser(user);
        
        return { success: true, user };
      }
    } catch (error) {
      throw error.response?.data?.message || 'Registration anomaly detected. Please try again.';
    }
  };

  // ====================================================================
  // 4. GOOGLE OAUTH IDENTITY SYNC
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
  // 5. GLOBAL LOGOUT EXECUTION
  // ====================================================================
  const logoutUser = () => {
    localStorage.removeItem('usr_tk');
    localStorage.removeItem('adm_tk');
    localStorage.removeItem('usr_data');
    
    setAuthToken(null);
    setCurrentUser(null);
  };
  // ====================================================================
  // NEW: REQUEST REGISTRATION OTP
  // ====================================================================
  const requestRegistrationOtp = async (email) => {
    try {
      const res = await axiosInstance.post('/auth/request-signup-otp', { email });
      if (res.data.success) {
        return { success: true, otp: res.data.otp };
      }
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate signup OTP.';
    }
  };
  

  // Provide all states and functions to the rest of the application
  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      authToken, 
      isAuthLoading, 
      loginUser, 
      registerUser, 
      syncGoogleUser, 
      logoutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
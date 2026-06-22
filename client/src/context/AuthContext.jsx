import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authStateLoading, setAuthStateLoading] = useState(true);

  useEffect(() => {
    // Initial runtime local storage matching validation checks
    const savedUser = localStorage.getItem('luxury_user_profile');
    const adminToken = localStorage.getItem('adm_tk');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (adminToken) setIsAdmin(true);
    }
    setAuthStateLoading(false);
  }, []);

  // Split Routing Auth Core Execution Strategy Handler
  const executeAuthenticationSession = async (email, password, requestedPlatform) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password, requestedPlatform });
      const { token, user: profileData } = res.data;

      if (requestedPlatform === 'crm') {
        localStorage.setItem('adm_tk', token);
        setIsAdmin(true);
      } else {
        localStorage.setItem('usr_tk', token);
        setIsAdmin(false);
      }

      localStorage.setItem('luxury_user_profile', JSON.stringify(profileData));
      setUser(profileData);
      return { success: true, profileData };
    } catch (error) {
      throw error.response?.data?.message || 'Authentication system processing validation fault.';
    }
  };

  const terminateSessionWindow = () => {
    localStorage.clear();
    setUser(null);
    setIsAdmin(false);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, authStateLoading, executeAuthenticationSession, terminateSessionWindow }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const CMSContext = createContext(null);

export const CMSProvider = ({ children }) => {
  const [cmsConfig, setCmsConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshCMSManifest = async () => {
    try {
      const response = await axiosInstance.get('/cms/manifest');
      setCmsConfig(response.data);
      
      // Inject primary identity accent color hex dynamically straight into Tailwind styles
      if (response.data && response.data.accent_color_hex) {
        document.documentElement.style.setProperty('--primary-accent', response.data.accent_color_hex);
      }
    } catch (err) {
      console.error("Critical failure during live CMS system hydration flow: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCMSManifest();
  }, []);

  return (
    <CMSContext.Provider value={{ cmsConfig, refreshCMSManifest, loading }}>
      {children}
    </CMSContext.Provider>
  );
};

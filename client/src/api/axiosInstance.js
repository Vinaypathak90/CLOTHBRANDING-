import axios from 'axios';

const axiosInstance = axios.create({
  // Forced port 5002 fallback path to talk directly to our inline server
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Outbound Request Interceptor (Token Injection)
axiosInstance.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adm_tk');
    const userToken = localStorage.getItem('usr_tk');
    const activeToken = adminToken || userToken;

    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Inbound Response Interceptor (Session Expiration Watcher)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ [SECURITY CLEARANCE FAULT]: Session expired. Flushing cache.");
      localStorage.removeItem('usr_tk');
      localStorage.removeItem('adm_tk');
      localStorage.removeItem('usr_data');
      window.location.href = '/designer-studio-gate'; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
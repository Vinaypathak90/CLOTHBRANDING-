import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Real-time security authorization token injector interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if it's an admin path to use the high clearance token, else fallback to user token
    const token = localStorage.getItem('adm_tk') || localStorage.getItem('usr_tk');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
import axios from 'axios';

// ✅ VITE uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // ← CRITICAL: Send cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - REMOVED token from headers (now using cookies)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('📡 API Request:', config.method.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status);
    
    // Only redirect on 401 if the request is NOT to public endpoints
    if (error.response?.status === 401) {
      const publicEndpoints = ['/auth/login', '/auth/register'];
      const requestUrl = error.config?.url || '';
      
      // Check if the request was to a public endpoint
      const isPublicEndpoint = publicEndpoints.some(endpoint => requestUrl.includes(endpoint));
      
      // Don't redirect if it's a public endpoint
      if (!isPublicEndpoint) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
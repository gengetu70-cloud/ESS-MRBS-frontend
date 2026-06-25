import axios from 'axios';

const API_URL = 'https://ess-mrbs.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if the request is NOT to public endpoints
    if (error.response?.status === 401) {
      const publicEndpoints = ['/auth/login', '/auth/register', '/rooms'];
      const requestUrl = error.config?.url || '';
      
      // Check if the request was to a public endpoint
      const isPublicEndpoint = publicEndpoints.some(endpoint => requestUrl.includes(endpoint));
      
      // Don't redirect if it's a public endpoint (like /rooms)
      if (!isPublicEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
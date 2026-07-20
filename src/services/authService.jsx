import axiosInstance from '../api/axios';

// Login user
export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', { username, password });
    if (response.data.success) {
      // Token is automatically stored in HttpOnly cookie by backend
      // Only store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    if (response.data.success) {
      const user = response.data.user || response.data.data;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get user' };
  }
};

// Logout user
export const logout = async () => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('user');
};

// Get stored user
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is admin
export const isAdmin = () => {
  const user = getStoredUser();
  return user && user.role === 'admin';
};
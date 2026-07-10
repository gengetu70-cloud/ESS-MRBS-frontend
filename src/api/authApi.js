import axiosInstance from './axios';

// Login user
export const login = async (username, password) => {
  try {
    console.log('🔐 Attempting login for:', username);
    
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    });
    
    console.log('✅ Login response:', response.data);
    
    // FIXED: Check if response exists and handle different structures
    if (response && response.data) {
      const data = response.data;
      
      // Check if login was successful
      if (data.success === true) {
        // Store token if present
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Store user if present
        const user = data.user || data.data?.user || data.data;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return {
          success: true,
          user: user,
          token: data.token,
          message: data.message || 'Login successful',
        };
      } else {
        // Login failed but response was successful
        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }
    } else {
      // No response data
      return {
        success: false,
        message: 'No response from server',
      };
    }
  } catch (error) {
    console.error('❌ Login API error:', error);
    
    // Better error handling
    if (error.response) {
      // Server responded with error
      console.error('Server error response:', error.response.data);
      const data = error.response.data;
      return {
        success: false,
        message: data?.message || 'Invalid username or password',
        error: data,
      };
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.request);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    } else {
      // Something else
      console.error('Error:', error.message);
      return {
        success: false,
        message: error.message || 'An error occurred during login',
      };
    }
  }
};

// Register user
export const register = async (userData) => {
  try {
    console.log('📝 Registering user:', userData.username);
    const response = await axiosInstance.post('/auth/register', userData);
    console.log('✅ Register response:', response.data);
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Registration successful',
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Registration failed',
      };
    }
  } catch (error) {
    console.error('❌ Register API error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Registration failed',
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    } else {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('🔓 Logged out successfully');
  return { success: true, message: 'Logged out successfully' };
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('⚠️ No token found');
      return { success: false, message: 'No token found' };
    }
    
    console.log('🔍 Getting current user...');
    const response = await axiosInstance.get('/auth/me');
    console.log('✅ Current user response:', response.data);
    
    if (response.data && response.data.success) {
      const user = response.data.user || response.data.data?.user || response.data.data;
      return {
        success: true,
        user: user,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to get user',
      };
    }
  } catch (error) {
    console.error('❌ Get current user error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to get user',
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    } else {
      return {
        success: false,
        message: error.message || 'Failed to get user',
      };
    }
  }
};

// Change password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    console.log('🔑 Changing password...');
    const response = await axiosInstance.put('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    console.log('✅ Password changed successfully');
    
    if (response.data && response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Password changed successfully',
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to change password',
      };
    }
  } catch (error) {
    console.error('❌ Change password error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to change password',
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    } else {
      return {
        success: false,
        message: error.message || 'Failed to change password',
      };
    }
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get current user from localStorage
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};
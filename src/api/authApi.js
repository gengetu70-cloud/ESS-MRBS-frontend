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
    
    if (response && response.data) {
      const data = response.data;
      
      if (data.success === true) {
        // Store user if present (token is automatically stored in HttpOnly cookie)
        const user = data.user || data.data?.user || data.data;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return {
          success: true,
          user: user,
          message: data.message || 'Login successful',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }
    } else {
      return {
        success: false,
        message: 'No response from server',
      };
    }
  } catch (error) {
    console.error('❌ Login API error:', error);
    
    if (error.response) {
      console.error('Server error response:', error.response.data);
      const data = error.response.data;
      return {
        success: false,
        message: data?.message || 'Invalid username or password',
        error: data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    } else {
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
      // Store user if present (token is automatically stored in HttpOnly cookie)
      const user = response.data.user || response.data.data?.user || response.data.data;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
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
export const logout = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    localStorage.removeItem('user');
    console.log('🔓 Logged out successfully');
    return { 
      success: true, 
      message: response.data?.message || 'Logged out successfully' 
    };
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Still clear local storage even if API call fails
    localStorage.removeItem('user');
    return { 
      success: false, 
      message: error.response?.data?.message || 'Logout failed' 
    };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    console.log('🔍 Getting current user...');
    const response = await axiosInstance.get('/auth/me');
    console.log('✅ Current user response:', response.data);
    
    if (response.data && response.data.success) {
      const user = response.data.user || response.data.data?.user || response.data.data;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
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
  // Check if user exists in localStorage (token is in HttpOnly cookie)
  const user = localStorage.getItem('user');
  return !!user;
};

// Get auth token (no longer needed for manual storage, but kept for compatibility)
export const getAuthToken = () => {
  return null; // Token is in HttpOnly cookie, not accessible via JavaScript
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
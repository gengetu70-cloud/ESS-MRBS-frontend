import axiosInstance from './axios';

// Get all users (admin only)
export const getUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

// Get single user
export const getUser = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

// Create user (admin only)
export const createUser = async (data) => {
  const response = await axiosInstance.post('/users', data);
  return response.data;
};

// Update user (admin only)
export const updateUser = async (id, data) => {
  const response = await axiosInstance.put(`/users/${id}`, data);
  return response.data;
};

// Delete user (admin only)
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

// Get user stats (admin only)
export const getUserStats = async () => {
  const response = await axiosInstance.get('/users/stats');
  return response.data;
};
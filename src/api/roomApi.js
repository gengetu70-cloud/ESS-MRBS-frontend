import axiosInstance from './axios';

// Get all rooms
export const getRooms = async () => {
  const response = await axiosInstance.get('/rooms');
  return response.data;
};

// Get single room
export const getRoom = async (id) => {
  const response = await axiosInstance.get(`/rooms/${id}`);
  return response.data;
};

// Create room (admin only)
export const createRoom = async (data) => {
  const response = await axiosInstance.post('/rooms', data);
  return response.data;
};

// Update room (admin only)
export const updateRoom = async (id, data) => {
  const response = await axiosInstance.put(`/rooms/${id}`, data);
  return response.data;
};

// Delete room (admin only)
export const deleteRoom = async (id) => {
  const response = await axiosInstance.delete(`/rooms/${id}`);
  return response.data;
};

// Get room stats (admin only)
export const getRoomStats = async () => {
  const response = await axiosInstance.get('/rooms/stats');
  return response.data;
};
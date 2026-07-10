import axiosInstance from '../api/axios';

// Get all rooms
export const getRooms = async () => {
  try {
    const response = await axiosInstance.get('/rooms');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch rooms' };
  }
};

// Get single room
export const getRoom = async (id) => {
  try {
    const response = await axiosInstance.get(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch room' };
  }
};

// Create room (admin only)
export const createRoom = async (roomData) => {
  try {
    const response = await axiosInstance.post('/rooms', roomData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create room' };
  }
};

// Update room (admin only)
export const updateRoom = async (id, roomData) => {
  try {
    const response = await axiosInstance.put(`/rooms/${id}`, roomData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update room' };
  }
};

// Delete room (admin only)
export const deleteRoom = async (id) => {
  try {
    const response = await axiosInstance.delete(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete room' };
  }
};

// Get room statistics (admin only)
export const getRoomStats = async () => {
  try {
    const response = await axiosInstance.get('/rooms/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch room stats' };
  }
};
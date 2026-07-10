import axiosInstance from './axios';

// Get all bookings
export const getBookings = async () => {
  const response = await axiosInstance.get('/bookings');
  return response.data;
};

// Get single booking
export const getBooking = async (id) => {
  const response = await axiosInstance.get(`/bookings/${id}`);
  return response.data;
};

// Create booking
export const createBooking = async (data) => {
  const response = await axiosInstance.post('/bookings', data);
  return response.data;
};

// Cancel booking
export const cancelBooking = async (id) => {
  const response = await axiosInstance.put(`/bookings/${id}/cancel`);
  return response.data;
};

// Update booking status (admin only)
export const updateBookingStatus = async (id, status) => {
  const response = await axiosInstance.put(`/bookings/${id}/status`, { status });
  return response.data;
};

// Delete booking (admin only)
export const deleteBooking = async (id) => {
  const response = await axiosInstance.delete(`/bookings/${id}`);
  return response.data;
};

// Get booking stats (admin only)
export const getBookingStats = async () => {
  const response = await axiosInstance.get('/bookings/stats');
  return response.data;
};
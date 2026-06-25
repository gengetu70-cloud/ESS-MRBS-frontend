import axiosInstance from '../api/axios';

// Get all bookings
export const getBookings = async () => {
  try {
    const response = await axiosInstance.get('/bookings');
    // FIXED: Return data in consistent format
    return {
      success: true,
      data: response.data?.data || response.data || [],
      message: response.data?.message || 'Bookings fetched successfully'
    };
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch bookings',
      error: error.response?.data?.error || error.message
    };
  }
};

// Get single booking
export const getBooking = async (id) => {
  if (!id) {
    throw { success: false, message: 'Booking ID is required' };
  }
  
  try {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Booking fetched successfully'
    };
  } catch (error) {
    console.error(`❌ Error fetching booking ${id}:`, error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch booking',
      error: error.response?.data?.error || error.message
    };
  }
};

// Create booking
export const createBooking = async (bookingData) => {
  // FIXED: Validate required fields before sending
  if (!bookingData) {
    throw { success: false, message: 'Booking data is required' };
  }
  
  if (!bookingData.room) {
    throw { success: false, message: 'Room is required' };
  }
  
  if (!bookingData.meetingDate) {
    throw { success: false, message: 'Meeting date is required' };
  }
  
  if (!bookingData.startTime || !bookingData.endTime) {
    throw { success: false, message: 'Start time and end time are required' };
  }
  
  try {
    const response = await axiosInstance.post('/bookings', bookingData);
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Booking created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create booking',
      error: error.response?.data?.error || error.message
    };
  }
};

// Cancel booking
export const cancelBooking = async (id) => {
  if (!id) {
    throw { success: false, message: 'Booking ID is required' };
  }
  
  try {
    const response = await axiosInstance.put(`/bookings/${id}/cancel`);
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Booking cancelled successfully'
    };
  } catch (error) {
    console.error(`❌ Error cancelling booking ${id}:`, error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to cancel booking',
      error: error.response?.data?.error || error.message
    };
  }
};

// Update booking status (admin only)
export const updateBookingStatus = async (id, status) => {
  if (!id) {
    throw { success: false, message: 'Booking ID is required' };
  }
  
  if (!status) {
    throw { success: false, message: 'Status is required' };
  }
  
  // FIXED: Validate status
  const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
  if (!validStatuses.includes(status.toLowerCase())) {
    throw { 
      success: false, 
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    };
  }
  
  try {
    const response = await axiosInstance.put(`/bookings/${id}/status`, { status });
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || `Booking ${status} successfully`
    };
  } catch (error) {
    console.error(`❌ Error updating booking ${id} status:`, error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update booking status',
      error: error.response?.data?.error || error.message
    };
  }
};

// FIXED: Approve booking (convenience method)
export const approveBooking = async (id) => {
  return updateBookingStatus(id, 'approved');
};

// FIXED: Reject booking (convenience method)
export const rejectBooking = async (id) => {
  return updateBookingStatus(id, 'rejected');
};

// Delete booking (admin only)
export const deleteBooking = async (id) => {
  if (!id) {
    throw { success: false, message: 'Booking ID is required' };
  }
  
  try {
    const response = await axiosInstance.delete(`/bookings/${id}`);
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Booking deleted successfully'
    };
  } catch (error) {
    console.error(`❌ Error deleting booking ${id}:`, error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to delete booking',
      error: error.response?.data?.error || error.message
    };
  }
};

// Get booking statistics (admin only)
export const getBookingStats = async () => {
  try {
    const response = await axiosInstance.get('/bookings/stats');
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Stats fetched successfully'
    };
  } catch (error) {
    console.error('❌ Error fetching booking stats:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch booking stats',
      error: error.response?.data?.error || error.message
    };
  }
};

// FIXED: Get bookings by date range
export const getBookingsByDateRange = async (startDate, endDate) => {
  if (!startDate || !endDate) {
    throw { success: false, message: 'Start date and end date are required' };
  }
  
  try {
    const response = await axiosInstance.get('/bookings', {
      params: { startDate, endDate }
    });
    return {
      success: true,
      data: response.data?.data || response.data || [],
      message: response.data?.message || 'Bookings fetched successfully'
    };
  } catch (error) {
    console.error('❌ Error fetching bookings by date range:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch bookings',
      error: error.response?.data?.error || error.message
    };
  }
};

// FIXED: Get bookings by user
export const getBookingsByUser = async (userId) => {
  if (!userId) {
    throw { success: false, message: 'User ID is required' };
  }
  
  try {
    const response = await axiosInstance.get(`/users/${userId}/bookings`);
    return {
      success: true,
      data: response.data?.data || response.data || [],
      message: response.data?.message || 'User bookings fetched successfully'
    };
  } catch (error) {
    console.error(`❌ Error fetching bookings for user ${userId}:`, error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user bookings',
      error: error.response?.data?.error || error.message
    };
  }
};

// FIXED: Get bookings by room
export const getBookingsByRoom = async (roomId) => {
  if (!roomId) {
    throw { success: false, message: 'Room ID is required' };
  }
  
  try {
    const response = await axiosInstance.get(`/rooms/${roomId}/bookings`);
    return {
      success: true,
      data: response.data?.data || response.data || [],
      message: response.data?.message || 'Room bookings fetched successfully'
    };
  } catch (error) {
    console.error(`❌ Error fetching bookings for room ${roomId}:`, error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch room bookings',
      error: error.response?.data?.error || error.message
    };
  }
};

// FIXED: Check room availability
export const checkRoomAvailability = async (roomId, date, startTime, endTime) => {
  if (!roomId || !date || !startTime || !endTime) {
    throw { success: false, message: 'Room, date, start time, and end time are required' };
  }
  
  try {
    const response = await axiosInstance.get(`/rooms/${roomId}/availability`, {
      params: { date, startTime, endTime }
    });
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Availability checked successfully'
    };
  } catch (error) {
    console.error(`❌ Error checking room ${roomId} availability:`, error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to check room availability',
      error: error.response?.data?.error || error.message
    };
  }
};
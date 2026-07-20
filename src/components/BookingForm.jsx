import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import axiosInstance from '../api/axios';

const BookingForm = ({ 
  room, 
  user, 
  onSuccess, 
  onError, 
  onCancel, 
  schedule = null
}) => {
  // Get availability info from schedule
  const getScheduleAvailability = () => {
    if (!schedule) return { canBook: true, isFull: false, availableSeats: room?.maxCapacity || 0 };
    
    const capacity = room?.maxCapacity || schedule.roomData?.maxCapacity || 0;
    const bookings = schedule.currentBookings || 0;
    const available = capacity - bookings;
    
    return {
      canBook: available > 0,
      isFull: available <= 0,
      availableSeats: available,
      capacity: capacity,
      bookings: bookings
    };
  };

  const { availableSeats, isFull, capacity } = getScheduleAvailability();
  const isFromSchedule = !!schedule;

  const [formData, setFormData] = useState({
    teaService: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isFull) {
      setError('Room is full. No seats available.');
      return;
    }
    
    setLoading(true);

    try {
      // ✅ SCHEDULE BOOKING - Using schedule
      const bookingData = {
        room: room._id || room,
        scheduleId: schedule._id,
        numberOfGuests: 1,
        teaService: formData.teaService,
        bookedBy: user?._id || null,
        userName: user?.fullName || user?.username || 'User',
        userEmail: user?.email || '',
        meetingDate: schedule.meetingDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        meetingTitle: schedule.meetingTitle || '',
        department: schedule.department || schedule.roomData?.department || room?.department || 'N/A',
        buildingNumber: schedule.roomData?.buildingNumber || room?.buildingNumber || 'N/A',
        floorNumber: schedule.roomData?.floorNumber || room?.floorNumber || 'N/A',
        status: 'approved',
        isScheduleBooking: true
      };

      console.log('📝 Submitting schedule booking:', bookingData);
      const response = await axiosInstance.post('/bookings', bookingData);
      console.log('✅ Booking response:', response.data);
      
      if (response.data && (response.data.success === true || response.data.data)) {
        const booking = response.data.data || response.data;
        
        const ticketData = {
          ...booking,
          ticketNumber: `ESS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          roomName: room?.roomName || schedule.roomData?.roomName || booking.room?.roomName || 'N/A',
          bookedBy: user?.fullName || user?.username || 'N/A',
          bookingId: booking._id || booking.id || 'SCHEDULE-BOOKING',
          department: schedule.department || schedule.roomData?.department || room?.department || 'N/A',
          buildingNumber: schedule.roomData?.buildingNumber || room?.buildingNumber || 'N/A',
          floorNumber: schedule.roomData?.floorNumber || room?.floorNumber || 'N/A',
        };
        
        // ✅ Pass ticket data to parent to show TicketDialog
        if (onSuccess) {
          onSuccess(ticketData);
        }
      } else {
        throw new Error(response.data?.message || 'Booking failed');
      }
      
    } catch (err) {
      console.error('❌ Booking error:', err);
      
      // ✅ Check if error is due to duplicate booking
      if (err.response?.status === 409) {
        setError('You have already booked this schedule.');
      } else if (err.response?.data?.message?.includes('already booked') || 
                 err.response?.data?.message?.includes('duplicate')) {
        setError('You have already booked this schedule.');
      } else {
        const message = err.response?.data?.message || err.message || 'Failed to create booking';
        setError(message);
      }
      
      if (onError) {
        onError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Schedule Info - Clean Format */}
        {isFromSchedule && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Meeting Scheduled by:</strong> {schedule?.department || schedule?.roomData?.department || room?.department || 'N/A'}
              <br />
              <strong>Room:</strong> {room?.roomName || schedule?.roomData?.roomName || schedule?.room?.roomName || 'N/A'}
              <br />
              <strong>Location:</strong> Building {schedule?.roomData?.buildingNumber || room?.buildingNumber || 'N/A'}, Floor {schedule?.roomData?.floorNumber || room?.floorNumber || 'N/A'}
              <br />
              <strong>Date:</strong> {schedule?.meetingDate ? new Date(schedule.meetingDate).toLocaleDateString() : 'N/A'}
              <br />
              <strong>Time:</strong> {schedule?.startTime || 'N/A'} - {schedule?.endTime || 'N/A'}
              <br />
              <strong>Title:</strong> {schedule?.meetingTitle || 'N/A'}
              <br />
              <strong>Available Seats:</strong> {availableSeats} of {capacity}
            </Typography>
          </Alert>
        )}

        {/* Full Room Alert */}
        {isFull && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              🚫 Room Full - No Seats Available
            </Typography>
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Tea Service - Always visible */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="teaService"
                  checked={formData.teaService}
                  onChange={handleChange}
                  color="primary"
                  disabled={isFull}
                />
              }
              label="Tea Service Required"
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || isFull}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
              sx={{
                bgcolor: (isFull) ? '#9e9e9e' : '#063b70',
                '&:hover': {
                  bgcolor: (isFull) ? '#9e9e9e' : '#0f6bd4',
                },
              }}
            >
              {loading ? 'Booking...' : isFull ? 'Room Full' : 'Confirm Booking'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default BookingForm;
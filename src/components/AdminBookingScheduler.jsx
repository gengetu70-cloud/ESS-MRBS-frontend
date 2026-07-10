import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Divider,
  Chip,
  IconButton,
  Snackbar,
  Portal,
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
  MeetingRoom as MeetingRoomIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import axiosInstance from '../api/axios';

const AdminBookingScheduler = ({ room, user, onSuccess, onError, onCancel }) => {
  const [formData, setFormData] = useState({
    meetingDate: '',
    startTime: '',
    endTime: '',
    numberOfGuests: 1,
    meetingTitle: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const ticketRef = useRef(null);

  // Fetch existing bookings for this room
  useEffect(() => {
    if (room?._id) {
      fetchRoomBookings();
    }
  }, [room]);

  // Check room availability whenever form data changes
  useEffect(() => {
    if (formData.meetingDate && formData.startTime && formData.endTime && formData.numberOfGuests) {
      const timer = setTimeout(() => {
        checkRoomAvailability();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.meetingDate, formData.startTime, formData.endTime, formData.numberOfGuests]);

  const fetchRoomBookings = async () => {
    try {
      const response = await axiosInstance.get(`/bookings?room=${room._id}`);
      const bookings = response.data?.data || response.data || [];
      setExistingBookings(bookings);
    } catch (error) {
      console.error('Error fetching room bookings:', error);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    pageStyle: `
      @media print {
        @page {
          size: A5;
          margin: 10mm;
        }
        body {
          font-family: Arial, sans-serif;
        }
        .no-print {
          display: none !important;
        }
        .print-only {
          display: block !important;
        }
      }
      .print-only {
        display: none;
      }
    `,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setTimeError('');
  };

  const validateTimes = () => {
    const { startTime, endTime, meetingDate } = formData;
    
    if (!startTime || !endTime) {
      setTimeError('Please select both start and end time');
      return false;
    }

    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    if (startMinutes >= endMinutes) {
      setTimeError('Start time must be before end time');
      return false;
    }

    const duration = endMinutes - startMinutes;
    if (duration < 15) {
      setTimeError('Meeting must be at least 15 minutes long');
      return false;
    }

    if (meetingDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(meetingDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() === today.getTime()) {
        const now = new Date();
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        const bufferMinutes = currentTimeMinutes + 5;
        
        if (startMinutes < bufferMinutes) {
          setTimeError(`Meeting must start at least 5 minutes from now (current time: ${now.toLocaleTimeString()})`);
          return false;
        }
      }
    }

    return true;
  };

  const validateTimeOnChange = (field, value) => {
    if (field === 'startTime' && formData.endTime) {
      const startParts = value.split(':').map(Number);
      const endParts = formData.endTime.split(':').map(Number);
      
      if (startParts[0] * 60 + startParts[1] >= endParts[0] * 60 + endParts[1]) {
        setTimeError('Start time must be before end time');
        return;
      }
      setTimeError('');
    } else if (field === 'endTime' && formData.startTime) {
      const startParts = formData.startTime.split(':').map(Number);
      const endParts = value.split(':').map(Number);
      
      if (startParts[0] * 60 + startParts[1] >= endParts[0] * 60 + endParts[1]) {
        setTimeError('End time must be after start time');
        return;
      }
      setTimeError('');
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    validateTimeOnChange(name, value);
  };

  const generateTicketNumber = () => {
    const prefix = 'ESS-ADMIN';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const timeToMinutes = (time) => {
    if (!time) return 0;
    const parts = time.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  const checkRoomAvailability = () => {
    const { meetingDate, startTime, endTime, numberOfGuests } = formData;

    if (!meetingDate || !startTime || !endTime || !numberOfGuests) {
      return true;
    }

    setCheckingAvailability(true);

    try {
      const currentRoomId = room._id?.toString();

      const roomBookings = existingBookings.filter(booking => {
        const bookingRoomId = 
          booking.room?._id?.toString() || 
          booking.room?.toString() || 
          booking.roomId?.toString() ||
          booking.room_id?.toString();
        return bookingRoomId === currentRoomId;
      });

      const dateBookings = roomBookings.filter(booking => {
        if (booking.status === 'cancelled' || booking.status === 'rejected') return false;
        const bookingDate = booking.meetingDate?.split('T')[0] || booking.date?.split('T')[0];
        return bookingDate === meetingDate;
      });

      const requestedStart = timeToMinutes(startTime);
      const requestedEnd = timeToMinutes(endTime);

      const overlappingBooking = dateBookings.some(booking => {
        const bookingStart = timeToMinutes(booking.startTime);
        const bookingEnd = timeToMinutes(booking.endTime);
        return (requestedStart < bookingEnd && requestedEnd > bookingStart);
      });

      if (overlappingBooking) {
        setIsRoomAvailable(false);
        setError('⚠️ This room is already scheduled for the selected time. Please choose a different time.');
        setCheckingAvailability(false);
        return false;
      }

      const totalGuestsToday = dateBookings.reduce((sum, b) => sum + (b.numberOfGuests || 0), 0);
      const newTotalGuests = totalGuestsToday + parseInt(numberOfGuests || 0);

      if (newTotalGuests > room.maxCapacity) {
        setIsRoomAvailable(false);
        setError(
          `⚠️ Room capacity exceeded! Current guests: ${totalGuestsToday}, ` +
          `Adding: ${numberOfGuests}, Total: ${newTotalGuests}/${room.maxCapacity}.`
        );
        setCheckingAvailability(false);
        return false;
      }

      setIsRoomAvailable(true);
      setError('');
      setCheckingAvailability(false);
      return true;
    } catch (error) {
      console.error('Error checking availability:', error);
      setIsRoomAvailable(true);
      setCheckingAvailability(false);
      return true;
    }
  };

  // Fixed showSnackbar - using individual state variables
  const showSnackbar = (message, severity = 'success') => {
    console.log(`📢 Showing snackbar: ${message} (${severity})`);
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTimeError('');
    
    // Validate form fields
    const errors = [];
    
    if (!room || !room._id) {
      errors.push('Room is required');
    }
    
    if (!formData.meetingDate) {
      errors.push('Meeting date is required');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.meetingDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.push('Meeting date cannot be in the past');
      }
    }
    
    if (!formData.startTime) {
      errors.push('Start time is required');
    }
    
    if (!formData.endTime) {
      errors.push('End time is required');
    }
    
    if (!formData.numberOfGuests) {
      errors.push('Number of guests is required');
    } else {
      const guestCount = parseInt(formData.numberOfGuests);
      if (isNaN(guestCount) || guestCount < 1) {
        errors.push('Number of guests must be at least 1');
      }
      if (room && guestCount > room.maxCapacity) {
        errors.push(`Number of guests cannot exceed room capacity (${room.maxCapacity})`);
      }
    }
    
    if (formData.meetingTitle && formData.meetingTitle.length > 100) {
      errors.push('Meeting title cannot exceed 100 characters');
    }
    
    if (errors.length > 0) {
      const errorMsg = errors.join('. ');
      setError(errorMsg);
      showSnackbar(`❌ ${errorMsg}`, 'error');
      return;
    }
    
    // Check room availability one more time before submitting
    const isAvailable = checkRoomAvailability();
    if (!isAvailable || !isRoomAvailable) {
      const msg = 'This room is not available for the selected time. Please choose a different time.';
      setError(msg);
      showSnackbar(`❌ ${msg}`, 'error');
      return;
    }
    
    setLoading(true);

    try {
      const bookingData = {
        room: room._id,
        meetingDate: formData.meetingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfGuests: parseInt(formData.numberOfGuests),
        teaService: false,
        scheduledBy: user?._id || null,
        status: 'approved',
        scheduledByAdmin: true,
        adminName: user?.fullName || user?.username || 'Admin',
        ...(formData.meetingTitle && { meetingTitle: formData.meetingTitle }),
      };

      console.log('📝 Admin scheduling booking:', bookingData);

      const response = await axiosInstance.post('/bookings', bookingData);
      console.log('✅ Admin booking response:', response.data);

      const isSuccess = response.data && (response.data.success === true || response.data.data);
      
      if (isSuccess) {
        const booking = response.data.data || response.data;
        
        const ticketData = {
          ...booking,
          ticketNumber: generateTicketNumber(),
          roomName: room?.roomName || booking.room?.roomName || 'N/A',
          bookedBy: user?.fullName || user?.username || 'Admin',
          bookingId: booking._id || booking.id,
          department: room?.department || booking.room?.department || 'N/A',
          scheduledByAdmin: true,
        };
        
        setBookingDetails(ticketData);
        setTicketDialogOpen(true);
        
        // Show success message
        showSnackbar(`✅ Meeting scheduled successfully for ${room?.roomName}!`, 'success');
        
        // Reset form
        setFormData({
          meetingDate: '',
          startTime: '',
          endTime: '',
          numberOfGuests: 1,
          meetingTitle: '',
        });
        
        // Refresh bookings list
        await fetchRoomBookings();
        
        // Call success callback
        if (onSuccess) {
          onSuccess(ticketData);
        }
      } else {
        throw new Error(response.data?.message || 'Booking failed');
      }
    } catch (err) {
      console.error('❌ Admin booking error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to create booking';
      setError(message);
      showSnackbar(`❌ ${message}`, 'error');
      if (onError) {
        onError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = () => {
    setTicketDialogOpen(false);
    setBookingDetails(null);
  };

  // Ticket Component
  const BookingTicket = React.forwardRef(({ booking }, ref) => {
    return (
      <Paper
        ref={ref}
        sx={{
          p: 4,
          maxWidth: 400,
          mx: 'auto',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 3,
          border: '2px solid #1976d2',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
          }}
        />
        
        <Box sx={{ textAlign: 'center', mb: 3, mt: 1 }}>
          <Chip
            icon={<AdminIcon />}
            label="Admin Scheduled"
            color="primary"
            size="small"
            sx={{ mb: 1 }}
          />
          <Typography variant="h6" fontWeight="bold" color="primary">
            ESS MRBS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin Meeting Room Booking System
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="overline" color="text.secondary">
            Scheduled Ticket
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Chip
            icon={<QrCodeIcon />}
            label={`Ticket #${booking?.ticketNumber || 'N/A'}`}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>

        <Box sx={{ bgcolor: '#f5f7fa', borderRadius: 2, p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Scheduled Meeting Details
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MeetingRoomIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Room:</strong> {booking?.roomName || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Date:</strong> {booking?.meetingDate ? new Date(booking.meetingDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TimeIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Time:</strong> {booking?.startTime || 'N/A'} - {booking?.endTime || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PeopleIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Guests:</strong> {booking?.numberOfGuests || 0}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Scheduled By:</strong> {booking?.bookedBy || 'Admin'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>Status:</strong> <Chip label="Approved" size="small" color="success" sx={{ ml: 1 }} />
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Booking ID: {booking?.bookingId || 'N/A'}
          </Typography>
          {booking?.department && (
            <Typography variant="caption" color="text.secondary" display="block">
              Department: {booking?.department}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            This is an admin-scheduled meeting
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Room is reserved for this time slot
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <CheckIcon fontSize="small" color="success" />
            <Typography variant="caption" color="success.main">
              Approved Schedule
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
          }}
        />
      </Paper>
    );
  });

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                Admin Booking Scheduler
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schedule meetings for {room?.roomName || 'selected room'} • Automatically approved
              </Typography>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {timeError && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setTimeError('')}>
            {timeError}
          </Alert>
        )}

        {checkingAvailability && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Checking room availability...
          </Alert>
        )}

        {!isRoomAvailable && !error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ This room is not available for the selected time. Please choose a different time.
          </Alert>
        )}

        {isRoomAvailable && formData.meetingDate && formData.startTime && formData.endTime && !error && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Room is available for the selected time!
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Meeting Date"
              name="meetingDate"
              value={formData.meetingDate}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                min: new Date().toISOString().split('T')[0]
              }}
              helperText="Select a meeting date (today or future)"
              error={!!error && error.includes('date')}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              name="startTime"
              value={formData.startTime}
              onChange={handleTimeChange}
              required
              InputLabelProps={{ shrink: true }}
              helperText="24-hour format"
              error={!!timeError && timeError.includes('Start')}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="End Time"
              name="endTime"
              value={formData.endTime}
              onChange={handleTimeChange}
              required
              InputLabelProps={{ shrink: true }}
              helperText="Must be after start time"
              error={!!timeError && timeError.includes('End')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Number of Guests"
              name="numberOfGuests"
              value={formData.numberOfGuests}
              onChange={handleChange}
              required
              inputProps={{ min: 1, max: room?.maxCapacity || 100 }}
              helperText={`Max capacity: ${room?.maxCapacity || 0} people (set at room creation)`}
              error={!!error && error.includes('guests')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Meeting Title (Optional)"
              name="meetingTitle"
              value={formData.meetingTitle}
              onChange={handleChange}
              placeholder="Enter meeting title"
              inputProps={{ maxLength: 100 }}
              helperText="Max 100 characters"
            />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info" icon={<ScheduleIcon />}>
              <Typography variant="body2">
                <strong>Note:</strong> This booking will be automatically <strong>approved</strong> and visible to all users.
                Users will be able to book only during available time slots.
              </Typography>
            </Alert>
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
              disabled={loading || checkingAvailability || !isRoomAvailable}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScheduleIcon />}
              sx={{ 
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                '&:disabled': { bgcolor: '#bdbdbd' }
              }}
            >
              {loading ? 'Scheduling...' : 'Schedule Booking'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Ticket Dialog */}
      <Dialog
        open={ticketDialogOpen}
        onClose={handleCloseTicket}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon />
            <Typography variant="h6" fontWeight="bold">
              Meeting Scheduled! 🎉
            </Typography>
          </Box>
          <IconButton onClick={handleCloseTicket} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, bgcolor: '#f5f7fa' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            The meeting has been scheduled and approved. Users can now book during available slots.
          </Alert>
          
          {bookingDetails ? (
            <BookingTicket ref={ticketRef} booking={bookingDetails} />
          ) : (
            <Alert severity="info">Loading ticket...</Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0, gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Print Ticket
          </Button>
          <Button
            variant="outlined"
            onClick={handleCloseTicket}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar - Using Portal to render outside dialog */}
      <Portal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            zIndex: 99999,
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity}
            variant="filled"
            sx={{ 
              width: '100%', 
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '350px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Portal>
    </>
  );
};

export default AdminBookingScheduler;
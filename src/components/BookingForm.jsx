import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
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
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
  MeetingRoom as MeetingRoomIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  LocalCafe as TeaIcon,
  CheckCircle as CheckIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import axiosInstance from '../api/axios';

// ADDED: showTicketDialog prop with default true
const BookingForm = ({ room, user, onSuccess, onError, onCancel, showTicketDialog = true }) => {
  const [formData, setFormData] = useState({
    meetingDate: '',
    startTime: '',
    endTime: '',
    numberOfGuests: 1,
    teaService: false,
    meetingTitle: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  
  const ticketRef = useRef(null);

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
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'teaService' ? checked : value,
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
    const prefix = 'ESS';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTimeError('');
    
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
      setError(errors.join('. '));
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
        teaService: formData.teaService,
        scheduledBy: user?._id || null,
        ...(formData.meetingTitle && { meetingTitle: formData.meetingTitle }),
      };

      console.log('📝 Submitting booking:', bookingData);

      const response = await axiosInstance.post('/bookings', bookingData);
      console.log('✅ Booking response:', response.data);

      const isSuccess = response.data && (response.data.success === true || response.data.data);
      
      if (isSuccess) {
        const booking = response.data.data || response.data;
        console.log('📦 Booking data:', booking);
        
        const ticketData = {
          ...booking,
          ticketNumber: generateTicketNumber(),
          roomName: room?.roomName || booking.room?.roomName || 'N/A',
          bookedBy: user?.fullName || user?.username || 'N/A',
          bookingId: booking._id || booking.id,
          department: room?.department || booking.room?.department || 'N/A',
        };
        
        console.log('🎫 Ticket data:', ticketData);
        
        // MODIFIED: Only show internal ticket dialog if showTicketDialog is true
        if (showTicketDialog) {
          setBookingDetails(ticketData);
          setTicketDialogOpen(true);
          console.log('✅ Internal ticket dialog opened');
        } else {
          console.log('✅ Internal ticket dialog disabled (parent will handle)');
        }
        
        // Reset form
        setFormData({
          meetingDate: '',
          startTime: '',
          endTime: '',
          numberOfGuests: 1,
          teaService: false,
          meetingTitle: '',
        });
        
        // Call success callback with ticket data
        if (onSuccess) {
          onSuccess(ticketData);
        }
      } else {
        throw new Error(response.data?.message || 'Booking failed');
      }
    } catch (err) {
      console.error('❌ Booking error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to create booking';
      setError(message);
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
    console.log('🎫 Rendering ticket with:', booking);
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
          <Typography variant="h6" fontWeight="bold" color="primary">
            ESS MRBS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Meeting Room Booking System
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="overline" color="text.secondary">
            Entry Ticket
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
            Meeting Details
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

          {booking?.teaService && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TeaIcon fontSize="small" color="primary" />
              <Typography variant="body2">
                <strong>Tea Service:</strong> Yes
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Booked By:</strong> {booking?.bookedBy || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
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
            This ticket is valid for entry to the meeting
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Please present this ticket at the reception
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <CheckIcon fontSize="small" color="success" />
            <Typography variant="caption" color="success.main">
              Verified Booking
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
              helperText={`Max capacity: ${room?.maxCapacity || 0} people`}
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
            <FormControlLabel
              control={
                <Switch
                  name="teaService"
                  checked={formData.teaService}
                  onChange={handleChange}
                  color="primary"
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
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Ticket Dialog - Only shown if showTicketDialog is true */}
      {showTicketDialog && (
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
                Booking Confirmed! 🎉
              </Typography>
            </Box>
            <IconButton onClick={handleCloseTicket} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3, bgcolor: '#f5f7fa' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your meeting has been booked successfully! Please print your ticket for entry.
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
      )}
    </>
  );
};

export default BookingForm;
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  EventNote as ScheduleIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axiosInstance from '../api/axios';

const AdminBookingScheduler = ({ room, user, onSuccess, onError, onCancel }) => {
  const [formData, setFormData] = useState({
    meetingDate: '',
    startTime: '',
    endTime: '',
    numberOfGuests: room?.maxCapacity || 1,
    meetingTitle: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingBookings, setExistingBookings] = useState([]);
  const [conflictError, setConflictError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (room?._id) {
      fetchRoomBookings();
    }
  }, [room]);

  useEffect(() => {
    if (room?.maxCapacity) {
      setFormData((prev) => ({
        ...prev,
        numberOfGuests: room.maxCapacity,
      }));
    }
  }, [room]);

  useEffect(() => {
    if (formData.meetingDate && formData.startTime && formData.endTime) {
      checkForConflicts();
    }
  }, [formData.meetingDate, formData.startTime, formData.endTime]);

  const fetchRoomBookings = async () => {
    try {
      const response = await axiosInstance.get(`/bookings?room=${room._id}`);
      const bookings = response.data?.data || response.data || [];
      setExistingBookings(bookings);
    } catch (error) {
      console.error('Error fetching room bookings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setConflictError('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const checkForConflicts = () => {
    const { meetingDate, startTime, endTime } = formData;

    if (!meetingDate || !startTime || !endTime) {
      return true;
    }

    const timeToMinutes = (time) => {
      const parts = time.split(':');
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    const requestedStart = timeToMinutes(startTime);
    const requestedEnd = timeToMinutes(endTime);

    const dateBookings = existingBookings.filter(booking => {
      if (booking.status === 'cancelled' || booking.status === 'rejected') return false;
      const bookingDate = booking.meetingDate?.split('T')[0] || booking.date?.split('T')[0];
      return bookingDate === meetingDate;
    });

    const hasConflict = dateBookings.some(booking => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);
      return (requestedStart < bookingEnd && requestedEnd > bookingStart);
    });

    if (hasConflict) {
      setConflictError('❌ This time slot conflicts with an existing booking. Please choose a different time.');
      return false;
    }

    setConflictError('');
    return true;
  };

  const validateForm = () => {
    const { meetingDate, startTime, endTime, numberOfGuests, meetingTitle } = formData;

    const errors = [];

    if (!meetingDate) errors.push('Meeting date is required');
    if (!startTime) errors.push('Start time is required');
    if (!endTime) errors.push('End time is required');

    if (meetingDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(meetingDate);
      if (selectedDate < today) {
        errors.push('Meeting date cannot be in the past');
      }
    }

    if (startTime && endTime) {
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      if (startMinutes >= endMinutes) {
        errors.push('Start time must be before end time');
      }
      if (endMinutes - startMinutes < 15) {
        errors.push('Meeting must be at least 15 minutes long');
      }
    }

    if (numberOfGuests) {
      const guestCount = parseInt(numberOfGuests);
      if (isNaN(guestCount) || guestCount < 1) {
        errors.push('Number of guests must be at least 1');
      }
      if (room && guestCount > room.maxCapacity) {
        errors.push(`Number of guests cannot exceed room capacity (${room.maxCapacity})`);
      }
    }

    if (meetingTitle && meetingTitle.length > 100) {
      errors.push('Meeting title cannot exceed 100 characters');
    }

    const hasConflict = checkForConflicts();
    if (!hasConflict) {
      errors.push(conflictError || 'Time slot conflict');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConflictError('');

    const errors = validateForm();
    if (errors.length > 0) {
      const errorMsg = errors.join('. ');
      setError(errorMsg);
      showSnackbar(`❌ ${errorMsg}`, 'error');
      return;
    }

    setLoading(true);

    try {
      // ✅ ADMIN CREATES A SCHEDULE (NOT A BOOKING)
      // Status is 'scheduled' - NOT 'approved'
      // This creates an AVAILABILITY WINDOW for users to book
      const scheduleData = {
        room: room._id,
        meetingDate: formData.meetingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfGuests: parseInt(formData.numberOfGuests) || room.maxCapacity,
        meetingTitle: formData.meetingTitle || `${room.roomName} Meeting`,
        scheduledBy: user?._id || null,
        status: 'scheduled', // ✅ NOT 'approved' - this is a SCHEDULE
        scheduledByAdmin: true,
        adminName: user?.fullName || user?.username || 'Admin',
        isSchedule: true, // Flag to identify this as a schedule
        // ✅ CRITICAL: No bookings yet, just the schedule
        currentBookings: 0,
        remainingCapacity: room.maxCapacity,
      };

      console.log('📝 Admin creating schedule:', scheduleData);

      // ✅ FIXED: Use /schedules endpoint (not /bookings/schedule)
      const response = await axiosInstance.post('/schedules', scheduleData);
      console.log('✅ Schedule created:', response.data);

      const schedule = response.data?.data || response.data;

      setBookingSuccess(schedule);
      setDialogOpen(true);

      showSnackbar(`✅ Schedule created for ${room.roomName}! Users can now book.`, 'success');

      setFormData({
        meetingDate: '',
        startTime: '',
        endTime: '',
        numberOfGuests: room.maxCapacity || 1,
        meetingTitle: '',
      });

      await fetchRoomBookings();

      if (onSuccess) {
        onSuccess(schedule);
      }

    } catch (error) {
      console.error('❌ Schedule creation error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create schedule';
      setError(message);
      showSnackbar(`❌ ${message}`, 'error');
      if (onError) {
        onError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setBookingSuccess(null);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                Create Room Schedule
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users can book this room once the schedule is created
              </Typography>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {conflictError && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setConflictError('')}>
            {conflictError}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>📌 Schedule Rules:</strong>
            <br />
            • Room capacity ({room?.maxCapacity || 0}) will be used as default
            <br />
            • Users can book during this time if seats are available
            <br />
            • Each user booking reduces available seats
          </Typography>
        </Alert>

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
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="End Time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Number of Guests (Optional)"
              name="numberOfGuests"
              value={formData.numberOfGuests}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1, max: room?.maxCapacity || 100 }}
              helperText={`Default: ${room?.maxCapacity || 0} (room capacity)`}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Meeting Title"
              name="meetingTitle"
              value={formData.meetingTitle}
              onChange={handleChange}
              placeholder="e.g., Team Meeting, Project Review"
              inputProps={{ maxLength: 100 }}
              helperText="Max 100 characters"
            />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="warning" icon={<ScheduleIcon />}>
              <Typography variant="body2">
                <strong>📋 Important:</strong> This creates a <strong>schedule/availability</strong>.
                Users will book during this time. The room is NOT automatically booked.
              </Typography>
            </Alert>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !!conflictError}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScheduleIcon />}
              sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
            >
              {loading ? 'Creating Schedule...' : 'Create Schedule'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon />
            <Typography variant="h6">Schedule Created! ✅</Typography>
          </Box>
          <CloseIcon
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white', cursor: 'pointer' }}
          />
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Room schedule has been created successfully!
          </Alert>
          {bookingSuccess && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Room:</strong> {room?.roomName}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {formData.meetingDate}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {formData.startTime} - {formData.endTime}
              </Typography>
              <Typography variant="body2">
                <strong>Capacity:</strong> {formData.numberOfGuests || room?.maxCapacity} seats
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'info.main' }}>
                📌 Users can now book this room during the scheduled time.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                The room is NOT automatically booked. Users must book individually.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" sx={{ borderRadius: 2 }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminBookingScheduler;
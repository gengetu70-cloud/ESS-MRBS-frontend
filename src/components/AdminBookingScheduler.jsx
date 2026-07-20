import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
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
    meetingTitle: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [conflictError, setConflictError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(null);
  const [scheduleCreated, setScheduleCreated] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Use refs to prevent dialog from closing
  const isSuccessRef = useRef(false);
  const dialogDataRef = useRef(null);

  useEffect(() => {
    if (room?._id) {
      fetchRoomSchedules();
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

  // ✅ Fetch existing schedules for this room (not bookings)
  const fetchRoomSchedules = async () => {
    try {
      // Fetch schedules for this specific room
      const response = await axiosInstance.get(`/schedules/room/${room._id}`);
      const schedules = response.data?.data || response.data || [];
      setExistingSchedules(schedules);
      console.log(`📋 Found ${schedules.length} existing schedules for room ${room.roomName}`);
    } catch (error) {
      console.error('Error fetching room schedules:', error);
      // If endpoint doesn't exist, fallback to all schedules
      try {
        const allSchedulesRes = await axiosInstance.get('/schedules');
        const allSchedules = allSchedulesRes.data?.data || allSchedulesRes.data || [];
        const roomSchedules = allSchedules.filter(s => s.room === room._id || s.room?._id === room._id);
        setExistingSchedules(roomSchedules);
        console.log(`📋 Found ${roomSchedules.length} existing schedules for room ${room.roomName} (fallback)`);
      } catch (fallbackErr) {
        console.error('Error fetching all schedules:', fallbackErr);
      }
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

  // ✅ Check for conflicts with existing schedules for the SAME room only
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

    // ✅ Filter schedules for the same date
    const dateSchedules = existingSchedules.filter(schedule => {
      if (schedule.status === 'cancelled') return false;
      const scheduleDate = schedule.meetingDate?.split('T')[0] || schedule.meetingDate;
      return scheduleDate === meetingDate;
    });

    console.log(`📅 Found ${dateSchedules.length} schedules on ${meetingDate} for this room`);

    // ✅ Check for time conflicts (only for the same room, same date)
    const hasConflict = dateSchedules.some(schedule => {
      const scheduleStart = timeToMinutes(schedule.startTime);
      const scheduleEnd = timeToMinutes(schedule.endTime);
      // Check if time ranges overlap
      const overlaps = requestedStart < scheduleEnd && requestedEnd > scheduleStart;
      if (overlaps) {
        console.log(`⚠️ Conflict with schedule: ${schedule.meetingTitle || 'Untitled'} (${schedule.startTime}-${schedule.endTime})`);
      }
      return overlaps;
    });

    if (hasConflict) {
      setConflictError('❌ This time slot conflicts with an existing schedule for this room. Please choose a different time.');
      return false;
    }

    setConflictError('');
    return true;
  };

  const validateForm = () => {
    const { meetingDate, startTime, endTime, meetingTitle } = formData;

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
      // ✅ ADMIN CREATES A SCHEDULE - Number of guests is taken from room.maxCapacity
      const scheduleData = {
        room: room._id,
        meetingDate: formData.meetingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfGuests: room.maxCapacity, // ✅ Auto-set from room
        meetingTitle: formData.meetingTitle || `${room.roomName} Meeting`,
        scheduledBy: user?._id || null,
        status: 'scheduled',
        scheduledByAdmin: true,
        adminName: user?.fullName || user?.username || 'Admin',
        department: room?.department || 'N/A',
        isSchedule: true,
        currentBookings: 0,
        remainingCapacity: room.maxCapacity,
        roomData: {
          _id: room._id,
          roomName: room.roomName,
          maxCapacity: room.maxCapacity,
          department: room.department || 'N/A',
          buildingNumber: room.buildingNumber || 'N/A',
          floorNumber: room.floorNumber || 'N/A',
          description: room.description || '',
          amenities: room.amenities || [],
        }
      };

      console.log('📝 Admin creating schedule:', scheduleData);

      const response = await axiosInstance.post('/schedules', scheduleData);
      console.log('✅ Schedule created:', response.data);

      const schedule = response.data?.data || response.data;

      // ✅ Prepare dialog data
      const dialogInfo = {
        roomName: room.roomName,
        department: room.department || 'N/A',
        meetingDate: formData.meetingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfGuests: room.maxCapacity,
      };

      // ✅ Store in refs
      dialogDataRef.current = dialogInfo;
      isSuccessRef.current = true;

      // ✅ Set dialog data and open
      setDialogData(dialogInfo);
      setScheduleCreated(true);
      
      // ✅ Open dialog with slight delay for smooth UX
      setTimeout(() => {
        setDialogOpen(true);
      }, 300);

      // ✅ Show success snackbar
      showSnackbar(`✅ Schedule created for ${room.roomName}! Users can now book.`, 'success');

      // ✅ Reset form after dialog opens
      setTimeout(() => {
        setFormData({
          meetingDate: '',
          startTime: '',
          endTime: '',
          meetingTitle: '',
        });
      }, 400);

      // ✅ Refresh schedules
      fetchRoomSchedules();

      // ✅ Call onSuccess
      if (onSuccess) {
        setTimeout(() => {
          try {
            onSuccess(schedule);
          } catch (e) {
            console.log('onSuccess error:', e);
          }
        }, 200);
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
    setScheduleCreated(false);
    setTimeout(() => {
      setDialogData(null);
      dialogDataRef.current = null;
      isSuccessRef.current = false;
    }, 300);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            Room capacity ({room?.maxCapacity || 0})
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

          {/* ✅ Removed Number of Guests field - it's auto-set from room configuration */}

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
           <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !!conflictError}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScheduleIcon />}
              sx={{ bgcolor: '#063b70', '&:hover': { bgcolor: '#0f6bd4' } }}
            >
              {loading ? 'Creating Schedule...' : 'Create Schedule'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* ✅ Success Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
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
          bgcolor: 'success.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon />
            <Typography variant="h6" fontWeight="bold">
              Schedule Created! ✅
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, bgcolor: '#f5f7fa' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Room schedule has been created successfully!
          </Alert>
          
          {dialogData && (
            <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                Schedule Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Room</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {dialogData.roomName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Department</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {dialogData.department}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {dialogData.meetingDate}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Time</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {dialogData.startTime} - {dialogData.endTime}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Capacity</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {dialogData.numberOfGuests} seats
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="body2" color="info.main">
                  📌 Users can now book this room during the scheduled time.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  The room is NOT automatically booked. Users must book individually.
                </Typography>
              </Box>
            </Paper>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0, gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            sx={{ borderRadius: 2, px: 4 }}
          >
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
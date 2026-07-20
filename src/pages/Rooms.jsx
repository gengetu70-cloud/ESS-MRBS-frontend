import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  MeetingRoom,
  People,
  LocationOn,
  Close as CloseIcon,
  BookOnline,
  Schedule as ScheduleIcon,
  EventNote as EventIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import BookingForm from '../components/BookingForm';
import TicketDialog from '../components/TicketDialog';

const Rooms = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewFilter, setViewFilter] = useState('all');
  
  const [, forceUpdate] = useState({});

  // ✅ Define getAvailability FIRST
  const getAvailability = useCallback((schedule) => {
    const capacity = schedule.room?.maxCapacity || schedule.maxCapacity || 0;
    const bookings = schedule.currentBookings || schedule.bookings?.length || 0;
    const available = capacity - bookings;
    return { capacity, bookings, available, isFull: available <= 0 };
  }, []);

  // ✅ Define canBookNow - Check if schedule is ended
  const canBookNow = useCallback((schedule) => {
    const { isFull } = getAvailability(schedule);

    const now = new Date();
    const meetingDate = new Date(schedule.meetingDate);
    
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    const meetingStart = new Date(meetingDate);
    meetingStart.setHours(startHour, startMinute, 0, 0);
    const meetingEnd = new Date(meetingDate);
    meetingEnd.setHours(endHour, endMinute, 0, 0);

    const timeUntilStart = meetingStart - now;
    const daysUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
    const hoursUntilStart = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesUntilStart = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));

    // ✅ Check if meeting has ended - NO GRACE PERIOD, immediate ENDED status
    if (now > meetingEnd) {
      return { 
        canBook: false, 
        statusMessage: 'Meeting has ended',
        isEnded: true,
        isFull: false,
        isMeetingInProgress: false,
        isTooEarly: false,
        isUpcoming: false
      };
    }

    if (isFull) {
      return { canBook: false, statusMessage: 'Room is full', isFull: true, isEnded: false };
    }

    if (daysUntilStart > 5) {
      return { 
        canBook: false, 
        statusMessage: `Available in ${daysUntilStart} days`,
        daysUntilStart: daysUntilStart,
        isTooEarly: true,
        isEnded: false,
        isFull: false
      };
    }

    if (now >= meetingStart && now <= meetingEnd) {
      return { 
        canBook: false,
        statusMessage: 'Meeting in progress - Booking closed',
        isActive: true,
        isMeetingInProgress: true,
        isEnded: false,
        isFull: false
      };
    }

    if (now < meetingStart) {
      let timeMessage = '';
      if (daysUntilStart > 0) {
        timeMessage = `${daysUntilStart}d ${hoursUntilStart}h ${minutesUntilStart}m`;
      } else if (hoursUntilStart > 0) {
        timeMessage = `${hoursUntilStart}h ${minutesUntilStart}m`;
      } else {
        timeMessage = `${minutesUntilStart}m`;
      }
      
      return { 
        canBook: true,
        statusMessage: `Starts in ${timeMessage}`,
        isUpcoming: true,
        daysUntilStart: daysUntilStart,
        hoursUntilStart: hoursUntilStart,
        minutesUntilStart: minutesUntilStart,
        isEnded: false,
        isFull: false
      };
    }

    return { 
      canBook: false, 
      statusMessage: 'Not available',
      isEnded: true,
      isFull: false
    };
  }, [getAvailability]);

  // ✅ Read filter from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const filterParam = queryParams.get('filter');
    if (filterParam && ['all', 'unique', 'active', 'bookable'].includes(filterParam)) {
      console.log('📍 Setting viewFilter to:', filterParam);
      setViewFilter(filterParam);
    }
  }, [location.search]);

  // ✅ Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  // ✅ Auto-refresh time status every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get('/schedules');
      console.log('📋 Fetched schedules:', response.data);
      
      let schedulesData = response.data?.data || response.data || [];
      
      if (!Array.isArray(schedulesData)) {
        if (schedulesData.schedules) {
          schedulesData = schedulesData.schedules;
        } else if (schedulesData.docs) {
          schedulesData = schedulesData.docs;
        } else {
          schedulesData = [schedulesData];
        }
      }

      const enrichedSchedules = await Promise.all(
        schedulesData
          .filter(schedule => schedule && schedule._id && schedule.room)
          .map(async (schedule) => {
            if (typeof schedule.room === 'string') {
              try {
                const roomResponse = await axiosInstance.get(`/rooms/${schedule.room}`);
                schedule.room = roomResponse.data?.data || roomResponse.data;
              } catch (err) {
                console.error(`Failed to fetch room for schedule ${schedule._id}:`, err);
              }
            }
            if (!schedule.currentBookings && schedule.bookings) {
              schedule.currentBookings = schedule.bookings.length || 0;
            }
            return schedule;
          })
      );

      setSchedules(enrichedSchedules);

      const depts = [...new Set(enrichedSchedules.map(s => s.room?.department).filter(Boolean))];
      setDepartments(depts);

      if (enrichedSchedules.length === 0) {
        setError('No room schedules available at the moment.');
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load room schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSchedules();
  };

  const handleBookRoom = (schedule) => {
    const { available, isFull } = getAvailability(schedule);

    if (isFull) {
      setSnackbar({
        open: true,
        message: 'This room is already full. No seats available.',
        severity: 'error',
      });
      return;
    }

    const { canBook, statusMessage } = canBookNow(schedule);
    
    if (!canBook) {
      setSnackbar({
        open: true,
        message: statusMessage || 'Booking is not available at this time.',
        severity: 'warning',
      });
      return;
    }

    setSelectedSchedule(schedule);
    setBookingOpen(true);
  };

  const handleBookingSuccess = (booking) => {
    console.log('✅ Booking successful:', booking);
    setBookingOpen(false);
    setTicketData(booking);
    setTicketOpen(true);
    setSnackbar({
      open: true,
      message: 'Room booked successfully! 🎉',
      severity: 'success',
    });
    fetchSchedules();
  };

  const handleBookingError = (message) => {
    console.error('❌ Booking error:', message);
    setSnackbar({
      open: true,
      message: message || 'Failed to create booking',
      severity: 'error',
    });
  };

  const handleCloseDialog = () => {
    setBookingOpen(false);
    setSelectedSchedule(null);
  };

  const handleCloseTicket = () => {
    setTicketOpen(false);
    setTicketData(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ✅ Apply filters based on viewFilter
  const getFilteredSchedules = useCallback(() => {
    let filtered = schedules;
    
    if (filterDepartment) {
      filtered = filtered.filter((schedule) => schedule.room?.department === filterDepartment);
    }

    if (viewFilter === 'unique') {
      const seenRooms = new Set();
      return filtered.filter(schedule => {
        const roomName = schedule.room?.roomName || schedule.roomData?.roomName;
        if (seenRooms.has(roomName)) {
          return false;
        }
        seenRooms.add(roomName);
        return true;
      });
    }

    if (viewFilter === 'active') {
      return filtered.filter(schedule => {
        const bookingStatus = canBookNow(schedule);
        return !bookingStatus.isEnded;
      });
    }

    if (viewFilter === 'bookable') {
      return filtered.filter(schedule => {
        const { isFull } = getAvailability(schedule);
        const bookingStatus = canBookNow(schedule);
        return !isFull && 
               !bookingStatus.isEnded && 
               !bookingStatus.isMeetingInProgress &&
               !bookingStatus.isTooEarly;
      });
    }

    return filtered;
  }, [schedules, filterDepartment, viewFilter, getAvailability, canBookNow]);

  const displaySchedules = getFilteredSchedules();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ✅ FIXED: getStatusDisplay - ENDED takes priority over FULL
  const getStatusDisplay = (schedule) => {
    const availability = getAvailability(schedule);
    const bookingStatus = canBookNow(schedule);
    
    // ✅ ENDED takes highest priority
    if (bookingStatus.isEnded) {
      return { label: 'ENDED', color: 'default', icon: <TimeIcon /> };
    }

    if (availability.isFull) {
      return { label: 'FULL', color: 'error', icon: <CancelIcon /> };
    }

    if (bookingStatus.isMeetingInProgress) {
      return { label: 'IN PROGRESS', color: 'warning', icon: <TimeIcon /> };
    }

    if (bookingStatus.isTooEarly) {
      return { 
        label: `${bookingStatus.daysUntilStart}D LEFT`, 
        color: 'info', 
        icon: <TimeIcon /> 
      };
    }

    if (bookingStatus.isUpcoming) {
      return { 
        label: 'BOOK NOW', 
        color: 'success', 
        icon: <CheckIcon /> 
      };
    }

    return { label: 'NOT AVAILABLE', color: 'default', icon: <TimeIcon /> };
  };

  const getButtonLabel = (schedule) => {
    const availability = getAvailability(schedule);
    const bookingStatus = canBookNow(schedule);
    
    if (bookingStatus.isEnded) return 'Ended';
    if (availability.isFull) return 'Room Full';
    if (bookingStatus.isMeetingInProgress) return 'In Progress';
    if (bookingStatus.isTooEarly) return `In ${bookingStatus.daysUntilStart}D`;
    if (bookingStatus.isUpcoming) return 'Book Now';
    return 'Not Available';
  };

  const isButtonDisabled = (schedule) => {
    const availability = getAvailability(schedule);
    const bookingStatus = canBookNow(schedule);
    
    if (bookingStatus.isEnded) return true;
    if (availability.isFull) return true;
    if (bookingStatus.isMeetingInProgress) return true;
    if (bookingStatus.isTooEarly) return true;
    return false;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon sx={{ color: '#063b70' }} />
              {viewFilter === 'unique' ? 'Rooms' : viewFilter === 'active' ? 'Active Schedules' : viewFilter === 'bookable' ? 'Available Schedules' : 'Scheduled Rooms'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.fullName ? `Welcome, ${user.fullName}!` : 'Please log in to book a room'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label="Filter by Department"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>

            <Chip
              label={`Showing: ${displaySchedules.length}`}
              color="primary"
              variant="outlined"
            />
            {viewFilter !== 'unique' && (
              <Chip
                label={`Bookable: ${displaySchedules.filter(s => canBookNow(s).canBook).length}`}
                color="success"
                variant="outlined"
              />
            )}
            <Chip
              label={`Full: ${displaySchedules.filter(s => getAvailability(s).isFull).length}`}
              color="error"
              variant="outlined"
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {displaySchedules.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {schedules.length === 0 
                ? 'No room schedules available.' 
                : viewFilter === 'unique' 
                ? 'No rooms available.' 
                : viewFilter === 'bookable'
                ? 'No bookable schedules available at this time.'
                : 'No active schedules available at this time.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {schedules.length === 0 
                ? 'Please check back later or contact your administrator.' 
                : viewFilter === 'unique'
                ? 'No rooms have schedules.'
                : viewFilter === 'bookable'
                ? 'All schedules are either full, in progress, or ended.'
                : 'All schedules have ended or are not yet available.'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {displaySchedules.map((schedule) => {
              const { capacity, bookings, available, isFull } = getAvailability(schedule);
              const bookingStatus = canBookNow(schedule);
              const statusDisplay = getStatusDisplay(schedule);
              const roomName = schedule.room?.roomName || schedule.roomData?.roomName || 'Unnamed Room';
              const department = schedule.room?.department || schedule.roomData?.department || 'N/A';
              const isDisabled = isButtonDisabled(schedule);
              const buttonLabel = getButtonLabel(schedule);

              return (
                <Grid item xs={12} sm={6} md={4} key={schedule._id}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                      <Chip
                        label={statusDisplay.label}
                        color={statusDisplay.color}
                        size="small"
                        icon={statusDisplay.icon}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MeetingRoom fontSize="small" color="primary" />
                        {roomName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {department}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <EventIcon fontSize="small" color="primary" />
                          <strong>Date:</strong> {formatDate(schedule.meetingDate)}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <TimeIcon fontSize="small" color="primary" />
                          <strong>Time:</strong> {schedule.startTime} - {schedule.endTime}
                        </Typography>
                      </Box>

                      {/* ✅ Meeting Title with Icon */}
                      {schedule.meetingTitle && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <EventIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555' }}>
                            "{schedule.meetingTitle}"
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ mb: 2 }} />

                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People fontSize="small" color="primary" />
                            <strong>Capacity</strong>
                          </Typography>
                          <Typography variant="body2">
                            <strong>{bookings}</strong> booked / <strong>{capacity}</strong> total
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={capacity > 0 ? (bookings / capacity) * 100 : 0}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: isFull ? '#d32f2f' : bookings > capacity * 0.8 ? '#ed6c02' : '#2e7d32',
                            }
                          }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Available: {available} {available === 1 ? 'seat' : 'seats'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {capacity > 0 ? Math.round((bookings / capacity) * 100) : 0}% filled
                          </Typography>
                        </Box>
                      </Box>

                      {isFull && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          <Typography variant="body2" fontWeight="bold">
                            🚫 Room Full - No Seats Available
                          </Typography>
                        </Alert>
                      )}

                      {!isFull && bookingStatus.isMeetingInProgress && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            ⏰ Meeting in progress - Booking closed
                          </Typography>
                        </Alert>
                      )}

                      {!isFull && bookingStatus.isTooEarly && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            📅 Available for booking in {bookingStatus.daysUntilStart} days
                          </Typography>
                        </Alert>
                      )}

                      {!isFull && bookingStatus.isUpcoming && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            ✅ {bookingStatus.statusMessage} - Book now!
                          </Typography>
                        </Alert>
                      )}

                      {bookingStatus.isEnded && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            ⏰ Meeting has ended
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleBookRoom(schedule)}
                        disabled={isDisabled}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          bgcolor: isDisabled ? '#9e9e9e' : '#063b70',
                          '&:hover': {
                            bgcolor: isDisabled ? '#9e9e9e' : '#0f6bd4',
                          },
                        }}
                        startIcon={isFull ? <CancelIcon /> : (bookingStatus.isUpcoming) ? <BookOnline /> : <TimeIcon />}
                      >
                        {buttonLabel}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Dialog
          open={bookingOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh',
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Book Room: {selectedSchedule?.room?.roomName || selectedSchedule?.roomData?.roomName || 'Unnamed Room'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSchedule?.room?.department || selectedSchedule?.roomData?.department || 'N/A'} • 
                  Capacity: {selectedSchedule?.room?.maxCapacity || selectedSchedule?.roomData?.maxCapacity || 0} people
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedSchedule && (
              <BookingForm
                room={selectedSchedule.room || selectedSchedule.roomData}
                user={user}
                schedule={selectedSchedule}
                onSuccess={handleBookingSuccess}
                onError={handleBookingError}
                onCancel={handleCloseDialog}
              />
            )}
          </DialogContent>
        </Dialog>

        <TicketDialog
          open={ticketOpen}
          onClose={handleCloseTicket}
          booking={ticketData}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Rooms;
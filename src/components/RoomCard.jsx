import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  People,
  BookOnline,
  AccessTime,
  CalendarToday,
  Schedule,
} from '@mui/icons-material';
import axiosInstance from '../api/axios';

const RoomCard = ({ room, onBook }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduledBookings, setScheduledBookings] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [totalGuestsToday, setTotalGuestsToday] = useState(0);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkRoomAvailability();
    const interval = setInterval(checkRoomAvailability, 60000);
    return () => clearInterval(interval);
  }, [room]);

  const checkRoomAvailability = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.get(`/bookings?room=${room._id}`);
      const bookings = response.data?.data || response.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Filter only APPROVED bookings for today and future
      const approvedBookings = bookings.filter(b => 
        b.status === 'approved' && 
        b.meetingDate >= todayStr
      );

      const sortedBookings = approvedBookings.sort((a, b) => {
        if (a.meetingDate !== b.meetingDate) {
          return a.meetingDate.localeCompare(b.meetingDate);
        }
        return a.startTime.localeCompare(b.startTime);
      });

      setScheduledBookings(sortedBookings);

      // Check if room has ANY scheduled bookings
      setHasSchedule(sortedBookings.length > 0);

      // Filter bookings for today
      const todayApprovedBookings = sortedBookings.filter(b => b.meetingDate === todayStr);
      setTodayBookings(todayApprovedBookings);

      const totalGuests = todayApprovedBookings.reduce((sum, b) => sum + (b.numberOfGuests || 0), 0);
      setTotalGuestsToday(totalGuests);

      // Check if room has any booking for today
      if (todayApprovedBookings.length > 0) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Check if room is currently booked (active booking)
        const activeBooking = todayApprovedBookings.find(b => {
          const startParts = b.startTime.split(':').map(Number);
          const endParts = b.endTime.split(':').map(Number);
          const startMinutes = startParts[0] * 60 + startParts[1];
          const endMinutes = endParts[0] * 60 + endParts[1];
          return currentTime >= startMinutes && currentTime < endMinutes;
        });

        if (activeBooking) {
          // Room is currently in a meeting - NOT available
          setIsAvailable(false);
          setCurrentBooking(activeBooking);
          setLoading(false);
          return;
        }

        // Check if room capacity is full for today
        if (totalGuests >= room.maxCapacity) {
          setIsAvailable(false);
          setCurrentBooking(todayApprovedBookings[todayApprovedBookings.length - 1]);
          setLoading(false);
          return;
        }

        // ✅ FIX: Room has bookings today, still has capacity, and no active booking
        // Room should be AVAILABLE with "Scheduled" status
        setIsAvailable(true);
        setCurrentBooking(todayApprovedBookings[0] || null);
      } else {
        // No bookings for today - room is available
        setIsAvailable(true);
        setCurrentBooking(null);
      }

    } catch (error) {
      console.error('Error checking room availability:', error);
      setError('Failed to check availability');
      setIsAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const parts = time.split(':');
    const hour = parseInt(parts[0]);
    const minute = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isBookingActive = (booking) => {
    if (!booking) return false;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startParts = booking.startTime.split(':').map(Number);
    const endParts = booking.endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    return currentTime >= startMinutes && currentTime < endMinutes;
  };

  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            Checking availability...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Determine status label
  let statusLabel = 'Available';
  let statusColor = 'success';
  
  if (todayBookings.length > 0) {
    const active = todayBookings.find(b => isBookingActive(b));
    if (active) {
      statusLabel = 'In Progress';
      statusColor = 'warning';
    } else if (totalGuestsToday >= room.maxCapacity) {
      statusLabel = 'Full';
      statusColor = 'error';
    } else if (hasSchedule) {
      statusLabel = 'Scheduled';
      statusColor = 'info';
    }
  } else if (hasSchedule) {
    statusLabel = 'Scheduled';
    statusColor = 'info';
  }

  // Get next scheduled time for display
  const nextScheduled = scheduledBookings.length > 0 ? scheduledBookings[0] : null;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Room Name and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {room.roomName}
          </Typography>
          <Chip
            label={statusLabel}
            size="small"
            color={statusColor}
            icon={statusLabel === 'Scheduled' ? <Schedule fontSize="small" /> : undefined}
          />
        </Box>

        {/* Room Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Building {room.buildingNumber}, Floor {room.floorNumber}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <People fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Capacity: {room.maxCapacity} people
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {room.department}
        </Typography>

        {/* Scheduled Info - Show when room has schedule */}
        {hasSchedule && nextScheduled && (
          <Alert severity="info" sx={{ mt: 1, mb: 2, py: 0.5 }}>
            <Typography variant="caption">
              <strong>Scheduled on {formatDate(nextScheduled.meetingDate)} at {formatTime(nextScheduled.startTime)}</strong>
              {todayBookings.length > 0 && ` • ${totalGuestsToday}/${room.maxCapacity} capacity used today`}
            </Typography>
          </Alert>
        )}

        {/* Today's Booking Status */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Divider sx={{ mb: 1.5 }} />
          
          {todayBookings.length > 0 ? (
            <>
              <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                Today's Schedule ({todayBookings.length} meetings)
              </Typography>
              
              {todayBookings.slice(0, 3).map((booking, index) => {
                const isActive = isBookingActive(booking);
                return (
                  <Box 
                    key={booking._id || index}
                    sx={{ 
                      bgcolor: isActive ? '#e3f2fd' : '#f5f7fa', 
                      borderRadius: 1, 
                      p: 1, 
                      mb: 1,
                      borderLeft: `3px solid ${isActive ? '#1976d2' : '#9e9e9e'}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <AccessTime fontSize="small" sx={{ fontSize: '0.8rem' }} color="action" />
                      <Typography variant="caption" fontWeight={isActive ? 'bold' : 'normal'}>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        {isActive && ' (In Progress)'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People fontSize="small" sx={{ fontSize: '0.7rem' }} color="action" />
                      <Typography variant="caption">
                        {booking.numberOfGuests} guests
                      </Typography>
                      {booking.meetingTitle && (
                        <Chip 
                          label={booking.meetingTitle} 
                          size="small" 
                          variant="outlined"
                          sx={{ ml: 0.5, fontSize: '0.55rem', height: 16 }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}

              {todayBookings.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{todayBookings.length - 3} more meetings today
                </Typography>
              )}

              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Capacity used: {totalGuestsToday} / {room.maxCapacity} people
                </Typography>
                <Box sx={{ 
                  mt: 0.5, 
                  width: '100%', 
                  height: 4, 
                  bgcolor: '#e0e0e0', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    width: `${Math.min((totalGuestsToday / room.maxCapacity) * 100, 100)}%`, 
                    height: '100%', 
                    bgcolor: totalGuestsToday >= room.maxCapacity ? '#f44336' : '#4caf50',
                    borderRadius: 2,
                    transition: 'width 0.3s ease'
                  }} />
                </Box>
              </Box>
            </>
          ) : hasSchedule ? (
            <Typography variant="body2" color="text.secondary">
              Scheduled for future date
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No meetings scheduled for today
            </Typography>
          )}
        </Box>

        {/* Upcoming Bookings */}
        {scheduledBookings.filter(b => b.meetingDate > new Date().toISOString().split('T')[0]).length > 0 && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
              Upcoming Meetings
            </Typography>
            {scheduledBookings
              .filter(b => b.meetingDate > new Date().toISOString().split('T')[0])
              .slice(0, 2)
              .map((booking, index) => (
                <Box 
                  key={booking._id || index}
                  sx={{ 
                    bgcolor: '#f5f7fa', 
                    borderRadius: 1, 
                    p: 0.5, 
                    mb: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CalendarToday fontSize="small" sx={{ fontSize: '0.7rem' }} color="action" />
                  <Typography variant="caption">
                    {formatDate(booking.meetingDate)} • {formatTime(booking.startTime)}
                  </Typography>
                </Box>
              ))}
          </Box>
        )}

        {/* Availability Messages */}
        {!isAvailable && currentBooking && isBookingActive(currentBooking) && (
          <Alert severity="warning" sx={{ mt: 1, mb: 2, py: 0.5 }}>
            <Typography variant="caption">
              Currently in progress: {formatTime(currentBooking.startTime)} - {formatTime(currentBooking.endTime)}
            </Typography>
          </Alert>
        )}

        {!isAvailable && totalGuestsToday >= room.maxCapacity && todayBookings.length > 0 && (
          <Alert severity="error" sx={{ mt: 1, mb: 2, py: 0.5 }}>
            <Typography variant="caption">
              Room at full capacity today ({totalGuestsToday}/{room.maxCapacity})
            </Typography>
          </Alert>
        )}

        {isAvailable && todayBookings.length > 0 && totalGuestsToday < room.maxCapacity && (
          <Alert severity="info" sx={{ mt: 1, mb: 2, py: 0.5 }}>
            <Typography variant="caption">
              Available for booking • {totalGuestsToday}/{room.maxCapacity} capacity used today
            </Typography>
          </Alert>
        )}

        {isAvailable && todayBookings.length === 0 && hasSchedule && (
          <Alert severity="success" sx={{ mt: 1, mb: 2, py: 0.5 }}>
            <Typography variant="caption">
              Room is scheduled • Available for booking
            </Typography>
          </Alert>
        )}

        {isAvailable && todayBookings.length === 0 && !hasSchedule && (
          <Alert severity="success" sx={{ mt: 1, mb: 2, py: 0.5 }}>
            <Typography variant="caption">
              No meetings today • Available for booking
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1, mb: 2, py: 0.5 }}>
            <Typography variant="caption">{error}</Typography>
          </Alert>
        )}

        {/* Book Button */}
        <Tooltip title={isAvailable ? 'Book this room' : 'Room is currently unavailable'}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<BookOnline />}
            onClick={() => onBook(room)}
            disabled={!isAvailable}
            sx={{ mt: 'auto' }}
          >
            {isAvailable ? 'Book Room' : 'Unavailable'}
          </Button>
        </Tooltip>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
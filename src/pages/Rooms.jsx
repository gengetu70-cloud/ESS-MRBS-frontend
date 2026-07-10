import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  MeetingRoom,
  People,
  LocationOn,
  Close as CloseIcon,
  BookOnline,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import BookingForm from '../components/BookingForm';
// IMPORT: TicketDialog component
import TicketDialog from '../components/TicketDialog';

const Rooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  // NEW: Ticket dialog state
  const [ticketOpen, setTicketOpen] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/rooms');
      const roomsData = response.data.data || [];
      setRooms(roomsData);

      const depts = [...new Set(roomsData.map((r) => r.department))];
      setDepartments(depts);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setBookingOpen(true);
  };

  // MODIFIED: Handle booking success - show ticket dialog
  const handleBookingSuccess = (booking) => {
    console.log('✅ Booking successful:', booking);
    setBookingOpen(false);
    // Set booking data and open ticket dialog
    setBookingData(booking);
    setTicketOpen(true);
    setSnackbar({
      open: true,
      message: 'Booking created successfully! 🎉 Check your ticket!',
      severity: 'success',
    });
    fetchRooms();
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
    setSelectedRoom(null);
  };

  // NEW: Close ticket dialog
  const handleCloseTicket = () => {
    setTicketOpen(false);
    setBookingData(null);
  };

  const filteredRooms = filterDepartment
    ? rooms.filter((room) => room.department === filterDepartment)
    : rooms;

  const availableRooms = filteredRooms.filter((r) => r.status === 'available');
  const bookedRooms = filteredRooms.filter((r) => r.status === 'booked');

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
          <Typography variant="h4" fontWeight="bold">
            Meeting Rooms
          </Typography>

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
              label={`Available: ${availableRooms.length}`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Booked: ${bookedRooms.length}`}
              color="warning"
              variant="outlined"
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {filteredRooms.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No rooms found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredRooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} key={room._id}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {room.roomName}
                      </Typography>
                      <Chip
                        label={room.status}
                        size="small"
                        color={room.status === 'available' ? 'success' : 'warning'}
                      />
                    </Box>

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
                      Department: {room.department}
                    </Typography>

                    {room.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {room.description}
                      </Typography>
                    )}

                    {room.amenities && room.amenities.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <Chip key={idx} label={amenity} size="small" variant="outlined" />
                        ))}
                        {room.amenities.length > 3 && (
                          <Chip label={`+${room.amenities.length - 3} more`} size="small" variant="outlined" />
                        )}
                      </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<BookOnline />}
                        onClick={() => handleBookRoom(room)}
                        disabled={room.status !== 'available'}
                        sx={{ mt: 2 }}
                      >
                        {room.status === 'available' ? 'Book This Room' : 'Currently Booked'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Booking Dialog */}
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
                  Book Room: {selectedRoom?.roomName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRoom?.department} • Capacity: {selectedRoom?.maxCapacity} people
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedRoom && (
              <BookingForm
                room={selectedRoom}
                user={user}
                onSuccess={handleBookingSuccess}
                onError={handleBookingError}
                onCancel={handleCloseDialog}
                // NEW: Disable internal ticket dialog
                showTicketDialog={false}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Ticket Dialog - Moved outside the booking dialog */}
        <TicketDialog
          open={ticketOpen}
          onClose={handleCloseTicket}
          booking={bookingData}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
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
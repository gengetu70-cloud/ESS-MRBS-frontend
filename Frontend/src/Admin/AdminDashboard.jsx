import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  MeetingRoom,
  BookOnline,
  People,
  Dashboard as DashboardIcon,
  PersonAdd,
  Room,
  Assessment,
  Schedule,
  Close as CloseIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import AdminBookingScheduler from '../components/AdminBookingScheduler'; // Import the new component

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    availableRooms: 0,
    bookedRooms: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    teaServiceRequests: 0,
  });
  
  // State for Admin Booking Scheduler Dialog
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch users
      const usersRes = await axiosInstance.get('/users');
      const users = usersRes.data.data || [];

      // Fetch rooms
      const roomsRes = await axiosInstance.get('/rooms');
      const rooms = roomsRes.data.data || [];
      setRooms(rooms); // Store rooms for scheduler

      // Fetch bookings
      const bookingsRes = await axiosInstance.get('/bookings');
      const bookings = bookingsRes.data.data || [];

      // Calculate stats
      const availableRooms = rooms.filter(r => r.status === 'available').length;
      const bookedRooms = rooms.filter(r => r.status === 'booked').length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const approvedBookings = bookings.filter(b => b.status === 'approved').length;
      const rejectedBookings = bookings.filter(b => b.status === 'rejected').length;
      const teaServiceRequests = bookings.filter(b => b.teaService).length;

      setStats({
        totalUsers: users.length,
        totalRooms: rooms.length,
        totalBookings: bookings.length,
        availableRooms,
        bookedRooms,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        teaServiceRequests,
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Open schedule dialog
  const handleOpenScheduleDialog = () => {
    if (rooms.length === 0) {
      setError('No rooms available to schedule. Please add rooms first.');
      return;
    }
    setSelectedRoom(rooms[0]); // Select first room by default
    setScheduleDialogOpen(true);
  };

  // Close schedule dialog
  const handleCloseScheduleDialog = () => {
    setScheduleDialogOpen(false);
    setSelectedRoom(null);
  };

  // Handle successful scheduling
  const handleScheduleSuccess = (ticketData) => {
    console.log('✅ Schedule success:', ticketData);
    // Refresh dashboard data
    fetchDashboardData();
    // Close dialog after a delay
    setTimeout(() => {
      handleCloseScheduleDialog();
    }, 2000);
  };

  // Handle scheduling error
  const handleScheduleError = (error) => {
    console.error('❌ Schedule error:', error);
    // Error is already shown in the scheduler component
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      action: '/admin/users',
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: <MeetingRoom sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      action: '/admin/rooms',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <BookOnline sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      action: '/admin/bookings',
    },
    {
      title: 'Available Rooms',
      value: stats.availableRooms,
      icon: <MeetingRoom sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      action: '/rooms',
    },
  ];

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.fullName || 'Admin'}! Here is an overview of the system.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  cursor: stat.action && stat.action !== '#' ? 'pointer' : 'default',
                  '&:hover': {
                    boxShadow: stat.action && stat.action !== '#' ? 6 : 2,
                  },
                }}
                onClick={() => stat.action && stat.action !== '#' && navigate(stat.action)}
              >
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/admin/users')}
              sx={{ py: 2 }}
            >
              Manage Users
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Room />}
              onClick={() => navigate('/admin/rooms')}
              sx={{ py: 2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              Manage Rooms
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Assessment />}
              onClick={() => navigate('/admin/reports')}
              sx={{ py: 2, bgcolor: '#ed6c02', '&:hover': { bgcolor: '#e65100' } }}
            >
              View Reports
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<BookOnline />}
              onClick={() => navigate('/admin/bookings')}
              sx={{ py: 2, bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            >
              Manage Bookings
            </Button>
          </Grid>
        </Grid>

        {/* NEW: Admin Schedule Section */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 4,
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
            border: '1px solid #90caf9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Schedule sx={{ fontSize: 40, color: '#1976d2' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Admin Booking Scheduler
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Schedule approved meetings for users to book
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Schedule />}
              onClick={handleOpenScheduleDialog}
              sx={{ 
                py: 1.5,
                px: 4,
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' }
              }}
            >
              Schedule New Meeting
            </Button>
          </Box>
        </Paper>

        {/* Booking Statistics */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 4 }}>
            Booking Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="warning.main">
                  {stats.pendingBookings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="success.main">
                  {stats.approvedBookings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="error.main">
                  {stats.rejectedBookings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="info.main">
                  {stats.teaServiceRequests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tea Service Requests
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Admin Booking Scheduler Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={handleCloseScheduleDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
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
            <Schedule />
            <Typography variant="h6" fontWeight="bold">
              Schedule Meeting
            </Typography>
          </Box>
          <IconButton onClick={handleCloseScheduleDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* Room Selector */}
          {rooms.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Select Room to Schedule
              </Typography>
              <Grid container spacing={1}>
                {rooms.map((room) => (
                  <Grid item key={room._id}>
                    <Button
                      variant={selectedRoom?._id === room._id ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setSelectedRoom(room)}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        ...(selectedRoom?._id === room._id && {
                          bgcolor: '#1976d2',
                          '&:hover': { bgcolor: '#1565c0' }
                        })
                      }}
                    >
                      {room.roomName}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Admin Booking Scheduler Component */}
          {selectedRoom && (
            <AdminBookingScheduler
              room={selectedRoom}
              user={user}
              onSuccess={handleScheduleSuccess}
              onError={handleScheduleError}
              onCancel={handleCloseScheduleDialog}
            />
          )}

          {rooms.length === 0 && (
            <Alert severity="warning">
              No rooms available. Please add rooms first.
              <Button
                size="small"
                onClick={() => {
                  handleCloseScheduleDialog();
                  navigate('/admin/rooms');
                }}
                sx={{ ml: 2 }}
              >
                Add Room
              </Button>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDashboard;
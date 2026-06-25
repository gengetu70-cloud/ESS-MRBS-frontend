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
} from '@mui/material';
import {
  MeetingRoom,
  BookOnline,
  People,
  Dashboard as DashboardIcon,
  PersonAdd,
  Room,
  Assessment,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

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
    </>
  );
};

export default AdminDashboard;
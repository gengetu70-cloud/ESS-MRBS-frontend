import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Skeleton,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  MeetingRoom,
  BookOnline,
  People,
  EventAvailable,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle,
  Pending,
  Cancel,
  CalendarToday,
  AccessTime,
  PersonAdd,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    myBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentBookings, setRecentBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      
      const roomsRes = await axiosInstance.get('/rooms');
      const rooms = roomsRes.data?.data || roomsRes.data || [];

      const bookingsRes = await axiosInstance.get('/bookings');
      const bookings = bookingsRes.data?.data || bookingsRes.data || [];

      const myBookings = bookings.filter(
        b => b.scheduledBy?._id === user?.id || 
             b.scheduledBy === user?.id || 
             b.scheduledBy === user?._id
      );

      const pendingBookings = myBookings.filter(b => b.status?.toLowerCase() === 'pending').length;
      const approvedBookings = myBookings.filter(b => b.status?.toLowerCase() === 'approved').length;
      const rejectedBookings = myBookings.filter(b => b.status?.toLowerCase() === 'rejected').length;

      setStats({
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.status?.toLowerCase() === 'available').length,
        myBookings: myBookings.length,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
      });

      const sorted = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentBookings(sorted.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getStatusChip = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending':
        return <Chip icon={<Pending />} label="Pending" size="small" color="warning" variant="outlined" />;
      case 'approved':
        return <Chip icon={<CheckCircle />} label="Approved" size="small" color="success" variant="outlined" />;
      case 'rejected':
        return <Chip icon={<Cancel />} label="Rejected" size="small" color="error" variant="outlined" />;
      default:
        return <Chip label={status || 'Unknown'} size="small" variant="outlined" />;
    }
  };

  const statsCards = [
    { 
      icon: <MeetingRoom sx={{ fontSize: isMobile ? 22 : 28 }} />, 
      value: stats.totalRooms, 
      label: 'Total Rooms', 
      color: '#1976d2',
      bgColor: '#e3f2fd',
      iconBg: '#bbdefb',
      path: '/rooms'
    },
    { 
      icon: <EventAvailable sx={{ fontSize: isMobile ? 22 : 28 }} />, 
      value: stats.availableRooms, 
      label: 'Available Rooms', 
      color: '#2e7d32',
      bgColor: '#e8f5e9',
      iconBg: '#c8e6c9',
      path: '/rooms'
    },
    { 
      icon: <People sx={{ fontSize: isMobile ? 22 : 28 }} />, 
      value: stats.myBookings, 
      label: 'My Bookings', 
      color: '#9c27b0',
      bgColor: '#f3e5f5',
      iconBg: '#e1bee7',
      path: '/bookings'
    },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', p: 0 }}>
          <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Skeleton variant="rectangular" height={isMobile ? 80 : 100} sx={{ borderRadius: 2, mb: 2 }} />
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={isMobile ? 80 : 100} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rectangular" height={isMobile ? 150 : 200} sx={{ borderRadius: 2 }} />
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ 
        bgcolor: '#f5f7fa', 
        minHeight: '100vh',
        p: 0,
        m: 0,
      }}>
        <Container 
          maxWidth={false} 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            py: { xs: 1, sm: 1.5, md: 4 },
            width: '100%',
          }}
        >
          {/* Dashboard Title - Clean, no blue banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ mb: { xs: 1.5, sm: 2, md: 4.5 } }}>
              <Typography 
                variant="h5" 
                fontWeight="600" 
                sx={{ 
                  fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.4rem' },
                  color: '#0a1628',
                  mb: 1.5
                }}
              >
                User Dashboard
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '1rem', md: '1.1rem' }
                }}
              >
                Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! Here is an overview of your bookings.
              </Typography>
            </Box>
          </motion.div>

          {error && (
            <Alert severity="error" sx={{ mb: { xs: 1.5, sm: 2 }, borderRadius: 2, py: 0 }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards - Compact & Equal */}
          <Grid container spacing={{ xs: 1, sm: 1.5, md: 3 }} sx={{ mb: { xs: 1.5, sm: 3, md: 2.5 } }}>
            {statsCards.map((stat, i) => (
              <Grid item xs={6} md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  style={{ height: '100%' }}
                >
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 2.5 },
                      borderRadius: { xs: 2, sm: 2, md: 3 },
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': { 
                        transform: 'translateY(-3px)',
                        boxShadow: 4,
                      },
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => navigate(stat.path)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, width: '100%' }}>
                      <Box
                        sx={{
                          p: { xs: 1, sm: 1.2, md: 1.5 },
                          borderRadius: '50%',
                          bgcolor: stat.iconBg,
                          color: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h4" 
                          fontWeight="bold" 
                          color={stat.color}
                          sx={{ fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.4rem' }, lineHeight: 1.2 }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.8rem' } }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* My Booking Status - Compact */}
          <Paper sx={{ 
            p: { xs: 1.5, sm: 2, md: 2.5 }, 
            borderRadius: { xs: 2, sm: 2, md: 3 }, 
            mb: { xs: 1.5, sm: 2, md: 2.5 },
          }}>
            <Typography 
              variant="subtitle1" 
              fontWeight="600" 
              sx={{ 
                mb: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' }
              }}
            >
              My Booking Status
            </Typography>
            <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ width: '100%', mx: 0 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 1.5 }, bgcolor: '#fff3e0', borderRadius: 2 }}>
                  <Typography 
                    variant="h4" 
                    color="#ed6c02"
                    sx={{ fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.4rem' } }}
                  >
                    {stats.pendingBookings}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' } }}
                  >
                    Pending
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.myBookings > 0 ? (stats.pendingBookings / stats.myBookings) * 100 : 0} 
                    sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: '#ffe0b2' }}
                    color="warning"
                  />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 1.5 }, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                  <Typography 
                    variant="h4" 
                    color="#2e7d32"
                    sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
                  >
                    {stats.approvedBookings}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' } }}
                  >
                    Approved
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.myBookings > 0 ? (stats.approvedBookings / stats.myBookings) * 100 : 0} 
                    sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: '#c8e6c9' }}
                    color="success"
                  />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 1.5 }, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Typography 
                    variant="h4" 
                    color="#d32f2f"
                    sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
                  >
                    {stats.rejectedBookings}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' } }}
                  >
                    Rejected
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.myBookings > 0 ? (stats.rejectedBookings / stats.myBookings) * 100 : 0} 
                    sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: '#ffcdd2' }}
                    color="error"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Quick Actions - Centered */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: { xs: 1.5, sm: 2, md: 2.5 },
            width: '100%',
          }}>
            <Typography 
              variant="subtitle1" 
              fontWeight="600" 
              sx={{ 
                mb: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' },
                textAlign: 'center',
                width: '100%',
              }}
            >
              Quick Actions
            </Typography>
            <Grid 
              container 
              spacing={{ xs: 1, sm: 1.5 }} 
              sx={{ 
                width: '100%', 
                mx: 0,
                maxWidth: { xs: '100%', sm: '80%', md: '60%' },
                justifyContent: 'center',
              }}
            >
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<MeetingRoom sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  onClick={() => navigate('/rooms')}
                  sx={{ 
                    py: { xs: 1, sm: 1.2 }, 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                  }}
                >
                  View Rooms
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<BookOnline sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  onClick={() => navigate('/bookings')}
                  sx={{ 
                    py: { xs: 1, sm: 1.2 }, 
                    borderRadius: 2, 
                    bgcolor: '#ed6c02',
                    '&:hover': { bgcolor: '#e65100' },
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                  }}
                >
                  My Bookings
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Recent Bookings - Compact */}
          <Paper sx={{ 
            p: { xs: 1.5, sm: 2, md: 2.5 }, 
            borderRadius: { xs: 2, sm: 2, md: 3 },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1, sm: 1.5 } }}>
              <Typography 
                variant="subtitle1" 
                fontWeight="600"
                sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' } }}
              >
                Recent Bookings
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForwardIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                onClick={() => navigate('/bookings')}
                sx={{ 
                  textTransform: 'none',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  minWidth: 'auto',
                  p: { xs: '4px 8px', sm: '6px 12px' },
                }}
              >
                View All
              </Button>
            </Box>
            {recentBookings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                <EventAvailable sx={{ fontSize: { xs: 28, sm: 36 }, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                  No recent bookings found.
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ mt: 1, borderRadius: 2 }}
                  onClick={() => navigate('/rooms')}
                >
                  Book a Room
                </Button>
              </Box>
            ) : (
              recentBookings.map((booking, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card 
                    sx={{ 
                      mb: 0.5, 
                      '&:last-child': { mb: 0 },
                      borderRadius: 1.5,
                      transition: 'all 0.15s ease',
                      '&:hover': { 
                        boxShadow: 2,
                        transform: 'translateX(2px)',
                      },
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/bookings/${booking._id}`)}
                  >
                    <CardContent sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      flexWrap: 'wrap',
                      gap: 0.5,
                      p: { xs: 1, sm: 1.5 },
                      '&:last-child': { pb: { xs: 1, sm: 1.5 } },
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: '#1976d2',
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                          }}
                        >
                          <MeetingRoom sx={{ fontSize: { xs: 14, sm: 16 } }} />
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            fontWeight="600"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                          >
                            {booking.room?.roomName || 'Unknown Room'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
                            >
                              <CalendarToday sx={{ fontSize: { xs: 10, sm: 12 } }} />
                              {new Date(booking.meetingDate).toLocaleDateString()}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
                            >
                              <AccessTime sx={{ fontSize: { xs: 10, sm: 12 } }} />
                              {booking.startTime} - {booking.endTime}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
                            >
                              <PersonAdd sx={{ fontSize: { xs: 10, sm: 12 } }} />
                              {booking.numberOfGuests} guests
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                        {getStatusChip(booking.status)}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </Paper>

          {/* Footer Info - Compact */}
          <Box sx={{ mt: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
            >
              © {new Date().getFullYear()} ESS MRBS - Meeting Room Booking System
            </Typography>
          </Box>
        </Container>
      </Box>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default Dashboard;
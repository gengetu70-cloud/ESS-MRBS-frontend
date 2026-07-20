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
  Schedule as ScheduleIcon,
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
    totalSchedules: 0,
    availableSchedules: 0,
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

      const schedulesRes = await axiosInstance.get('/schedules');
      const schedules = schedulesRes.data?.data || schedulesRes.data || [];

      const now = new Date();

      // ✅ Check if a schedule is bookable
      const isScheduleBookable = (schedule) => {
        const meetingDate = new Date(schedule.meetingDate);
        const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
        
        const meetingStart = new Date(meetingDate);
        meetingStart.setHours(startHour, startMinute, 0, 0);
        
        const meetingEnd = new Date(meetingDate);
        meetingEnd.setHours(endHour, endMinute, 0, 0);
        
        const meetingEndWithGrace = new Date(meetingEnd.getTime() + 5 * 60 * 1000);
        
        // Check if ended
        if (now > meetingEndWithGrace) return false;
        
        // Check if in progress
        if (now >= meetingStart && now <= meetingEnd) return false;
        
        // Check if too early (more than 5 days before)
        const daysUntilStart = Math.floor((meetingStart - now) / (1000 * 60 * 60 * 24));
        if (daysUntilStart > 5) return false;
        
        // Check if full
        const capacity = schedule.room?.maxCapacity || schedule.maxCapacity || 0;
        const bookingsCount = schedule.currentBookings || schedule.bookings?.length || 0;
        if (capacity - bookingsCount <= 0) return false;
        
        return true;
      };

      // ✅ Active schedules (not ended)
      const activeSchedules = schedules.filter(schedule => {
        const meetingDate = new Date(schedule.meetingDate);
        const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
        
        const meetingStart = new Date(meetingDate);
        meetingStart.setHours(startHour, startMinute, 0, 0);
        
        const meetingEnd = new Date(meetingDate);
        meetingEnd.setHours(endHour, endMinute, 0, 0);
        
        const meetingEndWithGrace = new Date(meetingEnd.getTime() + 5 * 60 * 1000);
        return now <= meetingEndWithGrace;
      });

      // ✅ Bookable schedules (active + has seats + within 5-day window + not in progress)
      const bookableSchedules = activeSchedules.filter(isScheduleBookable);

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
        totalSchedules: activeSchedules.length,
        availableSchedules: bookableSchedules.length, // ✅ Now counts bookable schedules
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

  // ✅ Handle navigation with URL parameters
  const handleNavigateToRooms = (filterType) => {
    navigate(`/rooms?filter=${filterType}`);
  };

  const statsCards = [
    { 
      icon: <MeetingRoom sx={{ fontSize: isMobile ? 22 : 28 }} />, 
      value: stats.totalRooms, 
      label: 'Total Rooms', 
      color: '#07437e',
      bgColor: '#d8e0e6',
      iconBg: '#d4dde4',
      path: '/rooms',
      filter: 'unique'
    },
    { 
      icon: <ScheduleIcon sx={{ fontSize: isMobile ? 22 : 28 }} />, 
      value: stats.totalSchedules, 
      label: 'Total Schedules', 
      color: '#0b457f',
      bgColor: '#d5dde3',
      iconBg: '#d3dce3',
      path: '/rooms',
      filter: 'all'
    },
    { 
      icon: <EventAvailable sx={{ fontSize: isMobile ? 22 : 28 }} />, 
      value: stats.availableSchedules, 
      label: 'Available Schedules', 
      color: '#083979',
      bgColor: '#dae1e8',
      iconBg: '#d4dbe3',
      path: '/rooms',
      filter: 'bookable' // ✅ Changed from 'active' to 'bookable'
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
                  color: '#082857',
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
                    onClick={() => handleNavigateToRooms(stat.filter)}
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
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 1.5 }, bgcolor: '#dce4ea', borderRadius: 2 }}>
                  <Typography 
                    variant="h4" 
                    color="#063372"
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
                    sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: '#dae0e6' }}
                    color="warning"
                  />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 1.5 }, bgcolor: '#d6dee4', borderRadius: 2 }}>
                  <Typography 
                    variant="h4" 
                    color="#0b4b94"
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
                    sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: '#d7dfe7' }}
                    color="success"
                  />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 1.5 }, bgcolor: '#dee4ea', borderRadius: 2 }}>
                  <Typography 
                    variant="h4" 
                    color="#0e57b1"
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
                    sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: '#dde3ea' }}
                    color="error"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

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
                  onClick={() => handleNavigateToRooms('unique')}
                  sx={{ 
                    py: { xs: 1, sm: 1.2 }, 
                    borderRadius: 2,
                     bgcolor: '#063b85',
                    '&:hover': { bgcolor: '#1271f6' },
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
                    bgcolor: '#073b84',
                    '&:hover': { bgcolor: '#1271f6' },
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
                  onClick={() => handleNavigateToRooms('unique')}
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
                            bgcolor: '#0b56a1',
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
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: { xs: '0.6rem', sm: '0.7rem' } }} >
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
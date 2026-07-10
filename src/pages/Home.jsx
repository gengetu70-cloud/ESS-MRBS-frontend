import React, { useState, useEffect, useRef } from 'react';
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
  Stack,
  Divider,
  Fade,
  Zoom,
} from '@mui/material';
import {
  MeetingRoom,
  Login as LoginIcon,
  BookOnline,
  TrendingUp,
  Schedule,
  CheckCircle,
  EventAvailable,
  PlayCircle,
  CalendarToday,
  Notifications,
  People,
  Analytics,
  Security,
  Speed,
  Star,
  Verified,
  Business,
  School,
  Public,
  Apartment,
  AutoAwesome,
} from '@mui/icons-material';
import { motion, useAnimation, useInView } from 'framer-motion';
import Navbar from '../components/Navbar';
import ImageSlideshow from '../components/ImageSlideshow'; // ADD THIS IMPORT
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

// ============================================
// ANIMATION COMPONENTS
// ============================================

const AnimatedSection = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay } },
      }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedCounter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

// ============================================
// DATA
// ============================================

const features = [
  { icon: <MeetingRoom />, title: 'Smart Room Booking', desc: 'Intelligent room suggestions based on your preferences', color: '#1976d2' },
  { icon: <Schedule />, title: 'Real-Time Availability', desc: 'See live room availability and book instantly', color: '#2e7d32' },
  { icon: <CalendarToday />, title: 'Interactive Calendar', desc: 'Visual calendar view for easy scheduling', color: '#ed6c02' },
  { icon: <Notifications />, title: 'Instant Notifications', desc: 'Real-time alerts for booking confirmations', color: '#9c27b0' },
  { icon: <Analytics />, title: 'Advanced Analytics', desc: 'Track room utilization and generate reports', color: '#d32f2f' },
  { icon: <Security />, title: 'Secure Authentication', desc: 'Enterprise-grade security with role-based access', color: '#1976d2' },
];

const testimonials = [
  {
    name: 'Beker Shale Dulle (Phd)',
    position: 'General Director',
    feedback: 'ESS MRBS has revolutionized how we manage our meeting spaces. The efficiency gains are remarkable!',
  },
  {
    name: 'Meron Kifelew (Phd)',
    position: 'Statistica Digitalization Division',
    feedback: 'The best meeting room booking system we have ever used. Seamless integration and intuitive design.',
  },
  {
    name: 'Didimos Ayele Kebede',
    position: 'Information Technology and Infrastructure Development Chief Executive Officer',
    feedback: 'Managing 100+ meeting rooms across multiple locations has never been easier. Highly recommended!',
  },
];

// ============================================
// MAIN COMPONENT - LANDING PAGE
// ============================================

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    fetchData();
    setAnimated(true);
  }, []);

  const fetchData = async () => {
    try {
      const roomsRes = await axiosInstance.get('/rooms');
      const rooms = roomsRes.data.data || [];
      setStats({
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.status === 'available').length,
        totalBookings: 12,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', overflow: 'hidden' }}>

        {/* ==========================================
            IMAGE SLIDESHOW - RIGHT BELOW NAVBAR
            ========================================== */}
        <ImageSlideshow />

        {/* ==========================================
            HERO SECTION
            ========================================== */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0a1628 0%, #0d47a1 40%, #1565c0 70%, #42a5f5 100%)',
            color: 'white',
            py: { xs: 8, md: 14 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {[...Array(30)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '50%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 15 + 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Fade in={animated} timeout={1000}>
              <Box textAlign="center">
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}>
                </motion.div>

                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Typography
                    variant="h1"
                    fontWeight="700"
                    sx={{
                      fontSize: { xs: '0.2rem', md: '1.8rem', lg: '2.5rem' },
                      mb: 2,
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }} >
                    <Box component="span" sx={{ color: '#85b8e2', display: 'block' }}>
                      ESS Meeting Room Booking System
                    </Box>
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    {!isAuthenticated && (
                      <>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={<LoginIcon />}
                            onClick={() => navigate('/login')}
                            sx={{
                              bgcolor: 'white',
                              color: '#92b2e2',
                              px: 5,
                              py: 1.8,
                              borderRadius: '50px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: '#f5f5f5',
                                transform: 'translateY(-3px)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                              },
                            }}
                          >
                            Login to Get Started
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        </motion.div>
                      </>
                    )}
                  </Stack>
                </motion.div>
              </Box>
            </Fade>
          </Container>
        </Box><br/>

        {/* ==========================================
            STATS CARDS
            ========================================== */}
        <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={10}>
            {[
              { icon: <MeetingRoom />, value: stats.totalRooms, label: 'Total Rooms', color: '#1976d2' },
              { icon: <EventAvailable />, value: stats.availableRooms, label: 'Available Rooms', color: '#2e7d32' },
              { icon: <BookOnline />, value: stats.totalBookings, label: 'Total Bookings', color: '#ed6c02' },
              { icon: <People />, value: 10, label: 'Active Users', color: '#9c27b0' },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Zoom in={animated} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 2,
                      background: 'white',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                        borderColor: stat.color,
                      },
                    }}
                  >
                    <Box sx={{ color: stat.color, fontSize: 10, mb: 1 }}>{stat.icon}</Box>
                    <Typography variant="h3" fontWeight="bold" color={stat.color}>
                      <AnimatedCounter target={stat.value} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container><br/>

        {/* ==========================================
            FEATURES
            ========================================== */}
        <Box sx={{ bgcolor: 'white', py: 8 }}>
          <Container maxWidth="lg">
            <AnimatedSection>
              <Typography variant="h4" fontWeight="600" textAlign="center" gutterBottom>
                Everything You Need to Manage Meeting Rooms
              </Typography>
            </AnimatedSection>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {features.map((feature, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <AnimatedSection delay={i * 0.1}>
                    <motion.div
                      whileHover={{ y: -10, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <Card
                        sx={{
                          p: 3,
                          height: '100%',
                          borderRadius: 4,
                          border: `2px solid ${hoveredCard === i ? feature.color : 'transparent'}`,
                          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          boxShadow: hoveredCard === i ? `0 12px 40px ${feature.color}30` : 'none',
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 3,
                            bgcolor: `${feature.color}15`,
                            color: feature.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 32,
                            mb: 2,
                            transition: 'all 0.3s ease',
                            transform: hoveredCard === i ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.desc}
                        </Typography>
                      </Card>
                    </motion.div>
                  </AnimatedSection>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ==========================================
            TESTIMONIALS
            ========================================== */}
        <Box sx={{ bgcolor: '#f5f7fa', py: 6 }}>
          <Container maxWidth="lg">
            <AnimatedSection>
              <Typography variant="h5" fontWeight="600" textAlign="center" gutterBottom>
                What Our Users Say
              </Typography>
            </AnimatedSection>
            <Grid container spacing={5} sx={{ mt: 2 }}>
              {testimonials.map((t, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <AnimatedSection delay={i * 0.2}>
                    <Card sx={{ p: 3, height: '100%', borderRadius: 4, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                        {[...Array(5)].map((_, j) => <Star key={j} sx={{ color: '#ffb400' }} />)}
                      </Box>
                      <Typography sx={{ fontStyle: 'italic', mb: 2 }}>"{t.feedback}"</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{t.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">{t.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.position}, {t.organization}</Typography>
                        </Box>
                      </Box>
                    </Card>
                  </AnimatedSection>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ==========================================
            CTA
            ========================================== */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0a1628 0%, #0d47a1 50%, #1565c0 100%)',
            color: 'white',
            py: 10,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}   >
              {!isAuthenticated && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: 'white',
                      color: '#0d47a1',
                      px: 6,
                      py: 1.8,
                      borderRadius: '50px',
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    Get Started
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </Container>
        </Box>

        {/* ==========================================
            FOOTER
            ========================================== */}
        <Box sx={{ bgcolor: '#0a1628', color: 'rgba(255,255,255,0.7)', py: 4 }}>
          <Container maxWidth="lg">
            <Divider sx={{ mb: 4, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Typography variant="body2" textAlign="center">
              © 2026 ESS MRBS. All rights reserved. Built with ❤️
            </Typography>
          </Container>
        </Box>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(3deg); }
            }
          `}
        </style>
      </Box>
    </>
  );
};

export default Home;
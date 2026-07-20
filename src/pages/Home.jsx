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
import ImageSlideshow from '../components/ImageSlideshow';
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
  { 
    icon: <MeetingRoom />, 
    title: 'Meeting Room Booking', 
    desc: 'The system provides a simple and organized way to manage room reservations. It helps that users easily find the right room and book it for scheduled meetings without confusion..',
    color: '#0e365e' 
  },
  { 
    icon: <Schedule />, 
    title: 'Real-Time Availability', 
    desc: 'The system displays which rooms are available or already booked for a selected date and time. This reduces scheduling conflicts and prevents double bookings.',
    color: '#0f376b' 
  },
  { 
    icon: <Security />, 
    title: 'Secure Authentication', 
    desc: 'The system uses a secure authentication process to protect user accounts and meeting information. Only authorized users can login and access the meeting room booking system. Role-based access control ensures that administrators and users have the appropriate permissions. User credentials are securely verified before access is granted. This prevents unauthorized access to sensitive booking data. The authentication mechanism helps maintain data privacy and system integrity. It also ensures that all booking activities are performed by verified users. As a result, the system provides a safe and reliable environment for managing meeting room reservations.',
    color: '#0c4176' 
  },
];

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
            HERO SECTION - ESS BRAND COLORS
            ========================================== */}
        <Box
          sx={{
            background: '#0c2b69',
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
                background: 'rgba(255,255,255,0.06)',
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
                  transition={{ duration: 0.8 }}
                >
                  {/* Ethiopian Statistical Service Branding */}
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#85b8e2',
                      fontWeight: 500,
                      letterSpacing: '0.15em',
                      mb: 1,
                      fontSize: { xs: '0.9rem', md: '1.2rem' },
                    }}
                  >
                    የኢትዮጵያ ስታቲስቲክስ አገልግሎት
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      fontWeight: 400,
                      letterSpacing: '0.1em',
                      mb: 3,
                      fontSize: { xs: '0.8rem', md: '1rem' },
                    }}
                  >
                    ETHIOPIAN STATISTICAL SERVICE
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
                              color: '#1a2a5e',
                              px: 5,
                              py: 1.8,
                              borderRadius: '50px',
                              fontWeight: 600,
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

                {/* Quick Links - Inspired by ESS footer */}
                <Box
                  sx={{
                    mt: 6,
                    pt: 4,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: { xs: 2, md: 4 },
                  }} >
                </Box>
              </Box>
            </Fade>
          </Container>
        </Box>

        {/* ==========================================
            FEATURES - IMPROVED VISUAL APPEARANCE
            ========================================== */}
        <Box sx={{ bgcolor: '#ccd3e0', py: 8 }}>
          <Container maxWidth="lg">
            <AnimatedSection>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                textAlign="center" 
                gutterBottom
                sx={{
                  color: '#09306b',
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  mb: 1
                }}
              >
                Everything You Need to Manage Meeting Rooms
              </Typography>
            </AnimatedSection>

            {/* First Row - Two boxes full width */}
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {features.slice(0, 2).map((feature, i) => (
                <Grid item xs={12} sm={6} md={6} key={i}>
                  <AnimatedSection delay={i * 0.1}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <Card
                        sx={{
                          p: 3.5,
                          height: '100%',
                          minHeight: '280px',
                          borderRadius: 4,
                          borderTop: `5px solid ${feature.color}`,
                          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          boxShadow: hoveredCard === i 
                            ? `0 12px 40px ${feature.color}25` 
                            : '0 4px 20px rgba(0,0,0,0.06)',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            boxShadow: `0 16px 48px ${feature.color}30`,
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            bgcolor: `${feature.color}12`,
                            color: feature.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 34,
                            mb: 2.5,
                            transition: 'all 0.3s ease',
                            transform: hoveredCard === i ? 'scale(1.1) rotate(3deg)' : 'scale(1)',
                            flexShrink: 0,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography 
                          variant="h6" 
                          fontWeight="700" 
                          sx={{ 
                            mb: 1.5,
                            color: '#09306b',
                            fontSize: '1.1rem',
                            letterSpacing: '0.3px'
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{
                            lineHeight: 1.8,
                            fontSize: '0.95rem',
                            color: '#4a5568',
                            flex: 1,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 8,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {feature.title === 'Meeting Room Booking' && 'View all available meeting rooms in one place with their capacity and location,'}
                            {feature.title === 'Real-Time Availability' && 'Check the real-time availability of meeting rooms before making a reservation,'}
                             {feature.title === 'Secure Authentication' && 'The system uses a secure authentication process to protect user accounts and meeting information,'}
                          </Box>
                          {' '}
                          {feature.desc.replace(
                            feature.title === 'Meeting Room Booking' ? 'View all available meeting rooms in one place with their capacity and location,' : 
                            feature.title === 'Real-Time Availability' ? 'Check the real-time availability of meeting rooms before making a reservation,' : 
                            '', 
                            ''
                          )}
                        </Typography>
                      </Card>
                    </motion.div>
                  </AnimatedSection>
                </Grid>
              ))}
            </Grid>

            {/* Second Row - Third box full width */}
            <Grid container spacing={4} sx={{ mt: 4, justifyContent: 'center' }}>
              <Grid item xs={12}>
                <AnimatedSection delay={0.2}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    onMouseEnter={() => setHoveredCard(2)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <Card
                      sx={{
                        p: 4,
                        height: '100%',
                        borderRadius: 4,
                        borderTop: `5px solid ${features[2].color}`,
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: hoveredCard === 2 
                          ? `0 12px 40px ${features[2].color}25` 
                          : '0 4px 20px rgba(0,0,0,0.06)',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          boxShadow: `0 16px 48px ${features[2].color}30`,
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 3,
                          bgcolor: `${features[2].color}12`,
                          color: features[2].color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 34,
                          mb: 2.5,
                          transition: 'all 0.3s ease',
                          transform: hoveredCard === 2 ? 'scale(1.1) rotate(3deg)' : 'scale(1)',
                          flexShrink: 0,
                        }}
                      >
                        {features[2].icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        fontWeight="700" 
                        sx={{ 
                          mb: 2,
                          color: '#09306b',
                          fontSize: '1.3rem',
                          letterSpacing: '0.3px'
                        }}
                      >
                        {features[2].title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{
                          fontSize: '1.1rem',
                          lineHeight: 1.8,
                          color: '#333',
                        }}
                      >
                        {features[2].desc}
                      </Typography>
                    </Card>
                  </motion.div>
                </AnimatedSection>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box
          sx={{
            background: '#ccd3e0',
            color: 'white',
            py: 8,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}>
              {!isAuthenticated && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={() => navigate('/login')}
                    sx={{
                      bgcolor: 'white',
                      color: '#1a2a5e',
                      px: 6,
                      py: 1.8,
                      borderRadius: '50px',
                      fontWeight: 600,
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
            FOOTER - ESS Style
            ========================================== */}
        <Box sx={{ bgcolor: '#0a255c', color: 'rgba(255,255,255,0.7)', py: 4 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  የኢትዮጵያ ስታቲስቲክስ አገልግሎት
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                  ETHIOPIAN STATISTICAL SERVICE
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', mt: 2, fontSize: '0.8rem' }}>
                  HEADQUARTERS
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                  Ethiopian Statistical Service (ESS)
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                  2QH3+9P8, Churchill Road, Addis Ababa
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                  Tele: +251-11553112, +251-11553011
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                  P.O.Box: 1143
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                  Email: info@ess.gov.et
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, mb: 2 }}>
                  Quick Links
                </Typography>
                {['Home', 'About','Contact'].map((link) => (
                  <Typography
                    key={link}
                    variant="body2"
                    onClick={() => {
                      if (link === 'Home') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (link === 'About') {
                        navigate('/about');
                      }
                       else if (link === 'Contact') {
                        navigate('/contact');
                      }
                    }}
                    sx={{
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      py: 0.5,
                      fontSize: '0.8rem',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#85b8e2' },
                    }}
                  >
                    {link}
                  </Typography>
                ))}
              </Grid>
            </Grid>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Typography variant="body2" textAlign="center" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
              © 2026 All Rights Reserved. Ethiopian Statistical Service
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
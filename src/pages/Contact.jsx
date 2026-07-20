import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Fade,
  Divider,
  Stack,
  Button,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  AccessTime,
  AutoAwesome,
  LinkedIn,
  Twitter,
  Facebook,
  YouTube,
  Telegram,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  
  const contactInfo = [
    {
      icon: <LocationOn sx={{ fontSize: 30 }} />,
      title: 'Headquarters',
      details: ['2QH3+9P8, Churchill Road', 'Addis Ababa, Ethiopia'],
      color: '#0b3370',
    },
    {
      icon: <Phone sx={{ fontSize: 30 }} />,
      title: 'Phone',
      details: ['+251-11553112', '+251-11553011'],
      color: '#0f4c84',
    },
    {
      icon: <Email sx={{ fontSize: 30 }} />,
      title: 'Email',
      details: ['info@ess.gov.et'],
      color: '#115096',
    },
    {
      icon: <AccessTime sx={{ fontSize: 30 }} />,
      title: 'Office Hours',
      details: ['Monday - Friday', '8:00 AM - 5:00 PM'],
      color: '#0d4785',
    },
  ];

  const socialLinks = [
    { icon: <LinkedIn />, url: '#', color: '#073360' },
    { icon: <Twitter />, url: '#', color: '#042f49' },
    { icon: <YouTube />, url: '#', color: '#093e5f' },
     { icon: <Facebook />, url: 'https://www.facebook.com/essethiopia', color: '#0d3467' },
    { icon: <Telegram />, url: 'https://t.me/ess_statistics', color: '#053f5b' },
  ];

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: '#d8dde5', minHeight: '100vh' }}>
        
        {/* Hero Section */}
        <Box
          sx={{
            background: ' #dadde9 0%',
            color: 'white',
            py: { xs: 6, md: 10 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {[...Array(20)].map((_, i) => (
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
                zIndex: 0,
              }}
            />
          ))}

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Fade in timeout={1000}>
              <Box textAlign="center">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Typography
                    variant="h2"
                    fontWeight="600"
                    sx={{
                      fontSize: { xs: '2rem', md: '2.5rem',color:'black' },
                      mb: 2,
                    }} >
                    Get In Touch
                  </Typography>
                </motion.div>
              </Box>
            </Fade>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py:10}}>
          <Grid container spacing={4}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    height: '100%',
                  }}
                >
                  <Typography variant="h5" fontWeight="600" sx={{ mb: 4, color: '#0a1628' }}>
                    Contact Information
                  </Typography>

                  <Grid container spacing={3}>
                    {contactInfo.map((info, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: '#f5f7fa',
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#e8ecf1',
                              transform: 'translateY(-4px)',
                            },
                          }}
                        >
                          <Box sx={{ color: info.color, mb: 1 }}>
                            {info.icon}
                          </Box>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                            {info.title}
                          </Typography>
                          {info.details.map((detail, i) => (
                            <Typography key={i} variant="body2" color="text.secondary">
                              {detail}
                            </Typography>
                          ))}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Box>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                      Connect With Us
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {socialLinks.map((social, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          href={social.url}
                          target="_blank"
                          sx={{
                            minWidth: 0,
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            color: social.color,
                            borderColor: social.color,
                            '&:hover': {
                              bgcolor: social.color,
                              color: 'white',
                              borderColor: social.color,
                            },
                          }}
                        >
                          {social.icon}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Map Section */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    height: '100%',
                  }}
                >
                  <Typography variant="h5" fontWeight="600" sx={{ mb: 3, color: '#0a1628' }}>
                    Find Us Here
                  </Typography>
                  <Box
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      height: { xs: 300, md: 400 },
                    }}
                  >
                    <Box
                      component="iframe"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.021616592602!2d38.7425!3d9.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b851eb7e12719%3A0x7df5df1e7b3f169e!2sEthiopian%20Statistical%20Service!5e0!3m2!1sen!2set!4v1700000000000"
                      sx={{
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="ESS Location Map"
                    />
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

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
                {['Home','About', 'Contact'].map((link) => (
                  <Typography
                    key={link}
                    variant="body2"
                    onClick={() => {
                      if (link === 'Contact') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (link === 'About') {
                        navigate('/about');
                      }
                      else if (link === 'Home') {
                        navigate('/Home');
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

export default Contact;
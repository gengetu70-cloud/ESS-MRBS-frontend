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

const Contact = () => {
  const contactInfo = [
    {
      icon: <LocationOn sx={{ fontSize: 30 }} />,
      title: 'Headquarters',
      details: ['2QH3+9P8, Churchill Road', 'Addis Ababa, Ethiopia'],
      color: '#0d47a1',
    },
    {
      icon: <Phone sx={{ fontSize: 30 }} />,
      title: 'Phone',
      details: ['+251-11553112', '+251-11553011'],
      color: '#2e7d32',
    },
    {
      icon: <Email sx={{ fontSize: 30 }} />,
      title: 'Email',
      details: ['info@ess.gov.et'],
      color: '#ed6c02',
    },
    {
      icon: <AccessTime sx={{ fontSize: 30 }} />,
      title: 'Office Hours',
      details: ['Monday - Friday', '8:00 AM - 5:00 PM'],
      color: '#9c27b0',
    },
  ];

  const socialLinks = [
    { icon: <LinkedIn />, url: '#', color: '#0a66c2' },
    { icon: <Twitter />, url: '#', color: '#1DA1F2' },
    { icon: <YouTube />, url: '#', color: '#FF0000' },
     { icon: <Facebook />, url: 'https://www.facebook.com/essethiopia', color: '#1877F2' },
    { icon: <Telegram />, url: 'https://t.me/ess_statistics', color: '#0088cc' },
  ];

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
        
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0a1628 0%, #0d47a1 40%, #1565c0 70%, #42a5f5 100%)',
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
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <Chip
                    icon={<AutoAwesome sx={{ fontSize: 20 }} />}
                    label="Contact Us"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      mb: 3,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Typography
                    variant="h2"
                    fontWeight="600"
                    sx={{
                      fontSize: { xs: '2rem', md: '3.5rem' },
                      mb: 2,
                    }}
                  >
                    Get In Touch
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.3rem' },
                      opacity: 0.9,
                      maxWidth: 600,
                      mx: 'auto',
                    }}
                  >
                    We'd love to hear from you. Reach out to us for any inquiries.
                  </Typography>
                </motion.div>
              </Box>
            </Fade>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 6 }}>
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
                  <Typography variant="h4" fontWeight="600" sx={{ mb: 4, color: '#0a1628' }}>
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
                  <Typography variant="h4" fontWeight="600" sx={{ mb: 3, color: '#0a1628' }}>
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
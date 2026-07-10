import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Fade,
} from '@mui/material';
import {
  TrendingUp,
  Analytics,
  Security,
  Speed,
  Public,
  People,
  CheckCircle,
  AutoAwesome,
  History,
  EmojiObjects,
  MenuBook,
  Download,
  Lightbulb,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const About = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  const coreValues = [
    { icon: <Public />, title: 'Data Integrity', desc: 'Ensuring accuracy and reliability in all statistical data' },
    { icon: <Security />, title: 'Confidentiality', desc: 'Protecting sensitive information with utmost care' },
    { icon: <Speed />, title: 'Timeliness', desc: 'Delivering data and reports in a timely manner' },
    { icon: <Analytics />, title: 'Innovation', desc: 'Embracing technology and modern methodologies' },
    { icon: <People />, title: 'Public Service', desc: 'Serving the nation with dedication and transparency' },
  ];

  const services = [
    { icon: <MenuBook />, title: 'Data Collection', desc: 'Scientific methodologies for comprehensive data gathering' },
    { icon: <Analytics />, title: 'Data Analysis', desc: 'Advanced analysis for meaningful insights' },
    { icon: <Download />, title: 'Report Delivery', desc: 'Timely dissemination of statistical reports' },
    { icon: <Lightbulb />, title: 'Technical Support', desc: 'Capacity building and technical guidance' },
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
            <Fade in={animated} timeout={1000}>
              <Box textAlign="center">
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <Chip
                    icon={<AutoAwesome sx={{ fontSize: 20 }} />}
                    label="About ESS"
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
                    About Ethiopian Statistics Service
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
                      maxWidth: 800,
                      mx: 'auto',
                    }}
                  >
                    Empowering Ethiopia through reliable statistics and data-driven decision making
                  </Typography>
                </motion.div>
              </Box>
            </Fade>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {/* Overview Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Paper
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 6,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <History sx={{ fontSize: 32, color: '#0d47a1', mr: 2 }} />
                <Typography variant="h4" fontWeight="600" color="#0a1628">
                  Our Mission
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#333' }}>
                Statistical data collected and compiled using scientific methodologies are essential for accelerating 
                a country's economic, social, and democratic development, as well as for improving the quality of life. 
                These data enable the government and other institutions to formulate policies across various sectors, 
                monitor and evaluate policy implementations, and make informed decisions for the future.
              </Typography>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmojiObjects sx={{ fontSize: 32, color: '#0d47a1', mr: 2 }} />
                <Typography variant="h4" fontWeight="600" color="#0a1628">
                  What We Do
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#333' }}>
                The Ethiopian Statistics Service (ESS) plays a central role in collecting and compiling data from 
                sample surveys, censuses, and administrative records, as well as analyzing and delivering reports for 
                a wide range of sectors and users. In addition, the ESS provides technical guidance and support to 
                government agencies, institutions, and individuals in establishing robust administrative recording, 
                registration, and reporting systems. It also helps to build capacity through directives and consultations 
                on the development of administrative records and registration systems.
              </Typography>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp sx={{ fontSize: 32, color: '#0d47a1', mr: 2 }} />
                <Typography variant="h4" fontWeight="600" color="#0a1628">
                  Our Commitment
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#333' }}>
                To meet the growing demand for statistical data and to maintain internationally accepted standards, 
                the ESS is continuously diversifying its statistical methodologies and enhancing the use of technology 
                in its data collection, compilation, classification, analysis, and dissemination processes.
              </Typography>
            </Paper>
          </motion.div>

          {/* Core Values */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography variant="h4" fontWeight="600" textAlign="center" sx={{ mb: 4, color: '#0a1628' }}>
              Our Core Values
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {coreValues.map((value, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: '#0d47a115',
                          color: '#0d47a1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 32,
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        {value.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                        {value.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {value.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Typography variant="h4" fontWeight="600" textAlign="center" sx={{ mb: 4, color: '#0a1628' }}>
              Our Services
            </Typography>
            <Grid container spacing={3}>
              {services.map((service, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 30px rgba(13, 71, 161, 0.15)',
                        borderColor: '#0d47a1',
                      },
                    }}
                  >
                    <Box sx={{ color: '#0d47a1', fontSize: 40, mb: 2 }}>
                      {service.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Box sx={{ mt: 6, bgcolor: 'white', p: 5, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Grid container spacing={4}>
                {[
                  { number: '50+', label: 'Years of Service' },
                  { number: '1000+', label: 'Statistical Reports' },
                  { number: '200+', label: 'Expert Staff' },
                  { number: '100%', label: 'Data Integrity' },
                ].map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight="700" color="#0d47a1">
                        {stat.number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
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

export default About;
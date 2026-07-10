import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

// Import your 5 images
import img1 from '../assets/slide1.jpg';
import img2 from '../assets/slide2.jpg';
import img3 from '../assets/slide3.jpg';
import img4 from '../assets/slide4.jpg';
import img5 from '../assets/slide5.jpg';

const ImageSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const images = [img1, img2, img3, img4, img5];

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // Cycle through 0, 1, 2, 3, 4, then back to 0
        return (prev + 1) % images.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovering, images.length]);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: '300px', sm: '400px', md: '500px' },
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Single slide display */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${images[currentIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          transition: 'opacity 0.8s ease-in-out',
          opacity: 1,
        }}
      >
        {/* Gradient overlay from bottom */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'linear-gradient(to top, rgba(8, 71, 165, 0.9) 0%, rgba(6, 99, 238, 0.4) 50%, transparent 100%)',
          }}
        />

        {/* Slide content */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 30, sm: 50, md: 80 },
            left: { xs: 20, sm: 50, md: 80 },
            right: { xs: 20, sm: 50, md: 80 },
            color: 'white',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 1,
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              animation: 'slideUp 0.8s ease-out',
            }}
          >
            {currentIndex === 0 && 'Welcome to ESS MRBS'}
            {currentIndex === 1 && 'Smart Meeting Rooms'}
            {currentIndex === 2 && 'Book with Ease'}
            {currentIndex === 3 && 'Real-Time Availability'}
            {currentIndex === 4 && 'Enterprise Solutions'}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.3rem' },
              opacity: 0.85,
              maxWidth: 600,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.8s ease-out 0.2s both',
            }}
          >
            {currentIndex === 0 && 'Intelligent meeting room booking system for modern enterprises'}
            {currentIndex === 1 && 'Find and book the perfect meeting space instantly'}
            {currentIndex === 2 && 'Streamlined scheduling with real-time availability'}
            {currentIndex === 3 && 'Check room status and book on the go'}
            {currentIndex === 4 && 'Scalable solution for organizations of any size'}
          </Typography>
        </Box>

        {/* Dots indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 10, sm: 15, md: 20 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1.5,
            zIndex: 5,
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: { xs: 8, sm: 10, md: 12 },
                height: { xs: 8, sm: 10, md: 12 },
                borderRadius: '50%',
                bgcolor: currentIndex === index ? '#ffffff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.8)',
                  transform: 'scale(1.2)',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Navigation Arrows - Show on hover */}
      {isHovering && (
        <>
          <Box
            onClick={() => {
              setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            }}
            sx={{
              position: 'absolute',
              left: { xs: 10, sm: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: { xs: '8px 12px', sm: '12px 16px' },
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.3s',
              zIndex: 10,
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(25,118,210,0.8)',
                transform: 'translateY(-50%) scale(1.1)',
              },
            }}
          >
            ❮
          </Box>
          <Box
            onClick={() => {
              setCurrentIndex((prev) => (prev + 1) % images.length);
            }}
            sx={{
              position: 'absolute',
              right: { xs: 10, sm: 20 },
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: { xs: '8px 12px', sm: '12px 16px' },
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.3s',
              zIndex: 10,
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(25,118,210,0.8)',
                transform: 'translateY(-50%) scale(1.1)',
              },
            }}
          >
            ❯
          </Box>
        </>
      )}

      {/* CSS animations */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ImageSlideshow;
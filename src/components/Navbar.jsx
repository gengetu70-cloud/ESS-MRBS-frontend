import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  IconButton,
  Tooltip,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MeetingRoom,
  AdminPanelSettings,
  Logout,
  Person,
  Home as HomeIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Navigation items for profile dropdown
  const getProfileMenuItems = () => {
    const items = [];
    
    // Admin - Only for admin users
    if (isAdmin) {
      items.push({ text: 'Admin Dashboard', icon: <AdminPanelSettings />, path: '/admin' });
    }
    
    // Dashboard - Only for authenticated users
    if (isAuthenticated) {
      items.push({ text: 'User Dashboard', icon: <DashboardIcon />, path: '/dashboard' });
    }
    
    // Home - Always show
    items.push({ text: 'Home', icon: <HomeIcon />, path: '/' });
    
    // Contact - Always show
    items.push({ text: 'Contact', icon: <ContactIcon />, path: '/contact' });
    
    // About - Always show
    items.push({ text: 'About', icon: <InfoIcon />, path: '/about' });
    
    return items;
  };

  // Get navbar items based on user role
  const getNavbarItems = () => {
    if (isAdmin) {
      return [
        { text: 'Home', icon: <HomeIcon />, path: '/' },
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'AdminDashboard', icon: <AdminPanelSettings />, path: '/admin' },
        { text: 'Contact', icon: <ContactIcon />, path: '/contact' },
        { text: 'About', icon: <InfoIcon />, path: '/about' },
      ];
    } else if (isAuthenticated) {
      return [
        { text: 'Home', icon: <HomeIcon />, path: '/' },
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Contact', icon: <ContactIcon />, path: '/contact' },
        { text: 'About', icon: <InfoIcon />, path: '/about' },
      ];
    }
    return [];
  };

  // Menu items for mobile drawer
  const getMobileMenuItems = () => {
    const items = [];
    
    if (isAuthenticated) {
      // Add navbar items for authenticated users
      items.push(...getNavbarItems());
      items.push({ text: 'Logout', icon: <Logout />, action: handleLogout });
    } else {
      items.push({ text: 'Login', icon: <LoginIcon />, path: '/login' });
    }
    
    return items;
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        ESS MRBS
      </Typography>
      <Divider />
      <List>
        {getMobileMenuItems().map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              if (item.action) {
                item.action();
              } else if (item.path) {
                navigate(item.path);
              }
            }}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="primary" 
        elevation={2}
        sx={{
          backgroundColor: '#09306b',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo - Only the circle logo, no text */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: 1,
              }}
              onClick={() => navigate('/')}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="ESS MRBS Logo"
                sx={{
                  height: 40,
                  width: 40,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Box
                component="img"
                src="/logo.png"
                alt="ESS MRBS Logo"
                sx={{
                  height: 32,
                  width: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: { xs: 'block', sm: 'none' },
                }}
              />
            </Box>

            {/* ESS MRBS Text */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                cursor: 'pointer',
                fontWeight: 600,
                letterSpacing: 1,
                color: '#ffffff',
              }}
              onClick={() => navigate('/')}
            >
              ESS MRBS
            </Typography>

            {/* Desktop Menu - Navbar items from left to right */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
              {isAuthenticated ? (
                // Show navbar items for authenticated users
                getNavbarItems().map((item) => (
                  <Button
                    key={item.text}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: '#ffffff',
                      backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))
              ) : (
                // Show Login button for non-authenticated users
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  startIcon={<LoginIcon />}
                  sx={{
                    color: '#ffffff',
                    backgroundColor: location.pathname === '/login' ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Login
                </Button>
              )}
            </Box>

            {/* User Avatar & Menu */}
            {isAuthenticated && (
              <Box sx={{ ml: 4 }}>
                <Tooltip title="Account settings">
                  <IconButton onClick={handleMenu} color="inherit">
                    <Avatar sx={{ bgcolor: '#08133b', width: 40, height: 40 }}>
                      {user?.fullName?.[0] || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem disabled>
                    <Typography variant="body2">
                      {user?.fullName} ({user?.role})
                    </Typography>
                  </MenuItem>
                  <MenuItem divider />
                  
                  {/* Profile Menu Items in Order: Admin, Dashboard, Home, Contact, About */}
                  {getProfileMenuItems().map((item) => (
                    <MenuItem 
                      key={item.text}
                      onClick={() => { 
                        handleClose(); 
                        navigate(item.path); 
                      }}
                      selected={location.pathname === item.path}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                        },
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText>{item.text}</ListItemText>
                    </MenuItem>
                  ))}
                  
                  <MenuItem divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
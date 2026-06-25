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

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Menu items for mobile drawer
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    ...(isAuthenticated
      ? [{ text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' }]
      : []),
    ...(isAdmin
      ? [
          { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' },
          { text: 'Manage Users', icon: <Person />, path: '/admin/users' },
          { text: 'Manage Rooms', icon: <MeetingRoom />, path: '/admin/rooms' },
          { text: 'Reports', icon: <AdminPanelSettings />, path: '/admin/reports' },
        ]
      : []),
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        ESS MRBS
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
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
      <AppBar position="sticky" color="primary" elevation={2}>
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

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
              onClick={() => navigate('/')}
            >
              <MeetingRoom sx={{ fontSize: 28 }} />
              ESS MRBS
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
                sx={{
                  backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                Home
              </Button>

              {isAuthenticated && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/dashboard')}
                  startIcon={<DashboardIcon />}
                  sx={{
                    backgroundColor: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.15)' : 'transparent',
                  }}
                >
                  Dashboard
                </Button>
              )}

              {isAdmin && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin')}
                  startIcon={<AdminPanelSettings />}
                  sx={{
                    backgroundColor: location.pathname === '/admin' ? 'rgba(255,255,255,0.15)' : 'transparent',
                  }}
                >
                  Admin
                </Button>
              )}

              {!isAuthenticated && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
              )}
            </Box>

            {/* User Avatar & Menu */}
            {isAuthenticated && (
              <Box sx={{ ml: 2 }}>
                <Tooltip title="Account settings">
                  <IconButton onClick={handleMenu} color="inherit">
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
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
                  {isAdmin && (
                    <MenuItem onClick={() => { handleClose(); navigate('/admin/users'); }}>
                      <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                      <ListItemText>Manage Users</ListItemText>
                    </MenuItem>
                  )}
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
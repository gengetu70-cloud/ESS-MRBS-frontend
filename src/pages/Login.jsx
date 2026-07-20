import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔵 Sign In clicked!');
    console.log('Username:', username);
    console.log('Password:', password ? '***' : '');
    
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      console.log('✅ Login result:', result);
      
      // ✅ FIXED: Check if result exists
      if (!result) {
        setError('No response from server');
        setLoading(false);
        return;
      }
      
      if (result.success) {
        console.log('✅ Login successful!');
        
        // ✅ FIXED: Get user from result
        const user = result.user || result.data?.user || result.data;
        console.log('User object:', user);
        
        // ✅ FIXED: Check if user exists
        if (!user) {
          console.error('❌ No user data in response:', result);
          setError('Login successful but no user data received');
          setLoading(false);
          return;
        }
        
        // Store user in AuthContext
        authLogin(user);
        
        // Check role from user object
        const userRole = user?.role || '';
        console.log('User role:', userRole);
        
        // ✅ FIXED: Check if admin
        const isAdmin = userRole.toLowerCase() === 'admin';
        console.log('Is Admin?', isAdmin);
        
        if (isAdmin) {
          console.log('🔵 Redirecting to Admin Dashboard (/admin)');
          navigate('/admin', { replace: true });
        } else {
          console.log('🔵 Redirecting to User Dashboard (/dashboard)');
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          py: 4,
        }}
      >
        <Container component="main" maxWidth="xs">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: '#064097', width: 56, height: 56 }}>
              <LockOutlinedIcon sx={{ fontSize: 28 }} />
            </Avatar>

            <Typography component="h1" variant="h5" fontWeight="600" sx={{ mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sign in to manage your meeting rooms
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '50px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  bgcolor:'#084baf',
                  textTransform: 'none',
                }}
                disabled={loading || !username.trim() || !password.trim()}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>

              <Typography variant="body2" color="text.secondary" align="center">
                Contact administrator for account access
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Snackbar,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const ManageUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, userName: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    department: '',
    role: 'registered',
    password: '',
  });

  const departments = [
    'Director Office',
    'Deputy Director Office',
    'Business Statistics',
    'Household Statistics',
    'Other Departments',
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/users');
      console.log('📊 Users fetched:', response.data);
      
      if (response.data && response.data.success) {
        setUsers(response.data.data || []);
      } else if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (userData = null) => {
    if (userData) {
      setEditingUser(userData);
      setFormData({
        fullName: userData.fullName || '',
        username: userData.username || '',
        email: userData.email || '',
        department: userData.department || '',
        role: userData.role || 'registered',
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        username: '',
        email: '',
        department: '',
        role: 'registered',
        password: '',
      });
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormData({
      fullName: '',
      username: '',
      email: '',
      department: '',
      role: 'registered',
      password: '',
    });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validate required fields
      if (!formData.fullName || !formData.username || !formData.department) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate password for new users
      if (!editingUser && (!formData.password || formData.password.length < 6)) {
        setError('Password must be at least 6 characters');
        return;
      }

      // FIXED: Handle empty email - send null instead of empty string
      const submitData = {
        ...formData,
        email: formData.email && formData.email.trim() !== '' ? formData.email.trim() : null,
      };

      if (editingUser) {
        // Update user
        const updateData = { ...submitData };
        if (!updateData.password) delete updateData.password;
        
        const response = await axiosInstance.put(`/users/${editingUser._id}`, updateData);
        if (response.data && response.data.success) {
          setSnackbar({ 
            open: true, 
            message: '✅ User updated successfully', 
            severity: 'success' 
          });
          await fetchUsers();
          handleCloseDialog();
        } else {
          throw new Error(response.data?.message || 'Failed to update user');
        }
      } else {
        // Create user
        const response = await axiosInstance.post('/users', submitData);
        if (response.data && response.data.success) {
          setSnackbar({ 
            open: true, 
            message: '✅ User created successfully', 
            severity: 'success' 
          });
          await fetchUsers();
          handleCloseDialog();
        } else {
          throw new Error(response.data?.message || 'Failed to create user');
        }
      }
    } catch (err) {
      console.error('Error saving user:', err);
      // FIXED: Better error message handling
      const errorMessage = err.response?.data?.message || err.message || 'Operation failed';
      
      // Check for duplicate key error
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        setError('A user with this username or email already exists');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await axiosInstance.delete(`/users/${deleteDialog.userId}`);
      if (response.data && response.data.success) {
        setSnackbar({ 
          open: true, 
          message: '🗑️ User deleted successfully', 
          severity: 'success' 
        });
        await fetchUsers();
      } else {
        throw new Error(response.data?.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to delete user',
        severity: 'error',
      });
    } finally {
      setDeleteDialog({ open: false, userId: null, userName: '' });
    }
  };

  const isCurrentUser = (userId) => {
    return userId === user?.id || userId === user?._id;
  };

  const canEditUser = (userToCheck) => {
    return true;
  };

  const canDeleteUser = (userToCheck) => {
    if (!userToCheck) return false;
    
    if (isCurrentUser(userToCheck._id)) {
      return false;
    }
    
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (userToCheck.role === 'admin' && adminCount <= 1) {
      return false;
    }
    
    return true;
  };

  const getDeleteTooltip = (userToCheck) => {
    if (isCurrentUser(userToCheck._id)) {
      return 'Cannot delete your own account';
    }
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (userToCheck.role === 'admin' && adminCount <= 1) {
      return 'Cannot delete the last admin user';
    }
    return 'Delete this user';
  };

  const getEditTooltip = (userToCheck) => {
    return 'Edit this user';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Manage Users
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Full Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!users || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const isCurrent = isCurrentUser(u._id);
                  const canEdit = canEditUser(u);
                  const canDelete = canDeleteUser(u);

                  return (
                    <TableRow 
                      key={u._id} 
                      hover
                      sx={{
                        backgroundColor: isCurrent ? 'rgba(25, 118, 210, 0.04)' : 'inherit',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {u.fullName}
                          {isCurrent && (
                            <Chip 
                              label="You" 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 20 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.email || '—'}</TableCell>
                      <TableCell>{u.department}</TableCell>
                      <TableCell>
                        <Chip
                          icon={u.role === 'admin' ? <AdminIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                          label={u.role}
                          size="small"
                          color={u.role === 'admin' ? 'primary' : 'default'}
                          variant={u.role === 'admin' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title={getEditTooltip(u)}>
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(u)}
                                disabled={!canEdit}
                              >
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title={getDeleteTooltip(u)}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteDialog({ open: true, userId: u._id, userName: u.fullName })}
                                disabled={!canDelete}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingUser ? '✏️ Edit User' : '➕ Add New User'}
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={!!editingUser}
                    helperText={editingUser ? 'Username cannot be changed' : ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email (Optional)"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    helperText="Leave empty if you don't want to provide an email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="registered">Registered</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    helperText={editingUser ? 'Leave blank to keep current password' : 'Min 6 characters'}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog 
          open={deleteDialog.open} 
          onClose={() => setDeleteDialog({ open: false, userId: null, userName: '' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            Delete User
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{deleteDialog.userName}</strong>? 
              <br />
              <Typography component="span" color="error" variant="body2">
                This action cannot be undone.
              </Typography>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, userId: null, userName: '' })}>
              Cancel
            </Button>
            <Button onClick={handleDeleteUser} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default ManageUsers;
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const ManageRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, roomId: null, roomName: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    buildingNumber: '',
    floorNumber: '',
    department: '',
    roomName: '',
    maxCapacity: '',
    status: 'available',
    description: '',
    amenities: [],
  });

  const departments = [
    'Director Office',
    'Deputy Director Office',
    'Business Statistics',
    'Household Statistics',
    'Other Departments',
  ];

  const statusOptions = ['available', 'booked', 'maintenance'];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/rooms');
      console.log('📊 Rooms fetched:', response.data);
      
      // FIX: Check response structure
      if (response.data && response.data.success) {
        setRooms(response.data.data || []);
      } else if (response.data && Array.isArray(response.data)) {
        setRooms(response.data);
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.response?.data?.message || 'Failed to load rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (roomData = null) => {
    if (roomData) {
      setEditingRoom(roomData);
      setFormData({
        buildingNumber: roomData.buildingNumber || '',
        floorNumber: roomData.floorNumber || '',
        department: roomData.department || '',
        roomName: roomData.roomName || '',
        maxCapacity: roomData.maxCapacity || '',
        status: roomData.status || 'available',
        description: roomData.description || '',
        // FIX: Handle amenities properly - if it's an array, join with comma
        amenities: Array.isArray(roomData.amenities) ? roomData.amenities.join(', ') : roomData.amenities || '',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        buildingNumber: '',
        floorNumber: '',
        department: '',
        roomName: '',
        maxCapacity: '',
        status: 'available',
        description: '',
        amenities: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRoom(null);
    setFormData({
      buildingNumber: '',
      floorNumber: '',
      department: '',
      roomName: '',
      maxCapacity: '',
      status: 'available',
      description: '',
      amenities: [],
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // FIX: Validate required fields
      if (!formData.roomName || !formData.buildingNumber || !formData.floorNumber || !formData.department || !formData.maxCapacity) {
        setError('Please fill in all required fields');
        return;
      }

      // FIX: Prepare data with proper types
      const data = {
        ...formData,
        maxCapacity: Number(formData.maxCapacity),
        // FIX: Handle amenities - split comma separated string into array
        amenities: typeof formData.amenities === 'string' 
          ? formData.amenities.split(',').map(item => item.trim()).filter(Boolean)
          : formData.amenities || [],
      };

      if (editingRoom) {
        const response = await axiosInstance.put(`/rooms/${editingRoom._id}`, data);
        if (response.data && response.data.success) {
          setSnackbar({ open: true, message: '✅ Room updated successfully', severity: 'success' });
          await fetchRooms();
          handleCloseDialog();
        } else {
          throw new Error(response.data?.message || 'Failed to update room');
        }
      } else {
        const response = await axiosInstance.post('/rooms', data);
        if (response.data && response.data.success) {
          setSnackbar({ open: true, message: '✅ Room created successfully', severity: 'success' });
          await fetchRooms();
          handleCloseDialog();
        } else {
          throw new Error(response.data?.message || 'Failed to create room');
        }
      }
    } catch (err) {
      console.error('Error saving room:', err);
      setError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDeleteRoom = async () => {
    try {
      const response = await axiosInstance.delete(`/rooms/${deleteDialog.roomId}`);
      if (response.data && response.data.success) {
        setSnackbar({ open: true, message: '🗑️ Room deleted successfully', severity: 'success' });
        await fetchRooms();
      } else {
        throw new Error(response.data?.message || 'Failed to delete room');
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to delete room',
        severity: 'error',
      });
    } finally {
      setDeleteDialog({ open: false, roomId: null, roomName: '' });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'success';
      case 'booked': return 'warning';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
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
            Manage Rooms
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchRooms}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog()}
            >
              Add Room
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
                <TableCell sx={{ color: 'white' }}>Room Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Building</TableCell>
                <TableCell sx={{ color: 'white' }}>Floor</TableCell>
                <TableCell sx={{ color: 'white' }}>Department</TableCell>
                <TableCell sx={{ color: 'white' }}>Capacity</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!rooms || rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                      No rooms found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room._id || room.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {room.roomName || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{room.buildingNumber || 'N/A'}</TableCell>
                    <TableCell>{room.floorNumber || 'N/A'}</TableCell>
                    <TableCell>{room.department || 'N/A'}</TableCell>
                    <TableCell>{room.maxCapacity || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={room.status || 'available'}
                        size="small"
                        color={getStatusColor(room.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleOpenDialog(room)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, roomId: room._id, roomName: room.roomName })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingRoom ? '✏️ Edit Room' : '➕ Add New Room'}
              <IconButton onClick={handleCloseDialog}><CloseIcon /></IconButton>
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
                    label="Room Name" 
                    name="roomName" 
                    value={formData.roomName} 
                    onChange={handleChange} 
                    required 
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Building Number" 
                    name="buildingNumber" 
                    value={formData.buildingNumber} 
                    onChange={handleChange} 
                    required 
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Floor Number" 
                    name="floorNumber" 
                    value={formData.floorNumber} 
                    onChange={handleChange} 
                    required 
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
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    type="number" 
                    label="Max Capacity" 
                    name="maxCapacity" 
                    value={formData.maxCapacity} 
                    onChange={handleChange} 
                    required 
                    inputProps={{ min: 1 }} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {statusOptions.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amenities (comma separated)"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    placeholder="Projector, WiFi, Whiteboard"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={loading}
            >
              {editingRoom ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, roomId: null, roomName: '' })}>
          <DialogTitle>🗑️ Delete Room</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{deleteDialog.roomName}</strong>? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, roomId: null, roomName: '' })}>
              Cancel
            </Button>
            <Button onClick={handleDeleteRoom} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose} 
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
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

export default ManageRooms;
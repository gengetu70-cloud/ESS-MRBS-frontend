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
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bookingId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/bookings');
      console.log('📊 Bookings fetched:', response.data);
      
      if (response.data && response.data.success) {
        setBookings(response.data.data || []);
      } else if (response.data && Array.isArray(response.data)) {
        setBookings(response.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const bookingId = cancelDialog.bookingId;
    if (!bookingId) return;

    try {
      const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`);
      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: '✅ Booking cancelled successfully',
          severity: 'success',
        });
        await fetchBookings();
      } else {
        throw new Error(response.data?.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to cancel booking',
        severity: 'error',
      });
    } finally {
      setCancelDialog({ open: false, bookingId: null });
    }
  };

  const handleDeleteBooking = async () => {
    const bookingId = deleteDialog.bookingId;
    if (!bookingId) return;

    try {
      const response = await axiosInstance.delete(`/bookings/${bookingId}`);
      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: '🗑️ Booking deleted successfully',
          severity: 'success',
        });
        await fetchBookings();
      } else {
        throw new Error(response.data?.message || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to delete booking',
        severity: 'error',
      });
    } finally {
      setDeleteDialog({ open: false, bookingId: null });
    }
  };

  const openCancelDialog = (bookingId) => {
    setCancelDialog({ open: true, bookingId });
  };

  const openDeleteDialog = (bookingId) => {
    setDeleteDialog({ open: true, bookingId });
  };

  const isUpcoming = (booking) => {
    const bookingDate = new Date(booking.meetingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  };

  // Check if cancel button should be disabled
  const isCancelDisabled = (booking) => {
    if (!booking) return true;
    
    const status = booking.status?.toLowerCase();
    
    // Disable if status is any of these
    if (status === 'cancelled' || status === 'canceled') return true;
    if (status === 'rejected') return true;
    if (status === 'approved') return true;
    if (status === 'completed') return true;
    
    // Disable if booking is in the past
    if (!isUpcoming(booking)) return true;
    
    return false;
  };

  // Check if delete button should be disabled
  const isDeleteDisabled = (booking) => {
    if (!booking) return true;
    
    const status = booking.status?.toLowerCase();
    
    // Disable if status is any of these (can't delete finalized bookings)
    if (status === 'approved') return true;
    if (status === 'rejected') return true;
    if (status === 'cancelled' || status === 'canceled') return true;
    if (status === 'completed') return true;
    
    return false;
  };

  // Get tooltip text for cancel button
  const getCancelTooltip = (booking) => {
    if (!booking) return 'Booking not found';
    
    const status = booking.status?.toLowerCase();
    
    if (status === 'cancelled' || status === 'canceled') {
      return 'This booking has already been cancelled';
    }
    if (status === 'rejected') {
      return 'This booking has been rejected by admin';
    }
    if (status === 'approved') {
      return 'This booking has been approved by admin';
    }
    if (status === 'completed') {
      return 'This booking has been completed';
    }
    if (!isUpcoming(booking)) {
      return 'Cannot cancel past bookings';
    }
    return 'Cancel this booking';
  };

  // Get tooltip text for delete button
  const getDeleteTooltip = (booking) => {
    if (!booking) return 'Booking not found';
    
    const status = booking.status?.toLowerCase();
    
    if (status === 'approved') {
      return 'Cannot delete approved booking';
    }
    if (status === 'rejected') {
      return 'Cannot delete rejected booking';
    }
    if (status === 'cancelled' || status === 'canceled') {
      return 'Cannot delete cancelled booking';
    }
    if (status === 'completed') {
      return 'Cannot delete completed booking';
    }
    return 'Delete this booking';
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      case 'canceled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending': return <PendingIcon fontSize="small" />;
      case 'approved': return <CheckCircleIcon fontSize="small" />;
      case 'rejected': return <ErrorIcon fontSize="small" />;
      case 'cancelled': return <CancelIcon fontSize="small" />;
      case 'canceled': return <CancelIcon fontSize="small" />;
      default: return null;
    }
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
            My Bookings
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBookings}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {bookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No bookings found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You haven't made any bookings yet. Go to the Rooms page to book a room.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Room</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Time</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Guests</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tea Service</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => {
                  const cancelDisabled = isCancelDisabled(booking);
                  const deleteDisabled = isDeleteDisabled(booking);
                  const status = booking.status?.toLowerCase();

                  return (
                    <TableRow key={booking._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {booking.room?.roomName || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.room?.department || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.meetingDate ? new Date(booking.meetingDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {booking.startTime && booking.endTime 
                          ? `${booking.startTime} - ${booking.endTime}` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{booking.numberOfGuests || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.teaService ? 'Yes' : 'No'}
                          size="small"
                          color={booking.teaService ? 'success' : 'default'}
                          variant={booking.teaService ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(booking.status)}
                          label={booking.status || 'Pending'}
                          size="small"
                          color={getStatusColor(booking.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {/* Cancel Button */}
                          <Tooltip title={getCancelTooltip(booking)}>
                            <span>
                              <Button
                                size="small"
                                color="error"
                                variant={cancelDisabled ? 'outlined' : 'contained'}
                                startIcon={<CancelIcon />}
                                onClick={() => openCancelDialog(booking._id)}
                                disabled={cancelDisabled}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 500,
                                  borderRadius: 2,
                                  minWidth: 70,
                                  '&:hover': {
                                    backgroundColor: cancelDisabled ? 'transparent' : undefined,
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            </span>
                          </Tooltip>

                          {/* Delete Button */}
                          <Tooltip title={getDeleteTooltip(booking)}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openDeleteDialog(booking._id)}
                                disabled={deleteDisabled}
                                sx={{
                                  opacity: deleteDisabled ? 0.5 : 1,
                                  '&:hover': {
                                    backgroundColor: deleteDisabled ? 'transparent' : undefined,
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog 
          open={cancelDialog.open} 
          onClose={() => setCancelDialog({ open: false, bookingId: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CancelIcon color="error" />
            Cancel Booking
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel this booking? 
              <br />
              <Typography component="span" color="error" variant="body2">
                This action cannot be undone.
              </Typography>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setCancelDialog({ open: false, bookingId: null })}
            >
              No, Keep
            </Button>
            <Button 
              onClick={handleCancelBooking} 
              color="error" 
              variant="contained"
            >
              Yes, Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialog.open} 
          onClose={() => setDeleteDialog({ open: false, bookingId: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            Delete Booking
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this booking?
              <br />
              <Typography component="span" color="error" variant="body2">
                This action cannot be undone.
              </Typography>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog({ open: false, bookingId: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteBooking} 
              color="error" 
              variant="contained"
            >
              Yes, Delete
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

export default BookingHistory;
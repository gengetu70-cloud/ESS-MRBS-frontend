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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const ManageBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [actionDialog, setActionDialog] = useState({ 
    open: false, 
    bookingId: null, 
    action: '', 
    bookingDetails: null 
  });
  const [processingId, setProcessingId] = useState(null);

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

  const handleApprove = async (bookingId) => {
    if (!bookingId) {
      setSnackbar({ 
        open: true, 
        message: 'Invalid booking ID', 
        severity: 'error' 
      });
      return;
    }

    setProcessingId(bookingId);
    try {
      console.log(`✅ Approving booking: ${bookingId}`);
      const response = await axiosInstance.put(`/bookings/${bookingId}/status`, { status: 'approved' });
      console.log('Approve response:', response.data);
      
      if (response.data && response.data.success) {
        setSnackbar({ 
          open: true, 
          message: '✅ Booking approved successfully!', 
          severity: 'success' 
        });
        await fetchBookings();
      } else {
        throw new Error(response.data?.message || 'Failed to approve booking');
      }
    } catch (err) {
      console.error('Error approving booking:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || err.message || 'Failed to approve booking', 
        severity: 'error' 
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    if (!bookingId) {
      setSnackbar({ 
        open: true, 
        message: 'Invalid booking ID', 
        severity: 'error' 
      });
      return;
    }

    setProcessingId(bookingId);
    try {
      console.log(`❌ Rejecting booking: ${bookingId}`);
      const response = await axiosInstance.put(`/bookings/${bookingId}/status`, { status: 'rejected' });
      console.log('Reject response:', response.data);
      
      if (response.data && response.data.success) {
        setSnackbar({ 
          open: true, 
          message: '❌ Booking rejected successfully!', 
          severity: 'success' 
        });
        await fetchBookings();
      } else {
        throw new Error(response.data?.message || 'Failed to reject booking');
      }
    } catch (err) {
      console.error('Error rejecting booking:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || err.message || 'Failed to reject booking', 
        severity: 'error' 
      });
    } finally {
      setProcessingId(null);
    }
  };

  // RESTORED: Delete handler
  const handleDelete = async (bookingId) => {
    if (!bookingId) {
      setSnackbar({ 
        open: true, 
        message: 'Invalid booking ID', 
        severity: 'error' 
      });
      return;
    }

    setProcessingId(bookingId);
    try {
      console.log(`🗑️ Deleting booking: ${bookingId}`);
      const response = await axiosInstance.delete(`/bookings/${bookingId}`);
      console.log('Delete response:', response.data);
      
      if (response.data && response.data.success) {
        setSnackbar({ 
          open: true, 
          message: '🗑️ Booking deleted successfully!', 
          severity: 'success' 
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
        severity: 'error' 
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openActionDialog = (bookingId, action) => {
    if (!bookingId) {
      setSnackbar({ 
        open: true, 
        message: 'Invalid booking', 
        severity: 'error' 
      });
      return;
    }

    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) {
      setSnackbar({ 
        open: true, 
        message: 'Booking not found', 
        severity: 'error' 
      });
      return;
    }
    
    // Validation for approve/reject - only pending bookings
    if (action === 'approve' && booking.status?.toLowerCase() !== 'pending') {
      setSnackbar({ 
        open: true, 
        message: 'Only pending bookings can be approved', 
        severity: 'warning' 
      });
      return;
    }
    
    if (action === 'reject' && booking.status?.toLowerCase() !== 'pending') {
      setSnackbar({ 
        open: true, 
        message: 'Only pending bookings can be rejected', 
        severity: 'warning' 
      });
      return;
    }
    
    setActionDialog({ 
      open: true, 
      bookingId, 
      action, 
      bookingDetails: booking 
    });
  };

  const handleActionConfirm = () => {
    const { bookingId, action } = actionDialog;
    
    if (!bookingId || !action) {
      setSnackbar({ 
        open: true, 
        message: 'Invalid action', 
        severity: 'error' 
      });
      setActionDialog({ open: false, bookingId: null, action: '', bookingDetails: null });
      return;
    }

    setActionDialog({ open: false, bookingId: null, action: '', bookingDetails: null });
    
    if (action === 'approve') {
      handleApprove(bookingId);
    } else if (action === 'reject') {
      handleReject(bookingId);
    } else if (action === 'delete') {
      handleDelete(bookingId);
    } else {
      setSnackbar({ 
        open: true, 
        message: 'Unknown action', 
        severity: 'error' 
      });
    }
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
      default: return 'default';
    }
  };

  const isProcessing = (bookingId) => {
    return processingId === bookingId;
  };

  // Check if booking is pending
  const isPending = (booking) => {
    if (!booking) return false;
    return booking.status?.toLowerCase() === 'pending';
  };

  // Check if booking is finalized (approved, rejected, or cancelled)
  const isFinalized = (booking) => {
    if (!booking) return false;
    const status = booking.status?.toLowerCase();
    return status === 'approved' || status === 'rejected' || status === 'cancelled' || status === 'canceled';
  };

  // Check if approve button should be disabled - ONLY enabled for pending bookings
  const isApproveDisabled = (booking) => {
    if (!booking) return true;
    return !isPending(booking) || isProcessing(booking._id);
  };

  // Check if reject button should be disabled - ONLY enabled for pending bookings
  const isRejectDisabled = (booking) => {
    if (!booking) return true;
    return !isPending(booking) || isProcessing(booking._id);
  };

  // RESTORED: Check if delete button should be disabled
  const isDeleteDisabled = (booking) => {
    if (!booking) return true;
    // Delete is disabled for finalized bookings OR processing
    return isFinalized(booking) || isProcessing(booking._id);
  };

  // Get tooltip text based on booking status
  const getActionTooltip = (booking, action) => {
    if (!booking) return 'Booking not found';
    
    const status = booking.status?.toLowerCase();
    
    if (status === 'approved') {
      if (action === 'approve') return 'This booking has already been approved';
      if (action === 'delete') return 'Cannot delete approved booking';
      return 'Booking already finalized';
    }
    if (status === 'rejected') {
      if (action === 'reject') return 'This booking has already been rejected';
      if (action === 'delete') return 'Cannot delete rejected booking';
      return 'Booking already finalized';
    }
    if (status === 'cancelled' || status === 'canceled') {
      if (action === 'delete') return 'Cannot delete cancelled booking';
      return 'This booking has been cancelled';
    }
    if (status === 'pending') {
      if (action === 'approve') return 'Approve this booking';
      if (action === 'reject') return 'Reject this booking';
      if (action === 'delete') return 'Delete this booking';
    }
    return 'Booking is not in pending state';
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setActionDialog({ open: false, bookingId: null, action: '', bookingDetails: null });
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
            Manage Bookings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchBookings}
              disabled={loading}
            >
              Refresh
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
                <TableCell sx={{ color: 'white' }}>Room</TableCell>
                <TableCell sx={{ color: 'white' }}>Department</TableCell>
                <TableCell sx={{ color: 'white' }}>Booked By</TableCell>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Time</TableCell>
                <TableCell sx={{ color: 'white' }}>Guests</TableCell>
                <TableCell sx={{ color: 'white' }}>Tea</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!bookings || bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                      No bookings found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => {
                  const pending = isPending(booking);
                  const processing = isProcessing(booking._id);
                  const approveDisabled = isApproveDisabled(booking);
                  const rejectDisabled = isRejectDisabled(booking);
                  const deleteDisabled = isDeleteDisabled(booking);

                  return (
                    <TableRow key={booking._id || booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {booking.room?.roomName || booking.room?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{booking.room?.department || 'N/A'}</TableCell>
                      <TableCell>
                        {booking.scheduledBy?.fullName || 
                         booking.scheduledBy?.username || 
                         booking.bookedBy?.fullName ||
                         booking.bookedBy?.username ||
                         'N/A'}
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
                          label={booking.status || 'Pending'}
                          size="small"
                          color={getStatusColor(booking.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {/* Approve Button - Only enabled for pending bookings */}
                          <Tooltip title={getActionTooltip(booking, 'approve')}>
                            <span>
                              <Button
                                size="small"
                                color="success"
                                variant="contained"
                                startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <ApproveIcon />}
                                onClick={() => openActionDialog(booking._id, 'approve')}
                                disabled={approveDisabled}
                                sx={{ 
                                  minWidth: 70, 
                                  fontSize: '0.7rem',
                                  backgroundColor: approveDisabled ? '#a5d6a7' : '#2e7d32',
                                  '&:hover': {
                                    backgroundColor: approveDisabled ? '#a5d6a7' : '#1b5e20'
                                  }
                                }}
                              >
                                {processing ? '...' : 'Approve'}
                              </Button>
                            </span>
                          </Tooltip>

                          {/* Reject Button - Only enabled for pending bookings */}
                          <Tooltip title={getActionTooltip(booking, 'reject')}>
                            <span>
                              <Button
                                size="small"
                                color="error"
                                variant="contained"
                                startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <RejectIcon />}
                                onClick={() => openActionDialog(booking._id, 'reject')}
                                disabled={rejectDisabled}
                                sx={{ 
                                  minWidth: 70, 
                                  fontSize: '0.7rem',
                                  backgroundColor: rejectDisabled ? '#ef9a9a' : '#c62828',
                                  '&:hover': {
                                    backgroundColor: rejectDisabled ? '#ef9a9a' : '#b71c1c'
                                  }
                                }}
                              >
                                {processing ? '...' : 'Reject'}
                              </Button>
                            </span>
                          </Tooltip>

                          {/* RESTORED: Delete Button - Disabled for finalized bookings */}
                          <Tooltip title={getActionTooltip(booking, 'delete')}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openActionDialog(booking._id, 'delete')}
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
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Confirmation Dialog */}
        <Dialog 
          open={actionDialog.open} 
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {actionDialog.action === 'approve' && '✅ Approve Booking'}
            {actionDialog.action === 'reject' && '❌ Reject Booking'}
            {actionDialog.action === 'delete' && '🗑️ Delete Booking'}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to <strong>{actionDialog.action}</strong> this booking?
              {actionDialog.action === 'delete' && ' This action cannot be undone.'}
            </Typography>
            {actionDialog.bookingDetails && (
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Room:</strong> {actionDialog.bookingDetails.room?.roomName || actionDialog.bookingDetails.room?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Booked By:</strong> {actionDialog.bookingDetails.scheduledBy?.fullName || 
                    actionDialog.bookingDetails.scheduledBy?.username || 
                    actionDialog.bookingDetails.bookedBy?.fullName ||
                    actionDialog.bookingDetails.bookedBy?.username ||
                    'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date:</strong> {actionDialog.bookingDetails.meetingDate ? 
                    new Date(actionDialog.bookingDetails.meetingDate).toLocaleDateString() : 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Time:</strong> {actionDialog.bookingDetails.startTime && actionDialog.bookingDetails.endTime ? 
                    `${actionDialog.bookingDetails.startTime} - ${actionDialog.bookingDetails.endTime}` : 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Guests:</strong> {actionDialog.bookingDetails.numberOfGuests || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Tea Service:</strong> {actionDialog.bookingDetails.teaService ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Current Status:</strong> 
                  <Chip 
                    label={actionDialog.bookingDetails.status || 'Pending'} 
                    size="small" 
                    color={getStatusColor(actionDialog.bookingDetails.status)}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleActionConfirm}
              color={actionDialog.action === 'approve' ? 'success' : actionDialog.action === 'delete' ? 'error' : 'error'}
              variant="contained"
              disabled={
                (actionDialog.action === 'approve' || actionDialog.action === 'reject') 
                  ? !isPending(actionDialog.bookingDetails) 
                  : false
              }
            >
              {actionDialog.action === 'approve' && 'Approve'}
              {actionDialog.action === 'reject' && 'Reject'}
              {actionDialog.action === 'delete' && 'Delete'}
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

export default ManageBookings;
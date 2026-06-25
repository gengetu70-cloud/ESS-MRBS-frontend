import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  MeetingRoom,
  People,
  AccessTime,
} from '@mui/icons-material';
import { formatDate, formatTime } from '../utils/helpers';

const BookingCard = ({ booking, onCancel, showCancel = true }) => {
  const { room, meetingDate, startTime, endTime, numberOfGuests, teaService, status } = booking;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const canCancel = status === 'pending' || status === 'approved';

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {room?.roomName || 'Unknown Room'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {room?.department || ''}
            </Typography>
          </Box>
          <Chip
            label={status || 'Pending'}
            size="small"
            color={getStatusColor(status)}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2">
              {formatDate(meetingDate)} • {formatTime(startTime)} - {formatTime(endTime)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <People fontSize="small" color="action" />
            <Typography variant="body2">{numberOfGuests} guests</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MeetingRoom fontSize="small" color="action" />
            <Typography variant="body2">
              Tea: {teaService ? 'Yes' : 'No'}
            </Typography>
          </Box>
        </Box>

        {showCancel && canCancel && onCancel && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Tooltip title="Cancel Booking">
              <IconButton
                size="small"
                color="error"
                onClick={() => onCancel(booking._id)}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCard;
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  People,
  BookOnline,
} from '@mui/icons-material';

const RoomCard = ({ room, onBook }) => {
  const isAvailable = room.status === 'available';

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {room.roomName}
          </Typography>
          <Chip
            label={room.status}
            size="small"
            color={isAvailable ? 'success' : 'warning'}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Building {room.buildingNumber}, Floor {room.floorNumber}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <People fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Capacity: {room.maxCapacity} people
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {room.department}
        </Typography>

        {room.amenities && room.amenities.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {room.amenities.slice(0, 3).map((item, idx) => (
              <Chip key={idx} label={item} size="small" variant="outlined" />
            ))}
            {room.amenities.length > 3 && (
              <Chip label={`+${room.amenities.length - 3} more`} size="small" variant="outlined" />
            )}
          </Box>
        )}

        <Tooltip title={isAvailable ? 'Book this room' : 'Room is currently booked'}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<BookOnline />}
            onClick={() => onBook(room)}
            disabled={!isAvailable}
            sx={{ mt: 'auto' }}
          >
            {isAvailable ? 'Book Room' : 'Booked'}
          </Button>
        </Tooltip>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Divider,
  Chip,
  IconButton,
  Button,
  Box,
  Alert,
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
  MeetingRoom as MeetingRoomIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  LocalCafe as TeaIcon,
  CheckCircle as CheckIcon,
  QrCode as QrCodeIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

const TicketDialog = ({ 
  open, 
  onClose, 
  booking,
}) => {
  const ticketRef = useRef(null);

  // ✅ Fixed: Better print handler
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Ticket-${booking?.ticketNumber || 'booking'}`,
    onBeforePrint: () => {
      console.log('🖨️ Preparing to print...');
    },
    onAfterPrint: () => {
      console.log('✅ Print completed');
    },
    onPrintError: (error) => {
      console.error('❌ Print error:', error);
    },
    pageStyle: `
      @media print {
        @page {
          size: A5;
          margin: 10mm;
        }
        body {
          font-family: Arial, sans-serif;
          background: white !important;
        }
        .no-print {
          display: none !important;
        }
        .print-only {
          display: block !important;
        }
      }
      .print-only {
        display: none;
      }
    `,
  });

  // ✅ Fallback print method if useReactToPrint fails
  const handlePrintFallback = () => {
    const printContent = ticketRef.current;
    if (!printContent) {
      alert('No content to print');
      return;
    }

    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) {
      alert('Please allow popups to print the ticket');
      return;
    }

    win.document.write(`
      <html>
        <head>
          <title>Ticket ${booking?.ticketNumber || ''}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              max-width: 500px; 
              margin: 0 auto;
            }
            .ticket-container {
              border: 2px solid #1976d2;
              border-radius: 12px;
              padding: 30px;
              background: white;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { color: #1976d2; margin: 0; }
            .header p { color: #666; margin: 0; }
            .divider { border-top: 1px solid #ddd; margin: 15px 0; }
            .detail-row { display: flex; margin: 8px 0; }
            .detail-label { font-weight: bold; width: 120px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .verified { color: #2e7d32; font-weight: bold; }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="header">
              <h2>ESS MRBS</h2>
              <p>Meeting Room Booking System</p>
              <div class="divider"></div>
              <p><strong>ENTRY TICKET</strong></p>
            </div>
            
            <div style="text-align:center;margin-bottom:15px;">
              <span style="background:#1976d2;color:white;padding:4px 12px;border-radius:16px;font-size:12px;">
                Ticket #${booking?.ticketNumber || 'N/A'}
              </span>
            </div>

            <div style="background:#f5f7fa;padding:15px;border-radius:8px;margin-bottom:15px;">
              <p style="font-weight:bold;margin:0 0 10px 0;">Meeting Details</p>
              <div class="detail-row"><span class="detail-label">Room:</span> ${booking?.roomName || 'N/A'}</div>
              <div class="detail-row"><span class="detail-label">Scheduled by:</span> ${booking?.department || 'N/A'}</div>
              <div class="detail-row"><span class="detail-label">Location:</span> Building ${booking?.buildingNumber || 'N/A'}, Floor ${booking?.floorNumber || 'N/A'}</div>
              <div class="detail-row"><span class="detail-label">Date:</span> ${booking?.meetingDate ? new Date(booking.meetingDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</div>
              <div class="detail-row"><span class="detail-label">Time:</span> ${booking?.startTime || 'N/A'} - ${booking?.endTime || 'N/A'}</div>
              <div class="detail-row"><span class="detail-label">Guests:</span> ${booking?.numberOfGuests || 0}</div>
              ${booking?.teaService ? `<div class="detail-row"><span class="detail-label">Tea Service:</span> Yes</div>` : ''}
              ${booking?.meetingTitle ? `<div class="detail-row"><span class="detail-label">Title:</span> "${booking.meetingTitle}"</div>` : ''}
            </div>

            <div>
              <div><strong>Booked By:</strong> ${booking?.bookedBy || 'N/A'}</div>
              <div style="font-size:12px;color:#666;">Booking ID: ${booking?.bookingId || 'N/A'}</div>
              ${booking?.department ? `<div style="font-size:12px;color:#666;">Department: ${booking.department}</div>` : ''}
            </div>

            <div class="divider"></div>
            <div class="footer">
              <p>This ticket is valid for entry to the meeting</p>
              <p>Please present this ticket at the reception</p>
              <p class="verified">✔ Verified Booking</p>
            </div>
          </div>
          <div class="no-print" style="text-align:center;margin-top:20px;">
            <button onclick="window.print()" style="padding:10px 30px;background:#1976d2;color:white;border:none;border-radius:4px;cursor:pointer;">
              🖨️ Print Ticket
            </button>
            <button onclick="window.close()" style="padding:10px 30px;margin-left:10px;background:#666;color:white;border:none;border-radius:4px;cursor:pointer;">
              Close
            </button>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  // ✅ Combined print handler - tries ReactToPrint first, falls back to manual
  const handlePrintClick = () => {
    try {
      // Try ReactToPrint first
      handlePrint();
    } catch (error) {
      console.error('ReactToPrint failed, using fallback:', error);
      handlePrintFallback();
    }
  };

  // Ticket Component
  const BookingTicket = React.forwardRef(({ booking }, ref) => {
    return (
      <Paper
        ref={ref}
        sx={{
          p: 4,
          maxWidth: 400,
          mx: 'auto',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 3,
          border: '2px solid #1976d2',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
          }}
        />
        
        <Box sx={{ textAlign: 'center', mb: 3, mt: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            ESS MRBS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Meeting Room Booking System
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="overline" color="text.secondary">
            Entry Ticket
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Chip
            icon={<QrCodeIcon />}
            label={`Ticket #${booking?.ticketNumber || 'N/A'}`}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>

        <Box sx={{ bgcolor: '#f5f7fa', borderRadius: 2, p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Meeting Details
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MeetingRoomIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Room:</strong> {booking?.roomName || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BusinessIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Scheduled by:</strong> {booking?.department || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOnIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Location:</strong> Building {booking?.buildingNumber || 'N/A'}, Floor {booking?.floorNumber || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Date:</strong> {booking?.meetingDate ? new Date(booking.meetingDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TimeIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Time:</strong> {booking?.startTime || 'N/A'} - {booking?.endTime || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PeopleIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>Guests:</strong> {booking?.numberOfGuests || 0}
            </Typography>
          </Box>

          {booking?.teaService && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TeaIcon fontSize="small" color="primary" />
              <Typography variant="body2">
                <strong>Tea Service:</strong> Yes
              </Typography>
            </Box>
          )}

          {booking?.meetingTitle && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <MeetingRoomIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontStyle="italic">
                <strong>meeting title:</strong> "{booking.meetingTitle}"
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Booked By:</strong> {booking?.bookedBy || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Booking ID: {booking?.bookingId || 'N/A'}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            This ticket is valid for entry to the meeting
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Please present this ticket at the reception
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <CheckIcon fontSize="small" color="success" />
            <Typography variant="caption" color="success.main">
              Verified Booking
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
          }}
        />
      </Paper>
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckIcon />
          <Typography variant="h6" fontWeight="bold">
            Booking Confirmed! 🎉
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, bgcolor: '#f5f7fa' }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your meeting has been booked successfully! Please print your ticket for entry.
        </Alert>
        
        {booking ? (
          <BookingTicket ref={ticketRef} booking={booking} />
        ) : (
          <Alert severity="info">Loading ticket...</Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0, gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrintClick}
          sx={{ borderRadius: 2, px: 4 }}
        >
          Print Ticket
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketDialog;
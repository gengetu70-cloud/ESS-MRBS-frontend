import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
  IconButton,
  Button,
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
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

const TicketDialog = ({ open, onClose, booking }) => {
  const ticketRef = useRef(null);

  const handlePrint = () => {
    console.log('🖨️ Print button clicked');
    
    if (!ticketRef.current) {
      console.error('❌ Ticket ref is null');
      alert('Ticket not ready. Please try again.');
      return;
    }

    try {
      const ticketElement = ticketRef.current;
      const ticketHTML = ticketElement.outerHTML;
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        alert('Please allow popups to print the ticket.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Meeting Ticket - ESS MRBS</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                background: white;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 10px;
              }
              
              .ticket-container {
                max-width: 380px;
                width: 100%;
              }
              
              .ticket {
                background: white;
                border: 2px solid #1976d2;
                border-radius: 10px;
                padding: 20px 20px 18px 20px;
                position: relative;
              }
              
              .ticket-top-border {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #1976d2, #42a5f5, #1976d2);
                border-radius: 10px 10px 0 0;
              }
              
              .ticket-bottom-border {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #1976d2, #42a5f5, #1976d2);
                border-radius: 0 0 10px 10px;
              }
              
              .header {
                text-align: center;
                border-bottom: 2px dashed #ddd;
                padding-bottom: 10px;
                margin-bottom: 12px;
              }
              
              .header h2 {
                font-size: 18px;
                color: #1976d2;
                font-weight: 700;
                letter-spacing: 0.5px;
              }
              
              .header p {
                font-size: 10px;
                color: #666;
                margin-top: 1px;
              }
              
              .ticket-id {
                text-align: center;
                margin: 10px 0 12px 0;
              }
              
              .ticket-id span {
                background: #e3f2fd;
                color: #1976d2;
                padding: 4px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                display: inline-block;
              }
              
              .details {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-bottom: 12px;
              }
              
              .row {
                display: flex;
                align-items: center;
                padding: 6px 10px;
                background: #f8f9fa;
                border-radius: 6px;
                border-left: 3px solid #1976d2;
              }
              
              .row-icon {
                width: 18px;
                height: 18px;
                color: #1976d2;
                margin-right: 10px;
                flex-shrink: 0;
              }
              
              .row-label {
                font-size: 11px;
                color: #666;
                font-weight: 500;
                min-width: 65px;
                flex-shrink: 0;
              }
              
              .row-value {
                font-size: 12px;
                color: #1a1a1a;
                font-weight: 500;
              }
              
              .row-value-success {
                color: #2e7d32;
              }
              
              .footer {
                border-top: 2px dashed #ddd;
                padding-top: 10px;
                text-align: center;
              }
              
              .footer p {
                font-size: 10px;
                color: #666;
              }
              
              .verified {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-top: 4px;
                flex-wrap: wrap;
              }
              
              .verified svg {
                width: 14px;
                height: 14px;
                color: #2e7d32;
              }
              
              .verified-text {
                font-size: 10px;
                color: #2e7d32;
                font-weight: 600;
              }
              
              .booking-id {
                font-size: 10px;
                color: #888;
              }
              
              @media print {
                body {
                  padding: 0 !important;
                  min-height: 100vh !important;
                  display: flex !important;
                  justify-content: center !important;
                  align-items: center !important;
                }
                
                .ticket-container {
                  max-width: 100% !important;
                  width: auto !important;
                }
                
                .ticket {
                  border: 2px solid #1976d2 !important;
                  box-shadow: none !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  max-width: 350px !important;
                  width: 100% !important;
                  margin: 0 auto !important;
                  padding: 16px !important;
                  page-break-after: avoid !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  transform: scale(0.92) !important;
                  transform-origin: center !important;
                }
                
                .ticket * {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                
                .header {
                  padding-bottom: 8px !important;
                  margin-bottom: 10px !important;
                }
                
                .header h2 {
                  font-size: 16px !important;
                }
                
                .header p {
                  font-size: 9px !important;
                }
                
                .ticket-id {
                  margin: 8px 0 10px 0 !important;
                }
                
                .ticket-id span {
                  font-size: 11px !important;
                  padding: 3px 14px !important;
                }
                
                .details {
                  gap: 4px !important;
                  margin-bottom: 10px !important;
                }
                
                .row {
                  padding: 4px 8px !important;
                }
                
                .row-label {
                  font-size: 10px !important;
                  min-width: 55px !important;
                }
                
                .row-value {
                  font-size: 11px !important;
                }
                
                .row-icon {
                  width: 15px !important;
                  height: 15px !important;
                  margin-right: 8px !important;
                }
                
                .footer {
                  padding-top: 8px !important;
                }
                
                .footer p {
                  font-size: 9px !important;
                }
                
                .verified-text {
                  font-size: 9px !important;
                }
                
                .booking-id {
                  font-size: 9px !important;
                }
                
                .ticket-top-border, .ticket-bottom-border {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  height: 3px !important;
                }
                
                .row {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="ticket-container">
              ${ticketHTML}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
              window.onafterprint = function() {
                setTimeout(function() {
                  window.close();
                }, 1000);
              };
            <\/script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
    } catch (error) {
      console.error('❌ Print error:', error);
      alert('Failed to print. Please try again or use browser print (Ctrl+P).');
    }
  };

  const BookingTicket = React.forwardRef(({ booking }, ref) => (
    <div ref={ref} className="ticket">
      <div className="ticket-top-border"></div>
      
      <div className="header">
        <h2>ESS MRBS</h2>
        <p>Meeting Room Booking System • Entry Ticket</p>
      </div>
      
      <div className="ticket-id">
        <span>#{booking?.ticketNumber || 'N/A'}</span>
      </div>
      
      <div className="details">
        <div className="row">
          <MeetingRoomIcon className="row-icon" />
          <span className="row-label">Room:</span>
          <span className="row-value">{booking?.roomName || 'N/A'}</span>
        </div>
        
        <div className="row">
          <CalendarIcon className="row-icon" />
          <span className="row-label">Date:</span>
          <span className="row-value">
            {booking?.meetingDate ? new Date(booking.meetingDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'N/A'}
          </span>
        </div>
        
        <div className="row">
          <TimeIcon className="row-icon" />
          <span className="row-label">Time:</span>
          <span className="row-value">{booking?.startTime || 'N/A'} - {booking?.endTime || 'N/A'}</span>
        </div>
        
        <div className="row">
          <PeopleIcon className="row-icon" />
          <span className="row-label">Guests:</span>
          <span className="row-value">{booking?.numberOfGuests || 0}</span>
        </div>
        
        {booking?.teaService && (
          <div className="row">
            <TeaIcon className="row-icon" />
            <span className="row-label">Tea Service:</span>
            <span className="row-value row-value-success">✓ Included</span>
          </div>
        )}
        
        <div className="row">
          <PersonIcon className="row-icon" />
          <span className="row-label">Booked By:</span>
          <span className="row-value">{booking?.bookedBy || 'N/A'}</span>
        </div>
        
        {booking?.department && (
          <div className="row">
            <BusinessIcon className="row-icon" />
            <span className="row-label">Dept:</span>
            <span className="row-value">{booking?.department}</span>
          </div>
        )}
      </div>
      
      <div className="footer">
        <p>This ticket is valid for entry to the meeting • Please present at reception</p>
        <div className="verified">
          <CheckIcon />
          <span className="verified-text">Verified Booking</span>
          <span className="booking-id">• ID: {booking?.bookingId || 'N/A'}</span>
        </div>
      </div>
      
      <div className="ticket-bottom-border"></div>
    </div>
  ));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
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
        py: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckIcon />
          <Typography variant="h6" fontWeight="bold">
            Booking Confirmed!
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, bgcolor: '#f5f7fa' }}>
        <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
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
          onClick={handlePrint}
          sx={{ borderRadius: 1, px: 4 }}
        >
          Print Ticket
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: 1 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketDialog;
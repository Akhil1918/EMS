import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Download as DownloadIcon, Cancel as CancelIcon, Event as EventIcon } from '@mui/icons-material';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEventRefresh } from '../context/EventRefreshContext';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const navigate = useNavigate();
  const { refreshEvents } = useEventRefresh();

  const fetchRegistrations = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please login to view your registrations");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:5000/api/registrations/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure we have valid data before setting it
      if (res.data && res.data.data) {
        setRegistrations(res.data.data.filter(reg => reg && reg.event)); // Filter out any invalid registrations
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError(err.response?.data?.message || "Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const downloadTicket = async (registrationId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/registrations/${registrationId}/ticket`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${registrationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Ticket downloaded successfully!");
    } catch (err) {
      console.error("Error downloading ticket:", err);
      setError(err.response?.data?.message || "Error downloading ticket");
    }
  };

  const handleCancelRegistration = async (registrationId, eventId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/registrations/${registrationId}`,
        {
          headers: { 
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (res.data.updatedEvent) {
        setRegistrations(prev => prev.map(event => 
          event._id === eventId ? res.data.updatedEvent : event
        ));
        
        if (window.updateEventData) {
          window.updateEventData(res.data.updatedEvent);
        }
      }
      setMessage('Registration cancelled successfully');
      refreshEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelDialogOpen(false);
    }
  };

  const getStatusColor = (eventDate) => {
    if (!eventDate) return "default";
    const now = new Date();
    const event = new Date(eventDate);
    if (event < now) return "default";
    if (event.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return "error";
    return "success";
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #1a1a1f, #2d2d35)',
        color: '#f3f4f6'
      }}
    >
      <Container maxWidth="xl" sx={{ py: 8 }}>
        {/* Page Header */}
        <Box sx={{ 
          mb: 4,
          background: 'linear-gradient(145deg, #24242a, #2a2a32)',
          p: 4,
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.025em'
          }}>
            My Registrations
          </Typography>
          <Typography sx={{ color: '#9ca3af', mt: 1 }}>
            Manage your event registrations and download tickets
          </Typography>
        </Box>

        {/* Alerts */}
        {message && (
          <Alert severity="success" sx={{ 
            mb: 4,
            background: '#2f2f38',
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#8b5cf6' }
          }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ 
            mb: 4,
            background: '#2f2f38',
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#ef4444' }
          }}>
            {error}
          </Alert>
        )}

        {/* Content Section */}
        {registrations.length === 0 ? (
          <Card sx={{ 
            maxWidth: 600, 
            margin: "0 auto", 
            textAlign: 'center',
            p: 4,
            background: 'linear-gradient(145deg, #24242a, #2a2a32)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            border: '1px solid #3f3f46'
          }}>
            <EventIcon sx={{ fontSize: 80, color: '#8b5cf6', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#ffffff', mb: 1 }}>
              No Registrations Found
            </Typography>
            <Button
              variant="contained"
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }
              }}
              onClick={() => navigate('/events')}
              startIcon={<EventIcon />}
            >
              Browse Events
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {registrations.map((reg) => (
              <Grid item key={reg._id} xs={12} sm={6} md={4}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(145deg, #24242a, #2a2a32)',
                  border: '1px solid #3f3f46',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#ffffff' }}>
                        {reg.event.name}
                      </Typography>
                      <Chip
                        label={new Date(reg.event.date) > new Date() ? "Active" : "Completed"}
                        color={getStatusColor(reg.event.date)}
                        size="small"
                        sx={{ 
                          background: getStatusColor(reg.event.date) === 'success' ? '#2f5d2f' : '#3f3f46',
                          color: '#ffffff'
                        }}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 1, borderColor: '#3f3f46' }} />
                    
                    <Typography sx={{ color: '#9ca3af', mb: 1 }}>
                      Ticket #: {reg.ticketNumber}
                    </Typography>
                    <Typography sx={{ color: '#9ca3af', mb: 1 }}>
                      Date: {new Date(reg.event.date).toLocaleDateString()}
                    </Typography>
                    <Typography sx={{ color: '#9ca3af', mb: 1 }}>
                      Time: {typeof reg.event.timeFrame === 'object' ? 
                        `${reg.event.timeFrame.startTime} to ${reg.event.timeFrame.endTime}` : 
                        reg.event.timeFrame}
                    </Typography>
                    <Typography sx={{ color: '#9ca3af', mb: 1 }}>
                      Location: {reg.event.location}
                    </Typography>
                    <Typography sx={{ color: '#9ca3af' }}>
                      Registered on: {new Date(reg.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ 
                    justifyContent: 'space-between', 
                    px: 2, 
                    pb: 2,
                    borderTop: '1px solid #3f3f46'
                  }}>
                    <Box>
                      <Tooltip title="Download Ticket">
                        <IconButton 
                          onClick={() => downloadTicket(reg._id)}
                          sx={{ color: '#8b5cf6' }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      {new Date(reg.event.date) > new Date() && (
                        <Tooltip title="Cancel Registration">
                          <IconButton 
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setCancelDialogOpen(true);
                            }}
                            sx={{ color: '#ef4444' }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Button
                      size="small"
                      onClick={() => navigate(`/events/${reg.event._id}`)}
                      sx={{
                        color: '#8b5cf6',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.1)'
                        }
                      }}
                    >
                      View Event
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Cancel Registration Dialog */}
        <Dialog 
          open={cancelDialogOpen} 
          onClose={() => setCancelDialogOpen(false)}
          PaperProps={{
            sx: {
              background: 'linear-gradient(145deg, #24242a, #2a2a32)',
              border: '1px solid #3f3f46'
            }
          }}
        >
          <DialogTitle sx={{ color: '#ffffff', background: '#2a2a32' }}>
            Cancel Registration
          </DialogTitle>
          <DialogContent sx={{ color: '#9ca3af' }}>
            <Typography>
              Are you sure you want to cancel your registration for "{selectedRegistration?.event?.name}"?
            </Typography>
            <Typography sx={{ mt: 1, color: '#ef4444' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ background: '#2a2a32' }}>
            <Button 
              onClick={() => setCancelDialogOpen(false)}
              sx={{ color: '#9ca3af' }}
            >
              Keep Registration
            </Button>
            <Button 
              onClick={() => handleCancelRegistration(selectedRegistration?._id, selectedRegistration?.event?._id)} 
              sx={{
                background: '#ef4444',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#dc2626'
                }
              }}
            >
              Cancel Registration
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Container>
  );
};

export default MyRegistrations;

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  LinearProgress,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Chip,
  Paper
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import { useEventRefresh } from '../context/EventRefreshContext';
import PeopleIcon from '@mui/icons-material/People';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState('');
  const { refreshCount } = useEventRefresh();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`https://ems-backend-xir2.onrender.com/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvent(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, refreshCount]);

  useEffect(() => {
    const handleEventUpdate = (updatedEvent) => {
      if (updatedEvent._id === eventId) {
        setEvent(updatedEvent);
      }
    };

    window.updateEventData = handleEventUpdate;
    return () => delete window.updateEventData;
  }, [eventId]);

  const handleRegistration = async () => {
    try {
      const token = sessionStorage.getItem("token");
      
      if (!token) {
        navigate('/login');
        return;
      }

      setRegistering(true);
      const res = await axios.post(
        `/api/registrations/event/${eventId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccess('Registration successful!');
        // Update local event data
        if (res.data.updatedEvent) {
          setEvent(res.data.updatedEvent);
          if (window.updateEventData) {
            window.updateEventData(res.data.updatedEvent);
          }
        }
        // Close dialog after success
        setRegisterDialogOpen(false);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("token");
        setUser(null);
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setRegistering(false);
      setRegisterDialogOpen(false); // Ensure dialog closes in all cases
    }
  };

  // Helper function to check if event is full
  const isEventFull = (event) => {
    return event.stats.totalRegistrations >= event.capacity;
  };

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!event) return <Container sx={{ mt: 4 }}><Alert severity="error">Event not found</Alert></Container>;

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{ 
        minHeight: '100vh',
        background: '#34343d',
        color: '#e5e7eb'
      }}
    >
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ mb: 4 }}>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        </Box>

        {/* Event Image Section */}
        <Card sx={{ 
          mb: 4,
          background: 'linear-gradient(145deg, #24242a, #2a2a32)',
          border: '1px solid #3f3f46',
          borderRadius: 3
        }}>
          <CardMedia
            component="img"
            height="400"
            image={event.image || '/placeholder.jpg'}
            alt={event.name}
            sx={{ objectFit: 'cover' }}
          />
        </Card>

        {/* Event Content Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              p: 4,
              background: '#3a3a42',
              border: '1px solid #4f4f56',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h3" component="h1" sx={{ 
                mb: 3, 
                color: '#ffffff',
                fontWeight: 600 
              }}>
                {event.name}
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#8b5cf6' }}>
                  Event Description
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph 
                  sx={{ 
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                    fontSize: '1.1rem',
                    color: '#a1a1aa'
                  }}
                >
                  {event.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#8b5cf6' }}>
                  Event Details
                </Typography>
                <Grid container spacing={2}>
                  <DetailItem 
                    icon={<CalendarTodayIcon color="primary" />} 
                    title="Date & Time"
                    content={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" component="span" sx={{ color: '#a1a1aa' }}>
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ color: '#a1a1aa' }}>
                          {typeof event.timeFrame === 'object' ? 
                            `${new Date(`2000-01-01T${event.timeFrame.startTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })} - 
                             ${new Date(`2000-01-01T${event.timeFrame.endTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}` : 
                            event.timeFrame.split('-').map(time => 
                              new Date(`2000-01-01T${time.trim()}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
                            ).join(' - ')
                          }
                        </Typography>
                      </Box>
                    }
                  />
                  <DetailItem 
                    icon={<LocationOnIcon color="primary" />} 
                    title="Location"
                    content={event.location}
                  />
                  <DetailItem 
                    icon={<GroupIcon color="primary" />} 
                    title="Capacity"
                    content={`${event.capacity} people`}
                  />
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 4,
              background: '#3a3a42',
              border: '1px solid #4f4f56',
              borderRadius: 3
            }}>
              <Typography variant="h5" sx={{ 
                mb: 3,
                color: '#ffffff',
                fontWeight: 600
              }}>
                Event Status
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={(event.stats.totalRegistrations / event.capacity) * 100}
                  sx={{ 
                    flexGrow: 1,
                    mr: 2,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#40404a',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#d8b4fe'
                    }
                  }}
                />
                <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                  {Math.round((event.stats.totalRegistrations / event.capacity) * 100)}%
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                  <strong>{event.stats.totalRegistrations}</strong> registered of{' '}
                  <strong>{event.capacity}</strong> spots
                </Typography>
                {event.isWaitlistEnabled && event.waitlistCount > 0 && (
                  <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                    <strong>{event.waitlistCount}</strong> on waitlist
                  </Typography>
                )}
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => setRegisterDialogOpen(true)}
                disabled={isEventFull(event) && !event.isWaitlistEnabled}
                sx={{
                  mt: 4,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff!important',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                  },
                  '&:disabled': {
                    background: '#40404a',
                    color: '#6b6b7a!important'
                  }
                }}
              >
                {isEventFull(event) 
                  ? event.isWaitlistEnabled 
                    ? "Join Waitlist" 
                    : "Event Full" 
                  : "Register Now"}
              </Button>
            </Paper>

            <Paper sx={{ 
              p: 2, 
              mt: 4,
              background: '#3a3a42',
              border: '1px solid #4f4f56',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#a1a1aa' }}>
                Organizer Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ width: 40, height: 40, mr: 2 }}
                  alt={event.organizer?.name || 'Unknown organizer'}
                >
                  {event.organizer?.name?.[0] || 'O'}
                </Avatar>
                <div>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#a1a1aa' }}>
                    {event.organizer?.name || 'Unknown organizer'}
                  </Typography>
                </div>
              </Box>
              {event.organizer?.businessDetails && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#a1a1aa' }}>Contact Information:</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {event.organizer.businessDetails.phoneNumber && (
                      <Chip 
                        label={event.organizer.businessDetails.phoneNumber}
                        variant="outlined" 
                        sx={{ color: '#a1a1aa' }}
                      />
                    )}
                    <Chip
                      label={event.organizer.email}
                      variant="outlined"
                      sx={{ color: '#a1a1aa' }}
                    />
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Updated Registration Dialog */}
        <Dialog
          open={registerDialogOpen}
          onClose={() => !registering && setRegisterDialogOpen(false)}
          PaperProps={{
            sx: {
              background: '#3a3a42',
              border: '1px solid #4f4f56',
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ color: '#ffffff' }}>
            {isEventFull(event) && event.isWaitlistEnabled 
              ? "Join Waitlist" 
              : "Confirm Registration"}
          </DialogTitle>
          <DialogContent sx={{ color: '#a1a1aa' }}>
            <Typography>
              {isEventFull(event) && event.isWaitlistEnabled 
                ? `The event is currently full. Would you like to join the waitlist for ${event.name}?`
                : `Are you sure you want to register for ${event.name}?`}
            </Typography>
            {isEventFull(event) && event.isWaitlistEnabled && (
              <Typography variant="body2" color="#a1a1aa" sx={{ mt: 1 }}>
                Current waitlist position: {event.waitlistCount + 1}
              </Typography>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            background: '#40404a',
            borderTop: '1px solid #4f4f56'
          }}>
            <Button 
              onClick={() => setRegisterDialogOpen(false)} 
              disabled={registering}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRegistration} 
              variant="contained" 
              color="primary"
              disabled={registering}
            >
              {registering 
                ? 'Processing...' 
                : isEventFull(event) && event.isWaitlistEnabled 
                  ? 'Join Waitlist' 
                  : 'Confirm Registration'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Container>
  );
};

const DetailItem = ({ icon, title, content }) => (
  <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <IconButton sx={{ color: '#8b5cf6', mr: 1 }}>
        {icon}
      </IconButton>
      <Typography variant="subtitle1" component="div" sx={{ 
        fontWeight: 500,
        color: '#a1a1aa' 
      }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="body2" component="div" sx={{ 
      ml: 6,
      color: '#a1a1aa'
    }}>
      {content}
    </Typography>
  </Grid>
);

export default EventDetails;

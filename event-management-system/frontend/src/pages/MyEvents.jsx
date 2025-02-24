import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { AssignmentInd as AttendanceIcon } from '@mui/icons-material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import InventoryIcon from '@mui/icons-material/Inventory';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import Skeleton from '@mui/material/Skeleton';
import { useEventRefresh } from '../context/EventRefreshContext';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
    popularEvent: null
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [selectedEventEquipment, setSelectedEventEquipment] = useState([]);
  const { refreshCount } = useEventRefresh();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          return;
        }

        if (!user?._id) {
          setError("User information not found. Please login again.");
          setLoading(false);
          return;
        }

        console.log('Fetching events for user:', user._id); // Debug log
        const res = await axios.get(
          `http://localhost:5000/api/events/my-events`,
          { 
            headers: { 
              Authorization: `Bearer ${token}` 
            }
          }
        );
        
        console.log('Events response:', res.data); // Debug log
        const eventsData = res.data.data;
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        
        // Calculate statistics
        const now = new Date();
        const stats = {
          totalEvents: eventsData.length,
          upcomingEvents: eventsData.filter(event => new Date(event.date) > now).length,
          totalRegistrations: eventsData.reduce((sum, event) => sum + (event.stats?.totalRegistrations || 0), 0),
          popularEvent: [...eventsData].sort((a, b) => 
            (b.stats?.totalRegistrations || 0) - (a.stats?.totalRegistrations || 0)
          )[0]
        };
        setStats(stats);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err); // Debug log
        setError(err.response?.data?.message || "Failed to fetch events");
        setLoading(false);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user, refreshCount]);

  useEffect(() => {
    // Filter and sort events based on current criteria
    let filtered = [...events];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      if (filterStatus === 'upcoming') {
        filtered = filtered.filter(event => new Date(event.date) > now);
      } else if (filterStatus === 'past') {
        filtered = filtered.filter(event => new Date(event.date) <= now);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return (b.stats?.totalRegistrations || 0) - (a.stats?.totalRegistrations || 0);
        default:
          return 0;
      }
    });
    
    setFilteredEvents(filtered);
  }, [events, searchTerm, sortBy, filterStatus]);

  useEffect(() => {
    const handleEventUpdate = (updatedEvent) => {
      setEvents(prev => prev.map(event => 
        event._id === updatedEvent._id ? updatedEvent : event
      ));
    };

    window.updateEventData = handleEventUpdate;
    return () => delete window.updateEventData;
  }, []);

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      await axios.delete(`http://localhost:5000/api/events/${selectedEvent._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(events.filter(event => event._id !== selectedEvent._id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleDuplicate = async (event) => {
    try {
      const token = sessionStorage.getItem("token");
      const duplicateEvent = {
        ...event,
        name: `${event.name} (Copy)`,
        date: new Date().toISOString().split('T')[0]
      };
      delete duplicateEvent._id;
      
      const response = await axios.post(
        'http://localhost:5000/api/events',
        duplicateEvent,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEvents([...events, response.data.data]);
    } catch (err) {
      setError("Failed to duplicate event");
    }
  };

  const downloadAttendanceReport = async (eventId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/events/${eventId}/attendance-report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${eventId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Attendance report downloaded successfully!");
    } catch (err) {
      console.error("Error downloading attendance report:", err);
      setError(err.response?.data?.message || "Error downloading attendance report");
    }
  };

  const handleOpenEquipmentDialog = (equipment) => {
    setSelectedEventEquipment(equipment);
    setEquipmentDialogOpen(true);
  };

  const renderStats = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ 
          p: 2, 
          textAlign: 'center',
          background: 'linear-gradient(145deg, #24242a, #2a2a32)',
          border: '1px solid #3f3f46',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)'
          }
        }}>
          <EventIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h6" sx={{ mt: 1, color: '#ffffff' }}>{stats.totalEvents}</Typography>
          <Typography sx={{ color: '#9ca3af' }}>Total Events</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(145deg, #24242a, #2a2a32)' }}>
          <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h6" sx={{ color: '#ffffff' }}>{stats.upcomingEvents}</Typography>
          <Typography sx={{ color: '#9ca3af' }}>Upcoming Events</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(145deg, #24242a, #2a2a32)' }}>
          <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h6" sx={{ color: '#ffffff' }}>{stats.totalRegistrations}</Typography>
          <Typography sx={{ color: '#9ca3af' }}>Total Registrations</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(145deg, #24242a, #2a2a32)' }}>
          <EventIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h6" sx={{ color: '#ffffff' }}>{stats.popularEvent?.name || 'N/A'}</Typography>
          <Typography sx={{ color: '#9ca3af' }}>Most Popular Event</Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderFilters = () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        placeholder="Search events..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          '& .MuiInputBase-root': {
            color: '#ffffff',
            '& fieldset': { borderColor: '#4b5563' },
            '&:hover fieldset': { borderColor: '#6366f1' }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#9ca3af' }} />
            </InputAdornment>
          ),
        }}
      />
      
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel sx={{ color: '#9ca3af' }}>Sort By</InputLabel>
        <Select
          value={sortBy}
          label="Sort By"
          onChange={(e) => setSortBy(e.target.value)}
          sx={{
            color: '#ffffff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4b5563'
            }
          }}
        >
          <MenuItem value="date">Date</MenuItem>
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="popularity">Popularity</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel sx={{ color: '#9ca3af' }}>Filter</InputLabel>
        <Select
          value={filterStatus}
          label="Filter"
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{
            color: '#ffffff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4b5563'
            }
          }}
        >
          <MenuItem value="all">All Events</MenuItem>
          <MenuItem value="upcoming">Upcoming</MenuItem>
          <MenuItem value="past">Past Events</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  const renderEmptyState = () => (
    <Card sx={{ 
      maxWidth: 600, 
      margin: "0 auto", 
      mt: 4,
      textAlign: 'center',
      p: 4,
      background: 'linear-gradient(145deg, #24242a, #2a2a32)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      border: '1px solid #3f3f46'
    }}>
      <EventIcon sx={{ fontSize: 80, color: '#8b5cf6', mb: 2 }} />
      <Typography variant="h5" gutterBottom sx={{ color: '#ffffff' }}>
        No Events Created Yet
      </Typography>
      <Typography variant="body1" sx={{ color: '#9ca3af', mb: 3 }}>
        Get started by creating your first event!
      </Typography>
      <Button
        variant="contained"
        sx={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#ffffff',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }
        }}
        onClick={() => navigate("/create-event")}
      >
        Create New Event
      </Button>
    </Card>
  );

  const renderEventCard = (event) => (
    <Grid item xs={12} sm={6} md={4} key={event._id}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(145deg, #24242a, #2a2a32)',
        border: '1px solid #3f3f46'
      }}>
        <CardMedia
          component="img"
          height="140"
          image={event.image}
          alt={event.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2" sx={{ color: '#ffffff' }}>
            {event.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af' }} paragraph>
            {event.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EventIcon sx={{ mr: 1, color: '#8b5cf6' }} />
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              {new Date(event.date).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 1, color: '#8b5cf6' }} />
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              {event.stats?.totalRegistrations || 0} registrations
            </Typography>
          </Box>
          <Chip 
            label={new Date(event.date) > new Date() ? "Upcoming" : "Past"}
            sx={{ 
              mt: 1,
              background: new Date(event.date) > new Date() ? '#2f5d2f' : '#3f3f46',
              color: '#ffffff'
            }}
            size="small"
          />
        </CardContent>
        <CardActions sx={{ 
          justifyContent: 'space-between',
          borderTop: '1px solid #3f3f46',
          padding: 2
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download Attendance Sheet">
              <IconButton 
                onClick={() => downloadAttendanceReport(event._id)}
                sx={{ color: '#8b5cf6' }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
            
            {event.equipment?.length > 0 && (
              <Tooltip title="View Booked Equipment">
                <IconButton 
                  onClick={() => handleOpenEquipmentDialog(event.equipment)}
                  sx={{ color: '#8b5cf6' }}
                >
                  <InventoryIcon />
                </IconButton>
              </Tooltip>
            )}

            
            <Tooltip title="Delete Event">
              <IconButton
                onClick={() => handleOpenDeleteDialog(event._id)}
                sx={{ color: '#ef4444' }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Button
            size="small"
            onClick={() => navigate(`/events/${event._id}`)}
            sx={{
              color: '#8b5cf6',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.1)'
              }
            }}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderEquipmentDialog = () => (
    <Dialog 
      open={equipmentDialogOpen} 
      onClose={() => setEquipmentDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <InventoryIcon sx={{ mr: 1 }} />
        Booked Equipment Details
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {selectedEventEquipment.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            No equipment booked for this event
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {selectedEventEquipment.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                      src={item.equipmentId?.imageUrl} 
                      alt={item.equipmentId?.name}
                      style={{ 
                        width: 80, 
                        height: 80, 
                        objectFit: 'cover', 
                        borderRadius: 4,
                        marginRight: 16,
                        backgroundColor: '#f5f5f5' 
                      }}
                      onError={(e) => {
                        e.target.src = '/placeholder-equipment.png';
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {item.equipmentId?.name || 'Unknown Equipment'}
                      </Typography>
                      <Chip 
                        label={item.equipmentId?.category || 'Uncategorized'}
                        size="small" 
                        color="secondary"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        <Box component="span" sx={{ fontWeight: 500 }}>Quantity:</Box> {item.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Box component="span" sx={{ fontWeight: 500 }}>Price:</Box> ${(item.equipmentId?.price || 0).toFixed(2)}/unit
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => navigate(`/equipment/${item.equipmentId?._id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setEquipmentDialogOpen(false)}
          variant="contained"
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1,2,3,4].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Skeleton variant="rectangular" height={200} />
          <Box sx={{ pt: 0.5 }}>
            <Skeleton />
            <Skeleton width="60%" />
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) return renderLoadingSkeleton();

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          background: 'linear-gradient(145deg, #24242a, #2a2a32)',
          p: 4,
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.025em'
          }}>
            My Events
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }
            }}
            onClick={() => navigate("/create-event")}
          >
            Create New Event
          </Button>
        </Box>

        {renderStats()}

        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(145deg, #24242a, #2a2a32)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          {renderFilters()}
        </Paper>

        {filteredEvents.length === 0 ? (
          events.length === 0 ? renderEmptyState() : (
            <Alert severity="info" sx={{ 
              background: '#2f2f38',
              color: '#ffffff',
              '& .MuiAlert-icon': { color: '#8b5cf6' }
            }}>
              No events match your search criteria.
            </Alert>
          )
        ) : (
          <Grid container spacing={3}>
            {filteredEvents.map(renderEventCard)}
          </Grid>
        )}

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          itemType="event"
        />
        {renderEquipmentDialog()}
      </Container>
    </Container>
  );
};

export default MyEvents;

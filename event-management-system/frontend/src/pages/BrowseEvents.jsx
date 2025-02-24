import React, { useState, useEffect } from "react";
import { 
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
  Box
} from "@mui/material";
import EventCard from "../components/EventCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FilterListIcon from '@mui/icons-material/FilterList';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';

const BrowseEvents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    sort: "date_desc",
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalResults: 0
  });

  const fetchEvents = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: filters.search,
          sortBy: filters.sort,
          page: filters.page,
          limit: filters.limit
        }
      });
      setEvents(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
      page: 1
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      sort: "date_desc",
      page: 1,
      limit: 12
    });
  };

  const getStatusChip = (eventDate) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    return eventDateObj > now ? 
      <Chip label="Upcoming" color="success" size="small" /> : 
      <Chip label="Past" color="default" size="small" />;
  };

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
          alignItems: 'center', 
          mb: 4, 
          gap: 2,
          background: 'linear-gradient(145deg, #24242a, #2a2a32)',
          p: 4,
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <LocalActivityIcon fontSize="large" sx={{ color: '#8b5cf6' }} />
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.025em'
          }}>
            Explore All Events
          </Typography>
        </Box>

        {/* Filters Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(145deg, #24242a, #2a2a32)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FilterListIcon sx={{ color: '#8b5cf6' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Filter Events</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Events"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                variant="outlined"
                sx={{
                  '& .MuiInputLabel-root': { color: '#9ca3af' },
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: '#4b5563' },
                    '&:hover fieldset': { borderColor: '#6366f1' }
                  }
                }}
                InputProps={{
                  placeholder: "Search by name, location, or organizer..."
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={2}>
              <TextField
                select
                fullWidth
                label="Sort By"
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                variant="outlined"
                sx={{
                  '& .MuiInputLabel-root': { color: '#9ca3af' },
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: '#4b5563' },
                    '&:hover fieldset': { borderColor: '#6366f1' }
                  }
                }}
              >
                <MenuItem value="date_desc">Newest First</MenuItem>
                <MenuItem value="date_asc">Oldest First</MenuItem>
                <MenuItem value="popularity">Most Popular</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleResetFilters}
                sx={{ 
                  height: 56,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }
                }}
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Content Section */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={60} sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ 
            mb: 4,
            background: '#2f2f38',
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#ef4444' }
          }}>
            {error}
          </Alert>
        ) : (
          <>
            <Box sx={{ 
              mb: 4, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              background: '#2a2a32',
              p: 2,
              borderRadius: 2
            }}>
              <EventAvailableIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
                Showing {events.length} of {pagination.totalResults} events
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {events.map(event => (
                <Grid item key={event._id} xs={12} sm={6} md={4} lg={3}>
                  <EventCard 
                    event={event}
                    action={
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/events/${event._id}`)}
                        sx={{ 
                          mt: 1.5,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                          }
                        }}
                      >
                        Learn More
                      </Button>
                    }
                    extraContent={getStatusChip(event.date)}
                  />
                </Grid>
              ))}
            </Grid>

            {pagination.totalPages > 1 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={pagination.totalPages}
                  page={filters.page}
                  onChange={(e, page) => setFilters(prev => ({ ...prev, page }))}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#9ca3af',
                      '&.Mui-selected': {
                        background: '#6366f1!important',
                        color: '#ffffff'
                      }
                    }
                  }}
                  size={isMobile ? "small" : "medium"}
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Container>
  );
};

export default BrowseEvents; 
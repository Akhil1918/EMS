import React, { useState, useEffect } from "react";
import { 
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  IconButton,
  Box
} from "@mui/material";
import { 
  Event as EventIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Download as DownloadIcon
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    upcomingEvents: 0,
    pastEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const statsRes = await axios.get('/api/users/stats', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (statsRes.data?.success) {
          const { 
            totalRegistrations = 0, 
            upcomingEvents = 0, 
            pastEvents = 0 
          } = statsRes.data.data || {};
          
          setStats({
            totalRegistrations,
            upcomingEvents,
            pastEvents
          });
        } else {
          console.warn('Unexpected response format:', statsRes.data);
          setStats({
            totalRegistrations: 0,
            upcomingEvents: 0,
            pastEvents: 0
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setStats({
          totalRegistrations: 0,
          upcomingEvents: 0,
          pastEvents: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchData();
  }, [user]);

  const StatCard = ({ icon, title, value, color }) => (
    <Paper sx={{ 
      p: 3, 
      height: '100%',
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1.5 }}>{title}</Typography>
      </Box>
      <Typography variant="h4" color="primary">{value}</Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
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
        {/* Profile Header */}
        <Card sx={{ 
          mb: 4,
          background: 'linear-gradient(145deg, #24242a, #2a2a32)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          border: '1px solid #3f3f46'
        }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ 
                width: 100, 
                height: 100, 
                mr: 3,
                bgcolor: '#8b5cf6',
                fontSize: '2.5rem'
              }}>
                {(user.profile?.name || user.email[0]).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h3" gutterBottom sx={{ color: '#ffffff' }}>
                  {user.profile?.name || "Anonymous User"}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
                  {user.email} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(145deg, #24242a, #2a2a32)',
              border: '1px solid #3f3f46',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <EventIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
              <Typography variant="h4" sx={{ mt: 1, color: '#ffffff' }}>
                {stats.totalRegistrations}
              </Typography>
              <Typography sx={{ color: '#9ca3af' }}>Total Registrations</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(145deg, #24242a, #2a2a32)',
              border: '1px solid #3f3f46',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <PeopleIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
              <Typography variant="h4" sx={{ color: '#ffffff' }}>
                {stats.upcomingEvents}
              </Typography>
              <Typography sx={{ color: '#9ca3af' }}>Upcoming Events</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(145deg, #24242a, #2a2a32)',
              border: '1px solid #3f3f46',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <InventoryIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
              <Typography variant="h4" sx={{ color: '#ffffff' }}>
                {stats.pastEvents}
              </Typography>
              <Typography sx={{ color: '#9ca3af' }}>Past Events</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default UserProfile;

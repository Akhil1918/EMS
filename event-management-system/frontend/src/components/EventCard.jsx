import React from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#3a3a42',
      border: '1px solid #4f4f56',
      borderRadius: '8px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }
    }}>
      <CardMedia
        component="img"
        height="140"
        image={event.image || "/default-event.jpg"}
        alt={event.name}
        sx={{ borderBottom: '1px solid #4f4f56' }}
      />
      <CardContent sx={{ 
        flexGrow: 1,
        background: 'rgba(0,0,0,0.1)'
      }}>
        <Typography gutterBottom variant="h5" component="div" sx={{ color: '#ffffff' }}>
          {event.name}
        </Typography>
        <Typography variant="body2" sx={{ 
          mb: 1, 
          color: '#a1a1aa',
          fontSize: '0.875rem'
        }}>
          {new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
        <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
          {event.location}
        </Typography>
      </CardContent>
      <Box sx={{ 
        p: 2,
        borderTop: '1px solid #4f4f56',
        background: '#40404a'
      }}>
        <Button 
          fullWidth 
          variant="contained"
          onClick={() => navigate(`/events/${event._id}`)}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#ffffff',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }
          }}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};

export default EventCard; 
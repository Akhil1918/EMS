import React from "react";
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  useTheme,
  Avatar,
  Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  EventAvailable,
  People,
  Business
} from "@mui/icons-material";

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <EventAvailable fontSize="large" />,
      title: "Event Management",
      text: "Create, organize, and manage events with our intuitive platform. Handle registrations, schedules, and communications in one place."
    },
    {
      icon: <People fontSize="large" />,
      title: "Attendee Experience",
      text: "Easy registration process, ticket management, and real-time updates for participants."
    },
    {
      icon: <Business fontSize="large" />,
      title: "Vendor Solutions",
      text: "Equipment management, service listings, and business promotion tools for vendors."
    }
  ];

  const steps = [
    { title: "Sign Up", description: "Create your free account in seconds" },
    { title: "Plan", description: "Set up your event details and requirements" },
    { title: "Launch", description: "Publish and start managing registrations" }
  ];

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0a0a0c, #111114)',
        color: '#f3f4f6'
      }}
    >
      {/* Inner container for content */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 10,
          background: 'linear-gradient(145deg, #16161a, #1a1a1f)',
          py: 8,
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.025em',
            fontSize: '2.25rem'
          }}>
            Modern Event Management Platform
          </Typography>
          <Typography variant="h5" sx={{ 
            mb: 4,
            color: '#9ca3af',
            fontWeight: 500
          }}>
            Streamline your events from planning to execution
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              px: 6, 
              py: 2, 
              fontSize: '1.2rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              borderRadius: '0.75rem',
              '&:hover': { 
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }
            }}
            onClick={() => navigate("/register")}
          >
            Get Started
          </Button>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 10, px: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper 
                sx={{ 
                  p: 4,
                  background: 'linear-gradient(145deg, #16161a, #1a1a1f)',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  width: 56, 
                  height: 56, 
                  mb: 3,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                }}>
                  {feature.icon}
                </Avatar>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 700,
                  color: '#ffffff',
                  fontSize: '1.5rem'
                }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#9ca3af',
                  lineHeight: 1.6
                }}>
                  {feature.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* How It Works */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 10,
          background: 'linear-gradient(145deg, #16161a, #1a1a1f)',
          borderRadius: '1.25rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          p: 4
        }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            fontSize: '2rem'
          }}>
            Simple Three-Step Process
          </Typography>
          <Divider sx={{ 
            width: 100, 
            height: 4, 
            bgcolor: 'primary.main', 
            mx: 'auto', 
            mb: 6,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
          }} />
          
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  p: 3, 
                  background: 'linear-gradient(145deg, #16161a, #1a1a1f)',
                  borderRadius: '1rem',
                  borderLeft: '4px solid #6366f1',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                  }
                }}>
                  <Typography variant="h1" sx={{ 
                    color: 'primary.main',
                    mb: 2,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '4rem'
                  }}>
                    0{index + 1}
                  </Typography>
                  <Typography variant="h5" gutterBottom sx={{ 
                    color: '#ffffff',
                    fontWeight: 600
                  }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#9ca3af',
                    lineHeight: 1.6
                  }}>
                    {step.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ 
          textAlign: 'center', 
          background: 'linear-gradient(145deg, #16161a, #1a1a1f)',
          py: 8, 
          borderRadius: '1.25rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            fontSize: '2rem'
          }}>
            Ready to Transform Your Event Management?
          </Typography>
          <Button
            variant="contained"
            sx={{ 
              mt: 4, 
              px: 8, 
              py: 2, 
              fontSize: '1.2rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              borderRadius: '0.75rem',
              '&:hover': { 
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }
            }}
            onClick={() => navigate("/register")}
          >
            Join Now
          </Button>
        </Box>
      </Container>
    </Container>
  );
};

export default Home;

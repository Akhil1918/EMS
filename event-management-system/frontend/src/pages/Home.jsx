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
  Business,
  ArrowForward
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
      text: "Easy registration process, ticket management, and real-time updates for participants. Keep everyone informed and engaged."
    },
    {
      icon: <Business fontSize="large" />,
      title: "Vendor Solutions",
      text: "Equipment management, service listings, and business promotion tools for vendors. Connect with the right partners for your events."
    }
  ];

  const steps = [
    { title: "Sign Up", description: "Create your account in seconds with just a few clicks. No credit card required." },
    { title: "Plan", description: "Set up your event details, customize your requirements, and build your perfect event." },
    { title: "Launch", description: "Publish and start managing registrations with our powerful tools and analytics." }
  ];

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a, #141428)',
        color: '#f3f4f6',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Background gradient orbs */}
      <Box sx={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.05) 50%, rgba(0,0,0,0) 70%)',
        top: '-300px',
        right: '-200px',
        zIndex: 0,
        filter: 'blur(80px)'
      }} />
      
      <Box sx={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.05) 50%, rgba(0,0,0,0) 70%)',
        bottom: '-200px',
        left: '-100px',
        zIndex: 0,
        filter: 'blur(80px)'
      }} />

      {/* Inner container for content */}
      <Container maxWidth="xl" sx={{ py: 10, position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 12,
          background: 'linear-gradient(145deg, rgba(26,26,35,0.7), rgba(22,22,30,0.9))',
          py: 10,
          px: 4,
          borderRadius: 5,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.025em',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            textShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #ffffff 30%, #c7d2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Modern Event Management Platform
          </Typography>
          <Typography variant="h5" sx={{ 
            mb: 5,
            color: '#aeb6d0',
            fontWeight: 500,
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6,
            fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }
          }}>
            Streamline your events from planning to execution with our powerful yet intuitive platform designed for event professionals
          </Typography>
          <Button 
            variant="contained" 
            endIcon={<ArrowForward />}
            sx={{ 
              px: 6, 
              py: 2, 
              fontSize: '1.2rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.5)',
              '&:hover': { 
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.6)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate("/register")}
          >
            Get Started
          </Button>
        </Box>

        {/* Features Grid */}
        <Typography variant="h3" align="center" gutterBottom sx={{ 
          fontWeight: 700,
          color: '#ffffff',
          fontSize: { xs: '1.75rem', md: '2.25rem' },
          mb: 6
        }}>
          Powerful Features for Every Need
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 12, px: { xs: 2, md: 4 } }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper 
                sx={{ 
                  p: 4,
                  height: '100%',
                  background: 'linear-gradient(145deg, rgba(26,26,35,0.7), rgba(22,22,30,0.9))',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '1.25rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255,255,255,0.05)',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(99, 102, 241, 0.3)'
                  }
                }}
              >
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  width: 70, 
                  height: 70, 
                  mb: 3,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
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
                  color: '#aeb6d0',
                  lineHeight: 1.8,
                  fontSize: '1rem'
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
          mb: 12,
          background: 'linear-gradient(145deg, rgba(26,26,35,0.7), rgba(22,22,30,0.9))',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          p: { xs: 4, md: 6 },
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 700,
            color: '#ffffff',
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            mb: 2
          }}>
            Simple Three-Step Process
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#aeb6d0',
            maxWidth: '700px',
            mx: 'auto',
            mb: 5
          }}>
            Get your event up and running in minutes with our streamlined workflow
          </Typography>
          <Divider sx={{ 
            width: 120, 
            height: 4, 
            bgcolor: 'primary.main', 
            mx: 'auto', 
            mb: 8,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            borderRadius: '2px'
          }} />
          
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  p: 4, 
                  height: '100%',
                  background: 'linear-gradient(145deg, rgba(26,26,35,0.7), rgba(22,22,30,0.9))',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                    '& .step-number': {
                      transform: 'scale(1.1)'
                    }
                  }
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.05))',
                    filter: 'blur(30px)',
                    zIndex: 0
                  }} />
                  
                  <Typography 
                    className="step-number"
                    variant="h1" 
                    sx={{ 
                      color: 'primary.main',
                      mb: 3,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '5rem',
                      fontWeight: 800,
                      lineHeight: 1,
                      position: 'relative',
                      zIndex: 1,
                      transition: 'transform 0.3s ease'
                    }}>
                    0{index + 1}
                  </Typography>
                  <Typography variant="h5" gutterBottom sx={{ 
                    color: '#ffffff',
                    fontWeight: 700,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#aeb6d0',
                    lineHeight: 1.8,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {step.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

    
      </Container>
    </Container>
  );
};

export default Home;

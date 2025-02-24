import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Alert, CircularProgress, Snackbar, Paper, Grid } from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        profile: { name: formData.name }
      });
      
      if (res.data.success) {
        setShowSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{ 
        minHeight: '100vh',
        background: '#23232a',
        color: '#e0e0e0',
        py: 8
      }}
    >
      <Container maxWidth="md">
        <Paper sx={{ 
          p: 6,
          background: '#2d2d35',
          border: '1px solid #3a3a3a',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
          <Typography variant="h3" sx={{ 
            mb: 5, 
            color: '#ffffff',
            fontWeight: 700,
            textAlign: 'center',
            letterSpacing: '-0.025em'
          }}>
            Create Account
          </Typography>

          {error && <Alert severity="error" sx={alertStyles}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  margin="normal"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={loading}
                  sx={{
                    '& .MuiInputLabel-root': { color: '#b0b0b0' },
                    '& .MuiOutlinedInput-root': {
                      color: '#e0e0e0',
                      '& fieldset': { borderColor: '#404040' },
                      '&:hover fieldset': { borderColor: '#737373' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={loading}
                  sx={{
                    '& .MuiInputLabel-root': { color: '#b0b0b0' },
                    '& .MuiOutlinedInput-root': {
                      color: '#e0e0e0',
                      '& fieldset': { borderColor: '#404040' },
                      '&:hover fieldset': { borderColor: '#737373' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  margin="normal"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={loading}
                  helperText="At least 6 characters"
                  sx={{
                    '& .MuiInputLabel-root': { color: '#b0b0b0' },
                    '& .MuiOutlinedInput-root': {
                      color: '#e0e0e0',
                      '& fieldset': { borderColor: '#404040' },
                      '&:hover fieldset': { borderColor: '#737373' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff!important',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ 
            mt: 4, 
            pt: 3,
            borderTop: '1px solid #3a3a3a',
            textAlign: 'center' 
          }}>
            <Typography variant="body1" sx={{ color: '#b0b0b0', mb: 2 }}>
              Already have an account?
            </Typography>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#6366f1',
                color: '#e0e0e0',
                '&:hover': {
                  borderColor: '#8b5cf6',
                  background: 'rgba(99, 102, 241, 0.1)'
                }
              }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={secondaryTextStyles}>
              Are you a vendor looking to provide equipment?
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/vendor-register')}
              sx={vendorButtonStyles}
            >
              Register as Vendor
            </Button>
          </Box>

          <Snackbar
            open={showSuccess}
            autoHideDuration={2000}
            onClose={() => setShowSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ width: '100%' }}>
              Registration successful! Redirecting to login...
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    </Container>
  );
};

// Styling constants
const alertStyles = {
  mb: 3,
  borderRadius: 2
};

const secondaryTextStyles = {
  color: '#9ca3af',
  mb: 1,
  fontSize: '0.95rem'
};

const inputStyles = {
  '& .MuiInputLabel-root': { 
    color: '#a1a1aa',
    fontSize: '0.95rem'
  },
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    '& fieldset': { 
      borderColor: '#4f4f56',
      borderRadius: '8px'
    },
    '&:hover fieldset': { 
      borderColor: '#6366f1' 
    },
    '&.Mui-focused fieldset': { 
      borderColor: '#8b5cf6',
      boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)'
    }
  }
};

const outlinedButtonStyles = {
  ...inputStyles,
  background: 'transparent',
  borderColor: '#6366f1',
  '&:hover': {
    borderColor: '#8b5cf6',
    background: 'rgba(99, 102, 241, 0.1)'
  }
};

const vendorButtonStyles = {
  ...outlinedButtonStyles,
  mt: 1.5,
  px: 4
};

export default Register;

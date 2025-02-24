import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress, 
  Snackbar,
  Grid,
  Divider,
  Paper
} from '@mui/material';

const VendorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    phoneNumber: '',
    businessAddress: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.businessName || !formData.phoneNumber) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.phoneNumber.match(/^\+?[\d\s-]{10,}$/)) {
      setError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        profile: { name: formData.name },
        role: 'vendor',
        businessDetails: {
          businessName: formData.businessName,
          phoneNumber: formData.phoneNumber,
          businessAddress: formData.businessAddress
        }
      });
      if (res.data.success) navigate('/login');
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
        background: '#2d2d35',
        color: '#e5e7eb',
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Paper sx={{ 
          p: 6,
          background: '#3a3a42',
          border: '1px solid #4f4f56',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h3" sx={{ 
            mb: 4, 
            color: '#ffffff',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            Vendor Registration
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ p: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 4,
                  background: '#34343d',
                  border: '1px solid #4f4f56',
                  borderRadius: '8px',
                  height: '100%'
                }}>
                  <Typography variant="h5" sx={{ 
                    color: '#ffffff', 
                    mb: 3,
                    fontWeight: 600 
                  }}>
                    Personal Information
                  </Typography>
                  <Divider sx={{ 
                    borderColor: '#4f4f56', 
                    mb: 4,
                    mt: 2 
                  }} />
                  
                  <Box sx={{ '& > *:not(:last-child)': { mb: 3 } }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={loading}
                      sx={inputStyles}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={loading}
                      sx={inputStyles}
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      disabled={loading}
                      helperText="Password must be at least 6 characters long"
                      sx={inputStyles}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 4,
                  background: '#34343d',
                  border: '1px solid #4f4f56',
                  borderRadius: '8px',
                  height: '100%'
                }}>
                  <Typography variant="h5" sx={{ 
                    color: '#ffffff', 
                    mb: 3,
                    fontWeight: 600 
                  }}>
                    Business Information
                  </Typography>
                  <Divider sx={{ 
                    borderColor: '#4f4f56', 
                    mb: 4,
                    mt: 2 
                  }} />
                  
                  <Box sx={{ '& > *:not(:last-child)': { mb: 3 } }}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      name="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      disabled={loading}
                      sx={inputStyles}
                    />
                    <TextField
                      fullWidth
                      label="Business Phone"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      disabled={loading}
                      helperText="Enter a valid phone number"
                      sx={inputStyles}
                    />
                    <TextField
                      fullWidth
                      label="Business Address"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                      disabled={loading}
                      multiline
                      rows={2}
                      sx={inputStyles}
                    />
                    <TextField
                      fullWidth
                      label="Business Description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      disabled={loading}
                      multiline
                      rows={3}
                      helperText="Describe your business and the types of equipment you provide"
                      sx={inputStyles}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 6,
                  px: 4,
                  textAlign: 'center'
                }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      maxWidth: 400,
                      mx: 'auto',
                      py: 2,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#ffffff!important',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          <Snackbar
            open={showSuccess}
            autoHideDuration={2000}
            onClose={() => setShowSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ width: '100%' }}>
              Registration successful! Your account is pending approval. You will be redirected to login...
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    </Container>
  );
};

const inputStyles = {
  '& .MuiInputBase-root': {
    color: '#ffffff'
  },
  '& .MuiInputLabel-root': {
    color: '#9ca3af'
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#4b5563'
    },
    '&:hover fieldset': {
      borderColor: '#6366f1'
    }
  }
};

const buttonStyles = {
  mt: 3,
  py: 1.5,
  fontSize: '1.1rem',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: '#ffffff',
  borderRadius: '12px',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
  }
};

export default VendorRegister; 
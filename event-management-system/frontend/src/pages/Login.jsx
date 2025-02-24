import React, { useState } from "react";
import { Container, Typography, TextField, Button, Box, Alert, CircularProgress, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError(""); // Clear error when user types
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (res.data.success) {
        sessionStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        
        // Redirect based on user role
        switch(res.data.user.role) {
          case 'admin':
            navigate('/admin-profile');
            break;
          case 'vendor':
            navigate('/vendor-profile');
            break;
          default: // Regular users
            navigate('/profile');
        }
      } else {
        setError(res.data.message || 'Login failed');
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false); // Ensure loading state is reset
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
      <Container maxWidth="sm">
        <Paper sx={{ 
          p: 6,
          background: '#3a3a42',
          border: '1px solid #4f4f56',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h3" align="center" sx={{ 
            mb: 4,
            color: '#ffffff',
            fontWeight: 600,
            letterSpacing: '-0.025em'
          }}>
            Welcome Back
          </Typography>
          
          {error && <Alert severity="error" sx={{ 
            mb: 4,
            background: '#2f2f38',
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#ef4444' }
          }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ '& > *:not(:last-child)': { mb: 3 } }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                sx={inputStyles}
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                sx={inputStyles}
              />

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff!important',
                  borderRadius: '8px',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Box sx={{ 
            mt: 4,
            textAlign: 'center',
            borderTop: '1px solid #4f4f56',
            pt: 4
          }}>
            <Typography variant="body1" sx={{ 
              color: '#a1a1aa',
              mb: 2
            }}>
              Don't have an account?
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{
                px: 6,
                borderColor: '#6366f1',
                color: '#e5e7eb',
                '&:hover': {
                  borderColor: '#8b5cf6',
                  background: 'rgba(99, 102, 241, 0.1)'
                }
              }}
            >
              Create Account
            </Button>
          </Box>
        </Paper>
      </Container>
    </Container>
  );
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

export default Login;

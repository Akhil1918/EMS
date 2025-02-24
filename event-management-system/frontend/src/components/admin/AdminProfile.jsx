import React, { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Security as AdminIcon
} from '@mui/icons-material';
import { useAuth, api } from '../../context/AuthContext';

const AdminProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await api.get('/admin/stats');
      } catch (err) {
        console.error('Admin data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      background: '#2d2d35',
      color: '#e5e7eb',
      py: 4
    }}>
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        {/* Profile Header */}
        <Card sx={{ 
          mb: 4, 
          background: '#3a3a42',
          border: '1px solid #4f4f56',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ 
                width: 100, 
                height: 100, 
                mr: 3,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontSize: '2.5rem'
              }}>
                {user.profile?.name?.[0] || 'A'}
              </Avatar>
              <Box>
                <Typography variant="h3" gutterBottom sx={{ color: '#ffffff' }}>
                  {user.profile?.name || "Administrator"}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#a1a1aa' }}>
                  {user.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip 
                    label="System Administrator"
                    sx={{ 
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: '#8b5cf6',
                      borderRadius: 2
                    }}
                    icon={<AdminIcon fontSize="small" sx={{ color: '#8b5cf6' }} />}
                  />
                  <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                    Last login: 2 hours ago
                  </Typography>
                </Box>
                {user?.createdAt && (
                  <Typography variant="body2" sx={{ color: '#a1a1aa', mt: 1 }}>
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminProfile; 
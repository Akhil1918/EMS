import React, { useEffect, useState } from 'react';
import { 
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Chip
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  CheckCircle as ApprovedIcon,
  LocalShipping as RentedIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth, api } from '../context/AuthContext';


const VendorProfile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    approvedEquipment: 0,
    rentedEquipment: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [equipmentRes, statsRes] = await Promise.all([
          api.get('/equipment/vendor'),
          api.get('/vendor/dashboard')
        ]);
        
        const equipmentData = equipmentRes.data.data;
        // Add console log to check received data
const dashboardStats = statsRes.data.data.stats;
console.log('Dashboard Stats:', dashboardStats); // Add this

setStats({
  totalEquipment: equipmentData.length,
  approvedEquipment: equipmentData.filter(e => e.status === 'approved').length,
  rentedEquipment: dashboardStats.totalRented || 0
});
      } catch (err) {
        console.error('Error fetching vendor stats:', err);
        // Add error handling here
      } finally {
        setLoading(false);
      }
    };
  
    if (user?.role === 'vendor') {
      fetchStats();
    }
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
      <Typography variant="h4" color="primary">
        {value || 0}  {/* Ensure zero display if undefined */}
      </Typography>
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
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      background: '#34343d',
      color: '#e5e7eb',
      py: 4,
      px: { xs: 2, md: 4 }
    }}>
      {/* Profile Header */}
      <Card sx={{ 
        mb: 4,
        background: '#3a3a42',
        border: '1px solid #4f4f56',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4,
            padding: 3,
            background: '#40404a',
            borderRadius: '8px'
          }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mr: 3,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            }}>
              {user.businessDetails?.businessName?.[0] || 'V'}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                color: '#ffffff',
                fontWeight: 600,
                mb: 1
              }}>
                {user.businessDetails?.businessName || "Vendor Profile"}
              </Typography>
              <Chip 
                label={user.approved ? "Verified Vendor" : "Pending Approval"} 
                sx={{
                  background: user.approved 
                    ? 'rgba(76, 175, 80, 0.15)' 
                    : 'rgba(255, 193, 7, 0.15)',
                  color: user.approved ? '#66bb6a' : '#ffd54f',
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5
                }}
              />
              {user?.createdAt && (
                <Typography variant="body2" sx={{ color: '#a1a1aa', mt: 1 }}>
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              )}
              {user.businessDetails?.businessAddress && (
                <Typography variant="body2" sx={{ color: '#a1a1aa', mt: 1 }}>
                  <BusinessIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {user.businessDetails.businessAddress}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[['Total Equipment', stats.totalEquipment], ['Approved Items', stats.approvedEquipment], ['Rented Items', stats.rentedEquipment]].map(([title, value], index) => (
          <Grid item xs={12} md={4} key={title}>
            <Paper sx={{
              p: 3,
              background: '#3a3a42',
              border: '1px solid #4f4f56',
              borderRadius: '8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
              }
            }}>
              <Typography variant="h6" sx={{ 
                color: '#d8b4fe',
                mb: 1.5,
                fontWeight: 500
              }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ color: '#ffffff' }}>
                {value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Business Details Section */}
      <Card sx={{ 
        mb: 4,
        background: '#3a3a42',
        border: '1px solid #4f4f56'
      }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ 
            color: '#ffffff',
            mb: 2,
            fontWeight: 600
          }}>
            Business Details
          </Typography>
          <Grid container spacing={3}>
            {[['Business Name', user.businessDetails?.businessName], 
              ['Contact Email', user.email], 
              ['Business Address', user.businessDetails?.businessAddress], 
              ['Account Status', user.approved ? 'Verified' : 'Pending Approval']].map(([label, value], index) => (
              <Grid item xs={12} md={6} key={label}>
                <List sx={{
                  background: '#40404a',
                  borderRadius: '8px',
                  border: '1px solid #4f4f56',
                  overflow: 'hidden'
                }}>
                  <ListItem sx={{
                    borderBottom: '1px solid #4f4f56',
                    '&:last-child': { borderBottom: 0 }
                  }}>
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{ 
                        sx: { 
                          color: '#a1a1aa', 
                          fontSize: '0.9rem',
                          fontWeight: 500 
                        }
                      }}
                      secondary={value || 'Not provided'}
                      secondaryTypographyProps={{ 
                        sx: { 
                          color: '#ffffff', 
                          fontSize: '1rem',
                          mt: 0.5
                        }
                      }}
                    />
                  </ListItem>
                </List>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

    </Container>
  );
};

export default VendorProfile; 
import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Box, IconButton, Alert } from '@mui/material';
import { api } from '../../context/AuthContext';
import RefreshIcon from '@mui/icons-material/Refresh';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
        setError('');
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  // Add refresh button
  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton 
        sx={{ position: 'absolute', right: 16, top: -40 }}
        onClick={handleRefresh}
        disabled={loading}
      >
        <RefreshIcon />
      </IconButton>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{stats?.totalUsers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Vendors</Typography>
              <Typography variant="h4">{stats?.approvedVendors || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Events</Typography>
              <Typography variant="h4">{stats?.activeEvents || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Approvals</Typography>
              <Typography variant="h4">{stats?.pendingApprovals || 0}</Typography>
              {stats?.pendingApprovals > 0 && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  ({stats.pendingVendors} vendor applications,<br/>
                  {stats.pendingEquipment} equipment listings)
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {stats?.pendingApprovals > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {stats.pendingApprovals} pending approvals need attention
        </Alert>
      )}
    </Box>
  );
};

export default AdminStats; 
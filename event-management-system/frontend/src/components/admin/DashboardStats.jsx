import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { api } from '../../context/AuthContext';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (!res.data?.data) throw new Error('Invalid stats format');
        setStats(res.data.data);
      } catch (err) {
        setStatsError(err.response?.data?.message || 'Failed to load statistics');
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (statsError) {
    return (
      <Typography color="error" sx={{ p: 2, textAlign: 'center' }}>
        {statsError}
      </Typography>
    );
  }

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
  }

  if (!stats) {
    return (
      <Typography variant="body1" sx={{ textAlign: 'center', p: 4 }}>
        No statistics available
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Total Users</Typography>
            <Typography variant="h4">{stats.totalUsers}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Events</Typography>
            <Typography variant="h4">{stats.activeEvents}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Equipment Listings</Typography>
            <Typography variant="h4">{stats.totalEquipment}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Pending Approvals</Typography>
            <Typography variant="h4">{stats.pendingApprovals}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardStats; 
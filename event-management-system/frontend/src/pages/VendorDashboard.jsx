import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip
} from "@mui/material";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, api } from "../context/AuthContext";
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { Star, TrendingUp, ThumbUp } from '@mui/icons-material';
import EquipmentList from '../components/EquipmentList';

const VendorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/vendor/dashboard');
        setDashboardData({
          equipment: res.data.data.equipment,
          stats: res.data.data.stats
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'vendor') {
      fetchDashboard();
    }
  }, [user]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://ems-backend-xir2.onrender.com/api/equipment/${selectedEquipment._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh equipment list
      fetchEquipment();
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete equipment");
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">No dashboard data available.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vendor Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.profile?.name}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {dashboardData?.equipment?.length > 0 ? (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Star color="primary" />
                <Typography variant="h6">Average Rating</Typography>
              </Box>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {dashboardData.stats.avgRating || 0}/5
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Based on {dashboardData.stats.totalReviews || 0} reviews
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUp color="primary" />
                <Typography variant="h6">Popular Equipment</Typography>
              </Box>
              <List sx={{ mt: 1 }}>
                {dashboardData.stats.popularEquipment?.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={item.name} 
                      secondary={`${item.bookings} bookings`} 
                    />
                    <Chip 
                      label={`★ ${item.rating}`} 
                      color="primary" 
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <ThumbUp color="primary" />
                <Typography variant="h6">Quick Stats</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <StatItem 
                  label="Total Inventory Value" 
                  value={`$${(dashboardData.stats.totalValue || 0).toLocaleString()}`}
                />
                <StatItem 
                  label="Approved Equipment" 
                  value={dashboardData.stats.approvedEquipment || 0}
                />
                <StatItem 
                  label="Pending Approvals" 
                  value={(dashboardData.stats.totalEquipment || 0) - (dashboardData.stats.approvedEquipment || 0)}
                />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <EquipmentList equipment={dashboardData.equipment} />
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No approved equipment found
          </Typography>
          <Button 
            variant="contained" 
            component={Link}
            to="/vendor/equipment"
            sx={{ mt: 2 }}
          >
            Manage Equipment
          </Button>
        </Paper>
      )}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemType="equipment"
      />
    </Container>
  );
};

const StatItem = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
    <Typography variant="body2" color="textSecondary">{label}</Typography>
    <Typography variant="body1" fontWeight="500">{value}</Typography>
  </Box>
);

export default VendorDashboard;

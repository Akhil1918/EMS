import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, Paper, Alert } from '@mui/material';
import { api } from '../../context/AuthContext';

const PendingApprovals = ({ fullPage }) => {
  const [approvals, setApprovals] = useState({ vendors: [], equipment: [] });

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await api.get('/admin/pending-approvals');
        setApprovals(res.data.data);
      } catch (err) {
        console.error('Error fetching approvals:', err);
      }
    };
    fetchApprovals();
  }, []);

  const handleApprove = async (type, id) => {
    try {
      await api.put(`/admin/${type}/${id}/approve`);
      setApprovals(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item._id !== id)
      }));
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Pending Approvals ({approvals.vendors.length + approvals.equipment.length})
      </Typography>
      {approvals.vendors.length === 0 && approvals.equipment.length === 0 && (
        <Alert severity="info">No pending approvals</Alert>
      )}
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Vendors ({approvals.vendors.length})
            </Typography>
            {approvals.vendors.map(vendor => (
              <Box key={vendor._id} sx={{ mb: 2, p: 2, border: '1px solid #eee' }}>
                <Typography>{vendor.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {vendor.email}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleApprove('vendors', vendor._id)}
                  >
                    Approve
                  </Button>
                  <Button variant="outlined" size="small">
                    Reject
                  </Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Equipment ({approvals.equipment.length})
            </Typography>
            {approvals.equipment.map(item => (
              <Box key={item._id} sx={{ mb: 2, p: 2, border: '1px solid #eee' }}>
                <Typography>{item.name}</Typography>
                <Chip label={item.category} size="small" sx={{ mr: 1 }} />
                <Chip label={`$${item.price}`} size="small" />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleApprove('equipment', item._id)}
                  >
                    Approve
                  </Button>
                  <Button variant="outlined" size="small">
                    Request Revision
                  </Button>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
};

export default PendingApprovals; 
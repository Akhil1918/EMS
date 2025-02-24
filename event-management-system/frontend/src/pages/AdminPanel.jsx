import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab, Grid, Paper } from '@mui/material';
import AdminStats from '../components/admin/AdminStats';
import EquipmentManagement from '../components/admin/EquipmentManagement';
import EventManagement from '../components/admin/EventManagement';
import UserManagement from '../components/admin/UserManagement';
import PendingApprovals from '../components/admin/PendingApprovals';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      background: '#34343d',
      color: '#e5e7eb',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper sx={{ 
          background: '#3a3a42',
          border: '1px solid #4f4f56',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          p: 4
        }}>
          <Typography variant="h2" sx={{ 
            color: '#ffffff',
            mb: 4,
            fontWeight: 600,
            textAlign: 'center'
          }}>
            Admin Dashboard
          </Typography>

          <Box sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="User Management" />
              <Tab label="Equipment" />
              <Tab label="Events" />
            </Tabs>
          </Box>

          <Box sx={{ pt: 3 }}>
            {activeTab === 0 && <UserManagement />}
            {activeTab === 1 && <EquipmentManagement />}
            {activeTab === 2 && <EventManagement />}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminPanel; 
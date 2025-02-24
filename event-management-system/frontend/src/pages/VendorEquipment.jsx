import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Box
} from '@mui/material';
import { Edit, Delete, Add, CheckCircleOutline as ApprovedIcon, AccessTime as PendingIcon, CancelOutlined as RejectedIcon, Visibility } from '@mui/icons-material';
import { useAuth, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

const VendorEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get('/equipment/vendor');
        setEquipment(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/equipment/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEquipment(prev => prev.filter(item => item._id !== id));
      setDeleteOpen(false);
      setSelectedEquipment(null);
    } catch (err) {
      console.error('Delete error details:', err.response?.data);
      setError(err.response?.data?.message || "Delete failed");
      setDeleteOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/equipment/${selectedEquipment._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEquipment(prev => prev.filter(e => e._id !== selectedEquipment._id));
      setDeleteOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed. Check permissions.");
    }
  };

  const getStatusChip = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    
    const statusConfig = {
      approved: { 
        color: 'success',
        label: 'Approved - Visible to clients',
        icon: <ApprovedIcon fontSize="small" sx={{ color: 'inherit' }} />
      },
      pending: {
        color: 'warning',
        label: 'Under Review',
        icon: <PendingIcon fontSize="small" sx={{ color: 'inherit' }} />
      },
      'in-review': {
        color: 'warning',
        label: 'Under Review',
        icon: <PendingIcon fontSize="small" sx={{ color: 'inherit' }} />
      },
      rejected: {
        color: 'error',
        label: 'Needs Revision',
        icon: <RejectedIcon fontSize="small" sx={{ color: 'inherit' }} />
      },
      revision: {
        color: 'error',
        label: 'Needs Revision',
        icon: <RejectedIcon fontSize="small" sx={{ color: 'inherit' }} />
      },
      unknown: {
        color: 'default',
        label: 'Status Unknown',
        icon: <PendingIcon fontSize="small" sx={{ color: 'inherit' }} />
      }
    };

    const configKey = Object.keys(statusConfig).find(key => 
      key.toLowerCase() === normalizedStatus
    );

    const config = statusConfig[configKey] ?? statusConfig.unknown;

    return (
      <Chip
        variant="filled"
        label={config.label}
        color={config.color}
        size="medium"
        icon={config.icon}
        sx={{ 
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: 'inherit !important'
          }
        }}
      />
    );
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/equipment/${id}/status`, { status: newStatus });
      refreshEquipment(); // Trigger data refresh
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed');
    }
  };

  const refreshEquipment = () => {
    setEquipment([]); // Clear existing data
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      background: '#2d2d35',
      color: '#e5e7eb',
      py: 4,
      px: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="xl">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          p: 3,
          background: '#3a3a42',
          border: '1px solid #4f4f56',
          borderRadius: '12px'
        }}>
          <Typography variant="h4" sx={{ 
            color: '#ffffff',
            fontWeight: 600 
          }}>
            My Equipment
          </Typography>
          <Button 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
              }
            }}
            onClick={() => navigate('/add-equipment')}
          >
            Add New Equipment
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ 
          background: '#3a3a42',
          border: '1px solid #4f4f56',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="equipment table">
              <TableHead sx={{ background: '#40404a' }}>
                <TableRow>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important', 
                    fontWeight: 600,
                    borderColor: '#4f4f56'
                  }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important', 
                    fontWeight: 600,
                    borderColor: '#4f4f56'
                  }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important', 
                    fontWeight: 600,
                    borderColor: '#4f4f56'
                  }}>
                    Price
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important', 
                    fontWeight: 600,
                    borderColor: '#4f4f56'
                  }} align="right">
                    Quantity
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important', 
                    fontWeight: 600,
                    borderColor: '#4f4f56'
                  }} align="right">
                    Rented
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important', 
                    fontWeight: 600,
                    borderColor: '#4f4f56'
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important', 
                    fontWeight: 600,
                    borderColor: '#4f4f56'
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.map((item) => (
                  <TableRow 
                    key={item._id}
                    sx={{ 
                      '&:hover': { background: '#40404a' },
                      borderBottom: '1px solid #4f4f56'
                    }}
                  >
                    <TableCell sx={{ 
                      color: '#ffffff',
                      borderColor: '#4f4f56'
                    }}>
                      {item.name}
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#ffffff',
                      borderColor: '#4f4f56'
                    }}>
                      {item.category}
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#ffffff',
                      borderColor: '#4f4f56'
                    }}>
                      ${item.price}
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#ffffff',
                      borderColor: '#4f4f56'
                    }} align="right">
                      <Box component="span" sx={{ 
                        display: 'inline-block',
                        minWidth: 40,
                        textAlign: 'center',
                        fontWeight: 500 
                      }}>
                        {item.quantity}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#ffffff',
                      borderColor: '#4f4f56'
                    }} align="right">
                      <Chip 
                        label={item.rentedCount} 
                        color="secondary"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 600,
                          minWidth: 40 
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#ffffff',
                      borderColor: '#4f4f56'
                    }}>
                      {getStatusChip(item.status)}
                      {user?.role === 'admin' && (
                        <Button 
                          size="small" 
                          onClick={() => handleStatusUpdate(item._id, 'approved')}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#ffffff',
                      borderColor: '#4f4f56'
                    }}>
                      <IconButton 
                        color="primary" 
                        onClick={() => navigate(`/equipment/${item._id}`)}
                        sx={{ mr: 1 }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => {
                          setSelectedEquipment(item);
                          setDeleteOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {equipment.length === 0 && !loading && (
          <Alert severity="info" sx={{ mt: 3 }}>
            No equipment found. Start by adding your first item.
          </Alert>
        )}

        <DeleteConfirmationDialog
          open={deleteOpen}
          onClose={() => {
            setDeleteOpen(false);
            setSelectedEquipment(null);
          }}
          onConfirm={() => handleDelete(selectedEquipment?._id)}
          itemName={selectedEquipment?.name}
        />
      </Container>
    </Box>
  );
};

export default VendorEquipment; 
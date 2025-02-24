import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Select, MenuItem, IconButton, CircularProgress, Box, Container, Typography, TableContainer, Pagination } from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { useAuth, api } from '../../context/AuthContext';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import { useNavigate } from 'react-router-dom';

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ 
    page: 0, 
    rowsPerPage: 10 
  });

  const totalPages = Math.ceil(equipment.length / pagination.rowsPerPage);
  const currentPage = pagination.page;

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get('/admin/equipment');
        if (res.data.success) {
          setEquipment(res.data.data);
        } else {
          setError('Failed to load equipment');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading equipment');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, []);

  const handleStatusChange = async (equipmentId, newStatus) => {
    try {
      await api.put(`/admin/equipment/${equipmentId}/status`, { status: newStatus });
      setEquipment(prev => prev.map(eq => 
        eq._id === equipmentId ? {...eq, status: newStatus} : eq
      ));
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/equipment/${id}`);
      setEquipment(prev => prev.filter(item => item._id !== id));
      setDeleteOpen(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
  }

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      background: '#2d2d35',
      color: '#e5e7eb',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper sx={{ 
          background: '#3a3a42',
          border: '1px solid #4f4f56',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            p: 3,
            borderBottom: '1px solid #4f4f56',
            background: 'rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h4" sx={{ color: '#ffffff' }}>
              Equipment Management
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#40404a' }}>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Equipment Name
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Price
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {equipment
                  .slice(pagination.page * pagination.rowsPerPage, 
                        (pagination.page + 1) * pagination.rowsPerPage)
                  .map((item) => (
                    <TableRow 
                      key={item._id}
                      hover
                      sx={{ 
                        '&:last-child td': { borderBottom: 0 },
                        borderColor: '#4f4f56',
                        transition: 'background 0.2s',
                        '&:hover': {
                          background: '#40404a'
                        }
                      }}
                    >
                      <TableCell sx={{ color: '#ffffff', borderColor: '#4f4f56' }}>
                        {item.name}
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        {item.category}
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        ${item.price}
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        <Select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          size="small"
                        >
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            color="error" 
                            onClick={() => {
                              setSelectedEquipment(item);
                              setDeleteOpen(true);
                            }}
                          >
                            <Delete />
                          </IconButton>
                          <IconButton onClick={() => navigate(`/equipment/${item._id}`)}>
                            <Visibility />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ 
            p: 2,
            borderTop: '1px solid #4f4f56',
            background: '#40404a'
          }}>
            <Pagination 
              count={totalPages}
              page={currentPage}
              onChange={(e, page) => setPagination(prev => ({...prev, page}))}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#a1a1aa'
                },
                '& .Mui-selected': {
                  background: '#8b5cf6!important',
                  color: '#ffffff!important'
                }
              }}
            />
          </Box>
        </Paper>
      </Container>

      <DeleteConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => handleDelete(selectedEquipment?._id)}
        itemName={selectedEquipment?.name}
      />
    </Box>
  );
};

export default EquipmentManagement; 
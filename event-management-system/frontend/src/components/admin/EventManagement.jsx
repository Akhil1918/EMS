import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, CircularProgress, Alert, Box, Container, Typography, TableContainer, Pagination } from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { useAuth, api } from '../../context/AuthContext';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import { useNavigate } from 'react-router-dom';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ 
    page: 0, 
    rowsPerPage: 10 
  });
  const totalPages = Math.ceil(events.length / pagination.rowsPerPage);
  const currentPage = pagination.page;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/admin/events');
        if (res.data.success) {
          setEvents(res.data.data);
          setError('');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents(prev => prev.filter(event => event._id !== id));
      setDeleteOpen(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;

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
              Event Management
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
                    Event Name
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Location
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Organizer
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
                {events
                  .slice(pagination.page * pagination.rowsPerPage, 
                        (pagination.page + 1) * pagination.rowsPerPage)
                  .map((event) => (
                    <TableRow 
                      key={event._id}
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
                        {event.name}
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        {new Date(event.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        {event.location}
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        {event.createdBy ? (
                          <Box>
                            <div>{event.createdBy.profile?.name || 'Unnamed User'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
                              {event.createdBy.email}
                            </div>
                          </Box>
                        ) : 'System-generated'}
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        <Box sx={{ 
                          color: event.status === 'active' ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}>
                          {event.status?.toUpperCase() || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        <IconButton onClick={() => navigate(`/events/${event._id}`)}>
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          color="error"
                          onClick={() => {
                            setSelectedEvent(event);
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
        onConfirm={() => handleDelete(selectedEvent?._id)}
        itemName={selectedEvent?.name}
      />
    </Box>
  );
};

export default EventManagement; 
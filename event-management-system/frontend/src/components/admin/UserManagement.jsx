import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Select, MenuItem, IconButton, Box, TextField, Pagination, Button, Switch, Tooltip, Typography, Container, TableContainer } from '@mui/material';
import { Lock, LockOpen, CheckCircle, Warning } from '@mui/icons-material';
import { useAuth, api } from '../../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState(() => []);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10 });
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.data);
        setPagination(prev => ({...prev, page: 0}));
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredUsers.length / pagination.rowsPerPage) - 1);
    const newPage = Math.min(pagination.page, maxPage);
    
    if (newPage !== pagination.page) {
      setPagination(prev => ({...prev, page: newPage}));
    }
  }, [filteredUsers, pagination.rowsPerPage, pagination.page]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId ? { ...response.data.data } : u
        )
      );
      
      // Success notification
      alert(`Successfully changed role to ${newRole}`);
    } catch (err) {
      console.error('Role update failed:', err);
      // Error notification
      alert(`Role change failed: ${err.response?.data?.message || err.message}`);
      
      // Revert UI state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId ? { ...u, role: u.role } : u
        )
      );
    }
  };

  const handleSuspend = async (userId) => {
    try {
      const currentUser = users.find(u => u._id === userId);
      const newSuspendedStatus = !currentUser.suspended;

      // Optimistic update
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId ? { ...u, suspended: newSuspendedStatus } : u
        )
      );
      
      const res = await api.put(`/admin/users/${userId}/suspend`, { 
        suspended: newSuspendedStatus 
      });
      
      // Verify response matches actual data
      if (!res.data.success || res.data.data.suspended !== newSuspendedStatus) {
        throw new Error('Suspension failed on server');
      }
      
    } catch (err) {
      console.error('Suspension failed:', err);
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId ? { ...u, suspended: !newSuspendedStatus } : u
        )
      );
    }
  };

  const handleApprovalToggle = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/approval`, {
        approved: newStatus
      });
      setUsers(prev => prev.map(user => 
        user._id === userId ? {...user, approved: newStatus} : user
      ));
    } catch (err) {
      console.error('Approval status update failed:', err);
    }
  };

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
              User Management
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
                    Name
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Approved
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#8b5cf6!important',
                    borderColor: '#4f4f56',
                    fontWeight: 500
                  }}>
                    Suspension Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(pagination.page * pagination.rowsPerPage, 
                        (pagination.page + 1) * pagination.rowsPerPage)
                  .map((user) => (
                    <TableRow 
                      key={user._id}
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
                        {user.profile.name}
                      </TableCell>
                      <TableCell sx={{ color: '#a1a1aa', borderColor: '#4f4f56' }}>
                        {user.email}
                      </TableCell>
                      <TableCell sx={{ color: '#ffffff', borderColor: '#4f4f56' }}>
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          size="small"
                        >
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="vendor">Vendor</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell sx={{ color: '#ffffff', borderColor: '#4f4f56' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={user.approved ?? false}
                            onChange={(e) => handleApprovalToggle(user._id, e.target.checked)}
                            color="primary"
                          />
                          {user.approved ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Warning color="warning" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#ffffff', borderColor: '#4f4f56' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title={user.suspended ? "Activate user" : "Suspend user"}>
                            <Switch
                              checked={user.suspended ?? false}
                              onChange={() => handleSuspend(user._id)}
                              color="primary"
                            />
                          </Tooltip>
                          {user.suspended ? (
                            <Lock color="error" />
                          ) : (
                            <LockOpen color="success" />
                          )}
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
              count={Math.ceil(filteredUsers.length / pagination.rowsPerPage)}
              page={pagination.page}
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
    </Box>
  );
};

export default UserManagement; 
import React, { useEffect, useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, Avatar, Chip, Typography, Box, Tooltip, 
  LinearProgress, IconButton 
} from '@mui/material';
import { api } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
  History,
  Person,
  SystemUpdateAlt
} from '@mui/icons-material';

const ActionHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data.data);
        setError('');
      } catch (err) {
        setError('Failed to load action history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionIcon = (actionType) => {
    switch (actionType.toLowerCase()) {
      case 'create': return <CheckCircleOutline color="success" />;
      case 'delete': return <ErrorOutline color="error" />;
      default: return <InfoOutlined color="info" />;
    }
  };

  const formatDetails = (previousState, newState) => {
    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography variant="caption" color="error.main">
            Previous State
          </Typography>
          <pre style={{ margin: 0, fontSize: '0.75rem' }}>
            {JSON.stringify(previousState, null, 2)}
          </pre>
        </Box>
        <Box sx={{ flex: 1, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
          <Typography variant="caption" color="success.main">
            New State
          </Typography>
          <pre style={{ margin: 0, fontSize: '0.75rem' }}>
            {JSON.stringify(newState, null, 2)}
          </pre>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, mt: 4, overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <History sx={{ mr: 1.5, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Admin Action History
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Box sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: 'error.light', 
          borderRadius: 1 
        }}>
          <ErrorOutline sx={{ mr: 1, color: 'error.main' }} />
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell sx={{ width: 150 }}>Action Type</TableCell>
            <TableCell sx={{ width: 180 }}>Timestamp</TableCell>
            <TableCell>Details</TableCell>
            <TableCell sx={{ width: 200 }}>Performed By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id} hover>
              <TableCell>
                <Chip
                  label={log.action}
                  icon={getActionIcon(log.action)}
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover'
                  }}
                />
              </TableCell>
              <TableCell>
                <Tooltip title={new Date(log.createdAt).toLocaleString()}>
                  <Typography variant="body2">
                    {formatDistanceToNow(new Date(log.createdAt))} ago
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Box sx={{ 
                  p: 1.5,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  {formatDetails(log.previousState, log.newState)}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {log.admin ? (
                    <>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1.5,
                        bgcolor: 'primary.main',
                        fontSize: 14 
                      }}>
                        {log.admin.email[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {log.admin.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.admin.role}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <SystemUpdateAlt sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">System Action</Typography>
                    </>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!loading && logs.length === 0 && (
        <Box sx={{ 
          p: 3, 
          textAlign: 'center', 
          color: 'text.secondary' 
        }}>
          <Person sx={{ fontSize: 48, mb: 1, opacity: 0.6 }} />
          <Typography variant="body1">
            No action history recorded yet
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ActionHistory; 
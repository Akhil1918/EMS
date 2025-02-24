import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  ConfirmationNumber as TicketIcon,
  Alarm as ReminderIcon,
  Info as SystemIcon,
  Check as CheckIcon,
  Inventory as InventoryIcon,
  Verified as VerifiedIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
      setError('Failed to fetch notifications');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      if (res.data.success) {
        setUnreadCount(res.data.data.count);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setUser(null);
        sessionStorage.removeItem("token");
      }
      console.error("Unread count error:", err);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchNotifications();
        fetchUnreadCount();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setUnreadCount(0);
      await fetchNotifications();
    } catch (err) {
      setError('Failed to mark notifications as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        const token = sessionStorage.getItem('token');
        await axios.put(
          `http://localhost:5000/api/notifications/${notification._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate based on notification type
      if (notification.relatedEvent) {
        navigate(`/events/${notification.relatedEvent._id}`);
      } else if (notification.relatedRegistration) {
        navigate(`/my-registrations`);
      }
      handleClose();
    } catch (err) {
      setError('Failed to process notification');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      equipment: <InventoryIcon />,
      approval: <VerifiedIcon />,
      payment: <PaymentIcon />,
      registration: <TicketIcon />,
      event: <EventIcon />,
      reminder: <ReminderIcon />,
      system: <SystemIcon />,
      default: <NotificationsIcon />
    };
    return icons[type] || icons.default;
  };

  const filterNotifications = (notifications) => {
    if (user?.role === 'vendor') {
      return notifications.filter(n => 
        n.type === 'equipment' || n.type === 'approval' || n.type === 'payment' || n.type === 'event'
      );
    }
    if (user?.role === 'admin') {
      return notifications; // Show all notifications for admins
    }
    return notifications.filter(n => 
      n.type === 'event' || n.type === 'registration' || n.type === 'reminder'
    );
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: '80vh',
            width: '350px'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<CheckIcon />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        
        {error && (
          <Alert severity="error" sx={{ m: 1 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : filterNotifications(notifications).length > 0 ? (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {filterNotifications(notifications).map((notification) => (
              <ListItem
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography variant="body2" component="span" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <br />
                      {notification.relatedEvent && (
                        <Typography variant="caption" color="text.secondary">
                          Event: {notification.relatedEvent.name}
                        </Typography>
                      )}
                      {notification.relatedRegistration && (
                        <Typography variant="caption" color="text.secondary">
                          Status: {notification.relatedRegistration.status}
                        </Typography>
                      )}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    </>
                  }
                  sx={{
                    color: notification.read ? 'text.secondary' : 'primary.main'
                  }}
                />
                {!notification.read && (
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    bgcolor: 'primary.main', 
                    borderRadius: '50%',
                    ml: 1 
                  }} />
                )}
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">No notifications</Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default Notifications;

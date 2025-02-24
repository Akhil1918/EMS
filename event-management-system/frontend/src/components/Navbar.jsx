import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  Badge,
  ListItemIcon
} from '@mui/material';
import {
  AccountCircle,
  Menu as MenuIcon,
  Event as EventIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Person as ProfileIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import Notifications from './Notifications';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        if (err.response?.status === 401) {
          logout();
        }
      }
    };

    if (user) {
      fetchNotifications();
      intervalRef.current = setInterval(fetchNotifications, 30000);
    }

    return () => clearInterval(intervalRef.current);
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    if (user?.role === 'admin') {
      navigate('/admin-profile');
    } else if (user?.role === 'vendor') {
      navigate('/vendor-profile');
    } else {
      navigate('/profile');
    }
    handleClose();
  };

  const handleMyEvents = () => {
    navigate('/my-events');
    handleClose();
  };

  const handleMyRegistrations = () => {
    navigate('/my-registrations');
    handleClose();
  };

  const handleDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'vendor') {
      navigate('/vendor-dashboard');
    }
    handleClose();
  };

  const handleNotificationsOpen = () => {
    setNotificationsOpen(true);
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(145deg, #16161a, #1a1a1f)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ 
            mr: 2, 
            display: { sm: 'none' },
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)'
            }
          }}
          onClick={handleMobileMenu}
        >
          <MenuIcon sx={{ color: '#9ca3af' }} />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            color: '#ffffff',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            '&:hover': {
              opacity: 0.9
            }
          }}
          onClick={() => navigate('/')}
        >
          Event Management
        </Typography>

        <Box sx={{ 
          display: { xs: 'none', sm: 'flex' }, 
          alignItems: 'center', 
          gap: 1,
          '.MuiButton-root': {
            color: '#9ca3af',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#ffffff',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
            }
          }
        }}>
          {user ? (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', ml: 2 }}>
                {user.role === 'vendor' ? (
                  <>
                    <Button
                      component={Link}
                      to="/add-equipment"
                      sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                      Add Equipment
                    </Button>
                    <Button
                      component={Link}
                      to="/vendor-equipment"
                      sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                      My Equipment
                    </Button>
                  </>
                ) : user.role !== 'admin' && (
                  <>
                    <Button
                      component={Link}
                      to="/events"
                      sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                      Browse Events
                    </Button>
                    <Button
                      component={Link}
                      to="/my-events"
                      sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                      My Events
                    </Button>
                    <Button
                      component={Link}
                      to="/my-registrations"
                      sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                      My Registrations
                    </Button>
                  </>
                )}
              </Box>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {user.role === 'admin' && (
                  <Button
                    component={Link}
                    to="/admin-dashboard"
                    sx={{ color: 'white', display: 'block' }}
                  >
                    Admin Panel
                  </Button>
                )}
                {user?.role === 'user' && (
                  <>
                    <IconButton 
                      color="inherit" 
                      onClick={handleNotificationsOpen}
                      sx={{
                        mr: 2,
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                      ref={anchorEl}
                    >
                      <Badge 
                        badgeContent={unreadCount} 
                        sx={{
                          '.MuiBadge-badge': {
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            fontWeight: 600,
                            color: 'white'
                          }
                        }}
                      >
                        
                      </Badge>
                    </IconButton>
                    
                    <Notifications 
                      open={notificationsOpen} 
                      onClose={() => setNotificationsOpen(false)}
                      notifications={notifications}
                      anchorEl={anchorEl}
                    />
                  </>
                )}
                <IconButton
                  size="large"
                  edge="end"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{ 
                    p: 1,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <Avatar sx={{ 
                    width: 36, 
                    height: 36, 
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white'
                  }}>
                    {user.profile?.name?.[0] || 'U'}
                  </Avatar>
                </IconButton>
              </div>
            </>
          ) : (
            <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
              <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
            </Box>
          )}

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                background: 'linear-gradient(145deg, #16161a, #1a1a1f)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                '& .MuiMenuItem-root': {
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
                  }
                }
              }
            }}
          >
            <MenuItem 
              onClick={handleProfile}
              sx={{
                color: '#9ca3af',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff'
                }
              }}
            >
              <ListItemIcon>
                <ProfileIcon fontSize="small" sx={{ color: '#9ca3af' }} />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: '#9ca3af',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff'
                }
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#9ca3af' }} />
              </ListItemIcon>
              Log Out
            </MenuItem>
          </Menu>
        </Box>

        <MobileMenu 
          user={user} 
          handleLogout={handleLogout} 
          handleProfile={handleProfile}
          isVendor={user?.role === 'vendor'}
        />
      </Toolbar>
    </AppBar>
  );
};

const MobileMenu = ({ user, handleLogout, handleProfile, isVendor }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, flexDirection: 'column' }}>
      <IconButton
        size="large"
        aria-label="menu"
        color="inherit"
        onClick={handleClick}
      >
        <MenuIcon />
      </IconButton>
      {user && (
        <>
          {user.role !== 'admin' && (
            <>
              <MenuItem component={Link} to="/events" onClick={handleClose}>
                Browse Events
              </MenuItem>
              <MenuItem component={Link} to="/my-events" onClick={handleClose}>
                My Events
              </MenuItem>
              <MenuItem component={Link} to="/my-registrations" onClick={handleClose}>
                My Registrations
              </MenuItem>
            </>
          )}
          <MenuItem onClick={() => { 
            if (user?.role === 'admin') {
              navigate('/admin-profile');
            } else {
              handleProfile();
            }
            handleClose(); 
          }}>
            <ListItemIcon>
              <ProfileIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => { handleLogout(); handleClose(); }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Log Out
          </MenuItem>
        </>
      )}
    </Box>
  );
};

export default Navbar;

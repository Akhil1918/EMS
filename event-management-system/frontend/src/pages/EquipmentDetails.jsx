import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Button,
  TextField,
  Rating,
  Divider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchEquipment = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`https://ems-backend-xir2.onrender.com/api/equipment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch equipment details');
    }
  };

  const fetchReviews = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`https://ems-backend-xir2.onrender.com/api/equipment/${id}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const validatedReviews = response.data.data.reviews.map(review => ({
        ...review,
        user: review.user || { profile: { name: 'Deleted User' } },
        createdAt: review.createdAt ? new Date(review.createdAt) : new Date()
      }));
      
      setReviews(validatedReviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchEquipment();
      await fetchReviews();
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (newReview.rating === 0) {
      setReviewError('Please select a rating');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await axios.post(
        `https://ems-backend-xir2.onrender.com/api/equipment/${id}/reviews`,
        newReview,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setReviewSuccess('Review submitted successfully!');
      setNewReview({ rating: 0, comment: '' });
      await fetchReviews();
      await fetchEquipment();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.patch(
        `https://ems-backend-xir2.onrender.com/api/equipment/${id}/availability`,
        { availability: !equipment.availability },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability');
    }
  };

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!equipment) return <Container sx={{ mt: 4 }}><Alert severity="error">Equipment not found</Alert></Container>;

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      background: '#2d2d35',
      color: '#e5e7eb',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '2px solid #4f4f56',
          pb: 3
        }}>
          <Typography variant="h4" sx={{ 
            color: '#ffffff',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #8b5cf6, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Equipment Details
          </Typography>
          {(user && (user.role === 'admin' || user.role === 'vendor')) && (
            <Box>
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
                onClick={() => navigate(`/equipment/${id}/edit`)}
              >
                Edit Equipment
              </Button>
            </Box>
          )}
        </Box>

        <Paper sx={{
          p: 4,
          background: '#3a3a42',
          border: '1px solid #4f4f56',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{
                border: '2px solid #4f4f56',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ 
                color: '#ffffff',
                mb: 2,
                fontWeight: 500
              }}>
                {equipment.name}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#a1a1aa',
                mb: 3
              }}>
                {equipment.description}
              </Typography>

              <Box sx={{ 
                background: '#40404a',
                borderRadius: '8px',
                p: 3,
                border: '1px solid #4f4f56'
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#8b5cf6' }}>
                      Price:
                    </Typography>
                    <Typography sx={{ color: '#ffffff' }}>
                      ${equipment.price}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#8b5cf6' }}>
                      Quantity:
                    </Typography>
                    <Typography sx={{ color: '#ffffff' }}>
                      {equipment.quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#8b5cf6' }}>
                      Category:
                    </Typography>
                    <Typography sx={{ color: '#ffffff' }}>
                      {equipment.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#8b5cf6' }}>
                      Condition:
                    </Typography>
                    <Typography sx={{ color: '#ffffff' }}>
                      {equipment.condition}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#8b5cf6' }}>
                      Status:
                    </Typography>
                    <Chip
                      label={equipment.status}
                      sx={{
                        background: equipment.status === 'approved' 
                          ? 'rgba(76, 175, 80, 0.15)'
                          : equipment.status === 'pending'
                          ? 'rgba(255, 193, 7, 0.15)'
                          : 'rgba(244, 67, 54, 0.15)',
                        color: equipment.status === 'approved' 
                          ? '#66bb6a' 
                          : equipment.status === 'pending'
                          ? '#ffd54f'
                          : '#ef5350',
                        fontWeight: 500
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={equipment.availability}
                    onChange={handleAvailabilityToggle}
                    sx={{
                      '& .MuiSwitch-thumb': {
                        backgroundColor: '#8b5cf6'
                      },
                      '& .Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8b5cf6!important'
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: '#ffffff' }}>
                    {equipment.availability ? "Available" : "Unavailable"}
                  </Typography>
                }
                sx={{ mt: 3 }}
              />
            </Grid>

            {user?.role === 'user' && (
              <Grid item xs={12} md={4}>
                <Paper sx={{ 
                  p: 3,
                  background: '#3a3a42',
                  border: '1px solid #4f4f56',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                    Add Review
                  </Typography>
                  {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
                  {reviewSuccess && <Alert severity="success" sx={{ mb: 2 }}>{reviewSuccess}</Alert>}
                  <form onSubmit={handleReviewSubmit}>
                    <Box sx={{ mb: 2 }}>
                      <Typography component="legend" sx={{ color: '#a1a1aa' }}>
                        Rating
                      </Typography>
                      <Rating
                        name="rating"
                        value={newReview.rating}
                        onChange={(event, newValue) => {
                          setNewReview({ ...newReview, rating: newValue });
                        }}
                        sx={{
                          '& .MuiRating-icon': {
                            color: '#8b5cf6'
                          }
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Comment"
                      multiline
                      rows={4}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      sx={{ 
                        mb: 2,
                        '& .MuiInputLabel-root': { color: '#a1a1aa' },
                        '& .MuiOutlinedInput-root': {
                          color: '#ffffff',
                          '& fieldset': { borderColor: '#4f4f56' }
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#ffffff',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                        }
                      }}
                    >
                      Submit Review
                    </Button>
                  </form>
                </Paper>
              </Grid>
            )}

            {/* Reviews Section */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3,
                background: '#3a3a42',
                border: '1px solid #4f4f56',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                  Reviews
                </Typography>
                <Divider sx={{ borderColor: '#4f4f56', mb: 2 }} />
                <List>
                  {reviews.map(review => (
                    <ListItem 
                      key={review._id}
                      sx={{
                        background: '#40404a',
                        borderRadius: '8px',
                        mb: 1,
                        border: '1px solid #4f4f56'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#8b5cf6' }}>
                          {review.user?.profile?.name?.[0] || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography sx={{ color: '#ffffff' }}>
                            {review.user?.profile?.name || 'Anonymous User'}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Rating 
                              value={review.rating} 
                              readOnly 
                              sx={{ 
                                mt: 0.5,
                                '& .MuiRating-icon': {
                                  color: '#8b5cf6'
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ color: '#a1a1aa', mt: 1 }}>
                              {review.comment}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 1 }}>
                              {review.createdAt ? format(new Date(review.createdAt), 'MMM dd, yyyy') : 'Date unavailable'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                  {reviews.length === 0 && (
                    <Typography variant="body2" sx={{ color: '#a1a1aa', textAlign: 'center' }}>
                      No reviews yet
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default EquipmentDetails; 

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  MenuItem,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditEquipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: '',
    category: '',
    condition: '',
    availability: true
  });

  const categories = ["Audio", "Lighting", "Stage", "Video", "Other"];
  const conditions = ["New", "Like New", "Good", "Fair"];

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/equipment/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const equipment = response.data.data;
        setFormData({
          name: equipment.name,
          description: equipment.description,
          price: equipment.price,
          quantity: equipment.quantity,
          imageUrl: equipment.imageUrl,
          category: equipment.category,
          condition: equipment.condition,
          availability: equipment.availability
        });
        setImagePreview(equipment.imageUrl);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch equipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/equipment/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Equipment updated successfully!');
      setTimeout(() => {
        navigate(`/equipment/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value
    }));
  };

  if (loading) return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <CircularProgress />
    </Container>
  );

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Edit Equipment
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Category"
                name="category"
                fullWidth
                required
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                fullWidth
                required
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Details</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Price"
                name="price"
                type="number"
                fullWidth
                required
                value={formData.price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: "$"
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                fullWidth
                required
                value={formData.quantity}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Condition"
                name="condition"
                fullWidth
                required
                value={formData.condition}
                onChange={handleChange}
              >
                {conditions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Equipment Image</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <input
                accept="image/*"
                type="file"
                id="image-upload"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                >
                  Change Equipment Image
                </Button>
              </label>
              {imagePreview && (
                <Box mt={2} display="flex" justifyContent="center">
                  <img
                    src={imagePreview}
                    alt="Equipment preview"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Equipment'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/equipment/${id}`)}
                  fullWidth
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditEquipment; 
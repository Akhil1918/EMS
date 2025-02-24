import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
  Grid,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AddEquipment = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    imageUrl: "",
    category: "",
    condition: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = ["Audio", "Lighting", "Stage", "Video", "Other"];
  const conditions = ["New", "Like New", "Good", "Fair"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.price || 
        !formData.quantity || !formData.imageUrl || !formData.category || 
        !formData.condition) {
      setError("Please fill out all required fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/equipment/add",
        {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          imageUrl: formData.imageUrl,
          category: formData.category,
          condition: formData.condition
        },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        }
      );

      setSuccess("Equipment added successfully! Pending admin approval.");
      setTimeout(() => {
        navigate("/vendor-dashboard");
      }, 1500);
    } catch (err) {
      console.error('Error adding equipment:', err.response?.data || err);
      setError(err.response?.data?.message || "Failed to add equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'quantity' ? 
        Number(value) : value
    });
    setError("");
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      background: '#2d2d35',
      color: '#e5e7eb',
      py: 4
    }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ 
          mb: 4, 
          color: '#ffffff',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Add New Equipment
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Paper sx={{ 
          p: 4,
          background: '#3a3a42',
          border: '1px solid #4f4f56',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Equipment Name"
                  name="name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={handleChange}
                  sx={{
                    mb: 3,
                    '& .MuiInputLabel-root': { color: '#a1a1aa' },
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#4f4f56' },
                      '&:hover fieldset': { borderColor: '#8b5cf6' }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ 
                  mb: 3,
                  '& .MuiInputLabel-root': { color: '#a1a1aa' },
                  '& .MuiSelect-select': { color: '#ffffff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4f4f56' }
                }}>
                  <InputLabel>Equipment Type</InputLabel>
                  <Select
                    label="Equipment Type"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    sx={{ color: '#ffffff' }}
                  >
                    {categories.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                  sx={{
                    mb: 3,
                    '& .MuiInputLabel-root': { color: '#a1a1aa' },
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#4f4f56' },
                      '&:hover fieldset': { borderColor: '#8b5cf6' }
                    }
                  }}
                />
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
                    startAdornment: "$",
                    sx: {
                      '& .MuiInputLabel-root': { color: '#a1a1aa' },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        '& fieldset': { borderColor: '#4f4f56' },
                        '&:hover fieldset': { borderColor: '#8b5cf6' }
                      }
                    }
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
                  sx={{
                    '& .MuiInputLabel-root': { color: '#a1a1aa' },
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#4f4f56' },
                      '&:hover fieldset': { borderColor: '#8b5cf6' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth sx={{ 
                  '& .MuiInputLabel-root': { color: '#a1a1aa' },
                  '& .MuiSelect-select': { color: '#ffffff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4f4f56' }
                }}>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    label="Condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    sx={{ color: '#ffffff' }}
                  >
                    {conditions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  mb: 3,
                  border: '2px dashed #4f4f56',
                  borderRadius: '8px',
                  p: 3,
                  textAlign: 'center',
                  transition: 'border-color 0.3s',
                  '&:hover': { borderColor: '#8b5cf6' }
                }}>
                  <InputLabel sx={{ color: '#a1a1aa', mb: 1 }}>Equipment Images</InputLabel>
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
                      Upload Equipment Image
                    </Button>
                  </label>
                </Box>
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
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Add Equipment"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddEquipment;

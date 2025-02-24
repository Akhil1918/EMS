import React, { useState, useEffect } from "react";
import { AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Paper,
  CircularProgress
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon
} from '@mui/icons-material';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CreateEvent = () => {
  const { user } = useAuth();

  // Event Details State
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    date: null,
    location: "",
    capacity: 100,
    timeFrame: {
      startTime: "",
      endTime: ""
    },
    image: null, // Changed to null for base64
  });

  // Image upload handler
const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setEventData({ ...eventData, image: reader.result });
    };
    reader.readAsDataURL(file);
  }
};

  // Equipment Selection State
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [equipmentDialog, setEquipmentDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Form Control State
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Add this useEffect hook to fetch equipment
  const [equipmentOptions, setEquipmentOptions] = useState([]);

  // Add these state variables
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoadingEquipment(true);
        const response = await axios.get('https://ems-backend-xir2.onrender.com/api/equipment/available');
        console.log('API Response:', response); // Add this
        
        const equipmentData = response.data?.data || [];
        console.log('Raw equipment data:', equipmentData); // Add this
        
        const validEquipment = equipmentData.filter(item => 
          item.status === 'approved' &&
          item.subInventory?.status === 'active' &&
          item.vendor?.approved === true
        );
        
        console.log('Valid equipment:', validEquipment); // Add this
        
        const formattedEquipment = validEquipment.map(item => ({
          ...item,
          vendorName: item.vendor?.profile?.name || 
                    item.vendor?.businessDetails?.businessName || 
                    'Verified Vendor'
        }));
        
        setEquipmentOptions(formattedEquipment);
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching equipment:', err);
        setFetchError('Failed to load equipment. Please try again.');
        setEquipmentOptions([]);
      } finally {
        setLoadingEquipment(false);
      }
    };
    fetchEquipment();
  }, []);

  const handleNext = () => {
    if (activeStep === 0 && !validateEventDetails()) {
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleDateChange = (date) => {
    setEventData({
      ...eventData,
      date: date
    });
  };

  const handleTimeChange = (time, field) => {
    if (time) {
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setEventData({
        ...eventData,
        timeFrame: {
          ...eventData.timeFrame,
          [field]: timeString
        }
      });
    }
  };

  const validateEventDetails = () => {
    if (!eventData.name || !eventData.description || !eventData.date || 
        !eventData.location || !eventData.timeFrame.startTime || 
        !eventData.timeFrame.endTime || !eventData.capacity) {
      setError("Please fill in all required fields");
      return false;
    }
  
    if (eventData.capacity < 1) {
      setError("Capacity must be at least 1");
      return false;
    }
    
    // Validate that end time is after start time
    const [startHour, startMinute] = eventData.timeFrame.startTime.split(':').map(Number);
    const [endHour, endMinute] = eventData.timeFrame.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      setError("End time must be after start time");
      return false;
    }
    
    setError("");
    return true;
  };

  const handleEventDataChange = (e) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value
    });
  };

  const handleEquipmentSelect = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setEquipmentDialog(true);
  };

  const handleAddEquipment = () => {
    const existingItem = selectedEquipment.find(item => item.equipmentId === selectedItem._id);
    
    if (existingItem) {
      setSelectedEquipment(selectedEquipment.map(item =>
        item.equipmentId === selectedItem._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setSelectedEquipment([
        ...selectedEquipment,
        {
          equipmentId: selectedItem._id,
          name: selectedItem.name,
          quantity: quantity,
          price: selectedItem.price
        }
      ]);
    }
    setEquipmentDialog(false);
  };

  const handleRemoveEquipment = (equipmentId) => {
    setSelectedEquipment(selectedEquipment.filter(item => item.equipmentId !== equipmentId));
  };

  const handleSubmit = async () => {
    try {
      if (!user || !user._id) {
        setError("User session expired. Please login again.");
        return;
      }

      const eventPayload = {
        ...eventData,
        equipment: selectedEquipment.map(item => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity
        })),
        createdBy: user._id
      };

      if (eventPayload.equipment.length === 0) {
        setError("Please select at least one equipment item");
        return;
      }

      const response = await axios.post('https://ems-backend-xir2.onrender.com/api/events', eventPayload, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSuccess('Event created successfully!');
        navigate('/events');
      }
    } catch (err) {
      console.error('Event creation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create event');
    }
  };

  const calculateTotalCost = () => {
    return selectedEquipment.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  };

  const renderEventDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Event Details</Typography>
      <TextField
        label="Event Name"
        name="name"
        variant="outlined"
        fullWidth
        margin="normal"
        required
        value={eventData.name}
        onChange={handleEventDataChange}
        sx={{ 
          '& .MuiInputBase-root': {
            color: '#ffffff',
            '& fieldset': { borderColor: '#4b5563' },
            '&:hover fieldset': { borderColor: '#6366f1' },
            '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
          }
        }}
      />
      <TextField
        label="Description"
        name="description"
        variant="outlined"
        fullWidth
        margin="normal"
        required
        multiline
        rows={4}
        value={eventData.description}
        onChange={handleEventDataChange}
        sx={{ 
          '& .MuiInputBase-root': {
            color: '#ffffff',
            '& fieldset': { borderColor: '#4b5563' },
            '&:hover fieldset': { borderColor: '#6366f1' },
            '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
          }
        }}
      />
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle2" gutterBottom>Event Date and Time</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <DatePicker
              selected={eventData.date}
              onChange={handleDateChange}
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
              placeholderText="Select event date"
              className="custom-datepicker"
              customInput={
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Event Date"
                  required
                  sx={{ 
                    '& .MuiInputBase-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#4b5563' },
                      '&:hover fieldset': { borderColor: '#6366f1' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                    }
                  }}
                />
              }
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <DatePicker
              selected={eventData.timeFrame.startTime ? new Date(`2000/01/01 ${eventData.timeFrame.startTime}`) : null}
              onChange={(time) => handleTimeChange(time, 'startTime')}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Start Time"
              dateFormat="h:mm aa"
              placeholderText="Select start time"
              className="custom-datepicker"
              customInput={
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Start Time"
                  required
                  sx={{ 
                    '& .MuiInputBase-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#4b5563' },
                      '&:hover fieldset': { borderColor: '#6366f1' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                    }
                  }}
                />
              }
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <DatePicker
              selected={eventData.timeFrame.endTime ? new Date(`2000/01/01 ${eventData.timeFrame.endTime}`) : null}
              onChange={(time) => handleTimeChange(time, 'endTime')}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="End Time"
              dateFormat="h:mm aa"
              placeholderText="Select end time"
              className="custom-datepicker"
              customInput={
                <TextField
                  fullWidth
                  variant="outlined"
                  label="End Time"
                  required
                  sx={{ 
                    '& .MuiInputBase-root': {
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#4b5563' },
                      '&:hover fieldset': { borderColor: '#6366f1' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                    }
                  }}
                />
              }
            />
          </Box>
        </Box>
      </Paper>
      <TextField
        label="Location"
        name="location"
        variant="outlined"
        fullWidth
        margin="normal"
        required
        value={eventData.location}
        onChange={handleEventDataChange}
        sx={{ 
          '& .MuiInputBase-root': {
            color: '#ffffff',
            '& fieldset': { borderColor: '#4b5563' },
            '&:hover fieldset': { borderColor: '#6366f1' },
            '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
          }
        }}
      />
      <TextField
  label="Capacity"
  name="capacity"
  type="number"
  variant="outlined"
  fullWidth
  margin="normal"
  required
  value={eventData.capacity}
  onChange={(e) => setEventData({ 
    ...eventData, 
    capacity: Math.max(1, parseInt(e.target.value) || 1)
  })}
  InputProps={{
    inputProps: { 
      min: 1,
      step: 1 
    }
  }}
  sx={{ 
    '& .MuiInputBase-root': {
      color: '#ffffff',
      '& fieldset': { borderColor: '#4b5563' },
      '&:hover fieldset': { borderColor: '#6366f1' },
      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
    }
  }}
/>

<Box sx={{ mt: 2 }}>
  <input
    accept="image/*"
    style={{ display: 'none' }}
    id="event-image-upload"
    type="file"
    onChange={handleImageUpload}
  />
  <label htmlFor="event-image-upload">
    <Button 
      variant="outlined" 
      component="span"
      startIcon={<AddPhotoIcon />}
      fullWidth
    >
      Upload Event Image
    </Button>
  </label>
  {eventData.image && (
    <img 
      src={eventData.image} 
      alt="Preview" 
      style={{ 
        maxWidth: '100%', 
        maxHeight: '300px',
        marginTop: '16px',
        borderRadius: '8px',
        backgroundColor: '#3f3f46'
      }}
    />
  )}
</Box>


    </Box>
  );

  const renderEquipmentSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Select Equipment</Typography>
      
      {/* Selected Equipment Summary */}
      {selectedEquipment.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Selected Equipment:</Typography>
          <Grid container spacing={2}>
            {selectedEquipment.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.equipmentId}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2">{item.name}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity} × ${item.price}
                      </Typography>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveEquipment(item.equipmentId)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1">
              Total Equipment Cost: ${calculateTotalCost()}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Available Equipment Grid */}
      <Grid container spacing={3}>
        {equipmentOptions.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { boxShadow: 6 },
                background: 'linear-gradient(145deg, #24242a, #2a2a32)',
                border: '1px solid #3f3f46',
                color: '#ffffff'
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={item.imageUrl}
                alt={item.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleEquipmentSelect(item)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">${item.price}/unit</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleEquipmentSelect(item)}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`${item.quantity > 0 && item.availability ? item.quantity : 0} available`}
                    size="small"
                    color={item.quantity > 0 && item.availability ? "primary" : "error"}
                    variant="outlined"
                    sx={{ 
                      background: '#3f3f46',
                      color: '#ffffff'
                    }}
                  />
                </Box>
                {item.vendor ? (
                  <Typography variant="caption">
                    Vendor: {item.vendorName}
                  </Typography>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Equipment Selection Dialog */}
      <Dialog open={equipmentDialog} onClose={() => setEquipmentDialog(false)}>
        <DialogTitle>Add Equipment</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6">{selectedItem.name}</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedItem.description}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Price: ${selectedItem.price}/unit
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Quantity</InputLabel>
                <Select
                  value={quantity}
                  label="Quantity"
                  onChange={(e) => setQuantity(e.target.value)}
                  sx={{
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4b5563'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1'
                    }
                  }}
                >
                  {[...Array(selectedItem.quantity)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Total: ${selectedItem.price * quantity}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEquipmentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEquipment} variant="contained">
            Add to Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Add this loading/error display in your JSX
  {loadingEquipment && (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <CircularProgress />
      <Typography variant="body2" color="textSecondary">
        Loading available equipment...
      </Typography>
    </Box>
  )}

  {fetchError && (
    <Alert severity="error" sx={{ m: 2 }}>
      {fetchError}
    </Alert>
  )}

  {!loadingEquipment && equipmentOptions.length === 0 && !fetchError && (
    <Alert severity="info" sx={{ m: 2 }}>
      No available equipment found matching your criteria
    </Alert>
  )}

  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #1a1a1f, #2d2d35)',
        color: '#f3f4f6'
      }}
    >
      <Container maxWidth="xl" sx={{ py: 8 }}>
        {/* Stepper Header */}
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-root .Mui-completed': {
              color: '#8b5cf6',
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: '#8b5cf6',
            },
            '& .MuiStepIcon-root': {
              color: '#3f3f46',
              border: '2px solid #4b5563',
              borderRadius: '50%',
              '&.Mui-completed': {
                color: '#8b5cf6',
                border: 'none'
              },
              '&.Mui-active': {
                color: '#8b5cf6',
                border: 'none'
              }
            }
          }}
        >
          <Step>
            <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#ffffff' } }}>
              Event Details
            </StepLabel>
          </Step>
          <Step>
            <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#ffffff' } }}>
              Select Equipment
            </StepLabel>
          </Step>
        </Stepper>

        {/* Error/Success Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              background: '#2f2f38',
              color: '#ffffff',
              '& .MuiAlert-icon': { color: '#ef4444' }
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4,
              background: '#2f2f38',
              color: '#ffffff',
              '& .MuiAlert-icon': { color: '#8b5cf6' }
            }}
          >
            {success}
          </Alert>
        )}

        {/* Step Content */}
        <Paper sx={{ 
          p: 4, 
          mb: 4,
          background: 'linear-gradient(145deg, #24242a, #2a2a32)',
          border: '1px solid #3f3f46',
          borderRadius: 3
        }}>
          {activeStep === 0 ? renderEventDetails() : renderEquipmentSelection()}
        </Paper>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<BackIcon />}
            sx={{
              color: '#9ca3af',
              '&:hover': {
                backgroundColor: 'rgba(156, 163, 175, 0.1)'
              }
            }}
          >
            Back
          </Button>
          <Box>
            {activeStep === 1 ? (
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }
                }}
                onClick={handleSubmit}
              >
                Create Event
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }
                }}
                onClick={handleNext}
                endIcon={<NextIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Container>
  );
};

export default CreateEvent;

import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    timeFrame: {
      startTime: "",
      endTime: ""
    },
    image: "",
    capacity: 100,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch event details on mount
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const event = res.data.data;
        setEventData({
          name: event.name,
          description: event.description,
          date: new Date(event.date).toISOString().split("T")[0],
          location: event.location,
          timeFrame: typeof event.timeFrame === 'object' 
            ? event.timeFrame 
            : { startTime: "", endTime: "" },
          image: event.image || "",
          capacity: event.capacity || 100,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch event details");
        if (err.response?.status === 404) {
          navigate('/my-events');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate times
    if (!eventData.timeFrame.startTime || !eventData.timeFrame.endTime) {
      setError("Please provide both start and end times");
      return;
    }

    const [startHour, startMinute] = eventData.timeFrame.startTime.split(':').map(Number);
    const [endHour, endMinute] = eventData.timeFrame.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      setError("End time must be after start time");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/events/${eventId}`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Event updated successfully!");
      setTimeout(() => navigate("/my-events"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update event");
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Edit Event</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Event Name"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={eventData.name}
            onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={eventData.description}
            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
          />
          <TextField
            label="Date"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            type="date"
            InputLabelProps={{ shrink: true }}
            value={eventData.date}
            onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
          />
          <TextField
            label="Location"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={eventData.location}
            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Time"
              variant="outlined"
              fullWidth
              margin="normal"
              required
              type="time"
              InputLabelProps={{ shrink: true }}
              value={eventData.timeFrame.startTime}
              onChange={(e) => setEventData({
                ...eventData,
                timeFrame: {
                  ...eventData.timeFrame,
                  startTime: e.target.value
                }
              })}
            />
            <TextField
              label="End Time"
              variant="outlined"
              fullWidth
              margin="normal"
              required
              type="time"
              InputLabelProps={{ shrink: true }}
              value={eventData.timeFrame.endTime}
              onChange={(e) => setEventData({
                ...eventData,
                timeFrame: {
                  ...eventData.timeFrame,
                  endTime: e.target.value
                }
              })}
            />
          </Box>
          <TextField
            label="Capacity"
            name="capacity"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={eventData.capacity}
            onChange={(e) => setEventData({ ...eventData, capacity: e.target.value })}
            InputProps={{
              inputProps: { 
                min: 1,
                step: 1 
              }
            }}
          />
          <TextField
            label="Event Image URL"
            variant="outlined"
            fullWidth
            margin="normal"
            value={eventData.image}
            onChange={(e) => setEventData({ ...eventData, image: e.target.value })}
            helperText="Optional: Enter the URL of an event image"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Update Event
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default EditEvent;

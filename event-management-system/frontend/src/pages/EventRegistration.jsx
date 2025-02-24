import React, { useState, useEffect } from "react";
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, CircularProgress, Alert } from "@mui/material";
import axios from "axios";

const EventRegistration = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch events");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const registerForEvent = async (eventId) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/registrations/register/${eventId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Registration successful!");
      // Refresh the events list
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Available Events</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Time Frame</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{
                  typeof event.timeFrame === 'object'
                    ? `${event.timeFrame.startTime} to ${event.timeFrame.endTime}`
                    : event.timeFrame
                }</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => registerForEvent(event._id)}>
                    Register
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default EventRegistration;

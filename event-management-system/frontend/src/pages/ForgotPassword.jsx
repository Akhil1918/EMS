import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box, Alert } from "@mui/material";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call your backend endpoint for password reset (ensure this endpoint exists)
      await axios.post("https://ems-backend-xir2.onrender.com/api/auth/forgot-password", { email });
      setMessage("Password reset instructions have been sent to your email.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset instructions");
      setMessage("");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Forgot Password</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Enter your email"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Send Reset Instructions
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ForgotPassword;

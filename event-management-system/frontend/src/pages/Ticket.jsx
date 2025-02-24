import React, { useState, useEffect } from "react";
import { Container, Typography, Button, CircularProgress, Alert } from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";

const Ticket = () => {
  const { registrationId } = useParams(); // Make sure your route passes registrationId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const downloadTicket = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://ems-backend-xir2.onrender.com/api/registrations/tickets/${registrationId}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Create a URL for the PDF blob and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket_${registrationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to download ticket");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optionally, automatically trigger download, or simply display a button.
  }, [registrationId]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Download Ticket</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" color="primary" onClick={downloadTicket} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Download Ticket"}
      </Button>
    </Container>
  );
};

export default Ticket;

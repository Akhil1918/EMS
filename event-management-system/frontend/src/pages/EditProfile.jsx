import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Paper,
  Switch,
  FormControlLabel,
  IconButton,
  Tab,
  Tabs,
  Card,
  CardContent,
  FormGroup,
  Snackbar,
  Tooltip,
  Divider,
  Checkbox
} from "@mui/material";
import {
  PhotoCamera,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { useAuth, api } from "../context/AuthContext";
import axios from "axios";

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    profile: {
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      bio: "",
      avatar: ""
    },
    businessDetails: {
      businessName: "",
      businessAddress: "",
      description: ""
    }
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    inApp: true,
    eventReminders: true,
    marketingEmails: false
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    inApp: true,
    eventReminders: true
  });
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.profile) {
      setFormData({
        profile: {
          name: user.profile.name || "",
          email: user.profile.email || "",
          phoneNumber: user.profile.phoneNumber || "",
          address: user.profile.address || "",
          bio: user.profile.bio || "",
          avatar: user.profile.avatar || ""
        },
        businessDetails: {
          businessName: user.businessDetails?.businessName || "",
          businessAddress: user.businessDetails?.businessAddress || "",
          description: user.businessDetails?.description || ""
        }
      });
      setNotifications(user.notificationPreferences || {
        email: true,
        sms: false,
        inApp: true,
        eventReminders: true,
        marketingEmails: false
      });
      setImagePreview(user.profile.avatar);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get("https://ems-backend-xir2.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userData = response.data;
        setFormData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            ...userData.profile,
            name: userData.profile?.name || "",
            email: userData.email || userData.profile?.email || "",
            phoneNumber: userData.profile?.phoneNumber || "",
            address: userData.profile?.address || "",
            bio: userData.profile?.bio || "",
            avatar: userData.profile?.avatar || ""
          },
          businessDetails: {
            ...prev.businessDetails,
            ...userData.businessDetails
          }
        }));
        
        // Set notification preferences
        if (userData.notificationPreferences) {
          setNotificationPreferences(userData.notificationPreferences);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching user data");
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatar: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setError("Please fix the form errors before submitting");
      setTouched(errors);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = sessionStorage.getItem("token");
      const payload = {
        profile: {
          ...formData.profile
        },
        ...(user.role === 'vendor' && {
          businessDetails: {
            businessName: formData.businessDetails.businessName,
            businessAddress: formData.businessDetails.businessAddress,
            description: formData.businessDetails.description
          }
        })
      };

      const response = await api.put("/auth/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.user);
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Error updating profile");
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    setError("");
  };

  const handleNotificationChange = (setting) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.profile.name) errors.name = "Name is required";
    if (!formData.profile.email) errors.email = "Email is required";
    if (formData.profile.email && !/\S+@\S+\.\S+/.test(formData.profile.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (formData.profile.phoneNumber && !/^\+?[\d\s-]{10,}$/.test(formData.profile.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }
    if (formData.profile.bio && formData.profile.bio.length > 500) {
      errors.bio = "Bio cannot exceed 500 characters";
    }
    if (formData.businessDetails.businessName && formData.businessDetails.businessName.length > 100) {
      errors.businessName = "Business Name cannot exceed 100 characters";
    }
    if (formData.businessDetails.businessAddress && formData.businessDetails.businessAddress.length > 200) {
      errors.businessAddress = "Business Address cannot exceed 200 characters";
    }
    if (formData.businessDetails.description && formData.businessDetails.description.length > 500) {
      errors.description = "Business Description cannot exceed 500 characters";
    }
    if (formData.profile.address && formData.profile.address.length > 200) {
      errors.address = "Address cannot exceed 200 characters";
    }
    return errors;
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Please log in to edit your profile.</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Edit Profile
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          centered
          sx={{ mb: 4 }}
        >
          <Tab label="Basic Info" />
          <Tab label="Notifications" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          {activeTab === 0 && (
            <>
              <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={imagePreview}
                  alt={formData.profile.name}
                  sx={{ width: 100, height: 100, mb: 2 }}
                />
                <input
                  accept="image/*"
                  type="file"
                  id="avatar-upload"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                  >
                    Change Photo
                  </Button>
                </label>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Personal Information</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Name"
                    name="profile.name"
                    fullWidth
                    required
                    value={formData.profile?.name || ""}
                    onChange={handleChange}
                    error={touched.profile?.name && !formData.profile?.name}
                    helperText={touched.profile?.name && !formData.profile?.name ? "Name is required" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    name="profile.email"
                    type="email"
                    fullWidth
                    required
                    value={formData.profile?.email || ""}
                    onChange={handleChange}
                    error={touched.profile?.email && (!formData.profile?.email || !/\S+@\S+\.\S+/.test(formData.profile?.email))}
                    helperText={touched.profile?.email && (!formData.profile?.email ? "Email is required" : !/\S+@\S+\.\S+/.test(formData.profile?.email) ? "Please enter a valid email" : "")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone Number"
                    name="profile.phoneNumber"
                    fullWidth
                    value={formData.profile?.phoneNumber || ""}
                    onChange={handleChange}
                    error={touched.profile?.phoneNumber && !formData.profile?.phoneNumber}
                    helperText={touched.profile?.phoneNumber && !formData.profile?.phoneNumber ? "Please enter a valid phone number" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Address"
                    name="profile.address"
                    fullWidth
                    value={formData.profile?.address || ""}
                    onChange={handleChange}
                    error={touched.profile?.address && !formData.profile?.address}
                    helperText={touched.profile?.address && !formData.profile?.address ? "Address is required" : ""}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    name="profile.bio"
                    multiline
                    rows={4}
                    fullWidth
                    value={formData.profile.bio || ""}
                    onChange={handleChange}
                    error={touched.profile?.bio && (formData.profile?.bio?.length || 0) > 500}
                    helperText={`${formData.profile?.bio?.length || 0}/500 characters${
                      touched.profile?.bio && (formData.profile?.bio?.length || 0) > 500 ? " (Bio is too long)" : ""
                    }`}
                  />
                </Grid>
                {user?.role === 'vendor' ? (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Business Information</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Business Name"
                        name="businessDetails.businessName"
                        fullWidth
                        value={formData.businessDetails?.businessName || ""}
                        onChange={handleChange}
                        error={touched.businessDetails?.businessName && !formData.businessDetails?.businessName}
                        helperText={touched.businessDetails?.businessName && !formData.businessDetails?.businessName ? "Business Name is required" : ""}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Business Address"
                        name="businessDetails.businessAddress"
                        multiline
                        rows={2}
                        fullWidth
                        value={formData.businessDetails?.businessAddress || ""}
                        onChange={handleChange}
                        error={touched.businessDetails?.businessAddress && !formData.businessDetails?.businessAddress}
                        helperText={touched.businessDetails?.businessAddress && !formData.businessDetails?.businessAddress ? "Business Address is required" : ""}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Business Description"
                        name="businessDetails.description"
                        multiline
                        rows={4}
                        fullWidth
                        value={formData.businessDetails?.description || ""}
                        onChange={handleChange}
                        error={touched.businessDetails?.description && !formData.businessDetails?.description}
                        helperText={touched.businessDetails?.description && !formData.businessDetails?.description ? "Business Description is required" : ""}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Contact support to upgrade to a vendor account
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Notification Settings</Typography>
                <Tooltip title="Configure how you want to receive notifications">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationPreferences.inApp}
                      onChange={() => handleNotificationChange('inApp')}
                    />
                  }
                  label="In-App Notifications"
                />
                <Typography variant="caption" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
                  Get notifications within the application
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationPreferences.eventReminders}
                      onChange={() => handleNotificationChange('eventReminders')}
                    />
                  }
                  label="Event Reminders"
                />
                <Typography variant="caption" color="textSecondary" sx={{ ml: 4 }}>
                  Receive reminders about upcoming events
                </Typography>
              </FormGroup>
            </Paper>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/profile")}
              startIcon={<CancelIcon />}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        message={success}
      />
    </Container>
  );
};

export default EditProfile;

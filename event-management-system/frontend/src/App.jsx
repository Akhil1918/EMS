import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Ticket from "./pages/Ticket";
import VendorDashboard from "./pages/VendorDashboard";
import AddEquipment from "./pages/AddEquipment";
import EventRegistration from "./pages/EventRegistration";
import MyRegistrations from "./pages/MyRegistrations";
import MyEvents from "./pages/MyEvents";        
import EventDetails from "./pages/EventDetails";
import EditProfile from "./pages/EditProfile";
import Notifications from "./components/Notifications";
import EquipmentDetails from "./pages/EquipmentDetails";
import EditEquipment from "./pages/EditEquipment";
import VendorRegister from "./pages/VendorRegister";
import RequireAuth from "./components/RequireAuth";
import BrowseEvents from "./pages/BrowseEvents";
import ErrorBoundary from './components/ErrorBoundary';
import VendorEquipment from "./pages/VendorEquipment";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from './pages/AdminPanel';
import VendorProfile from "./pages/VendorProfile";
import AdminProfile from "./components/admin/AdminProfile";
import { useAuth } from './context/AuthContext';
import UserProfile from "./pages/UserProfile";
import CircularProgress from '@mui/material/CircularProgress';
import { EventRefreshProvider } from './context/EventRefreshContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <CircularProgress />
    </div>;
  }

  return (
    <EventRefreshProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/edit-event/:eventId" element={<EditEvent />} />
          <Route path="/ticket/:registrationId" element={<Ticket />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/equipment/add" element={<AddEquipment />} />
          <Route 
            path="/admin-dashboard" 
            element={
              <RequireAuth roles={['admin']}>
                <AdminPanel />
              </RequireAuth>
            } 
          />
          <Route path="/event-registration" element={<EventRegistration />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/my-events" element={<MyEvents />} />   
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'admin', 'vendor']}>
            <UserProfile />
          </ProtectedRoute>}>
            <Route index element={<UserProfile />} />
            <Route path="edit" element={<EditProfile />} />
          </Route>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/equipment/:id" element={<EquipmentDetails />} />
          <Route 
            path="/edit-equipment/:id" 
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <EditEquipment />
              </ProtectedRoute>
            }
          />
          <Route path="/vendor-register" element={<VendorRegister />} />
          <Route path="/events" element={<BrowseEvents />} />
          <Route path="/add-equipment" element={<AddEquipment />} />
          <Route path="/vendor-equipment" element={<VendorEquipment />} />
          <Route path="/vendor-profile" element={<VendorProfile />} />
          <Route path="/admin" element={
            <RequireAuth roles={['admin']}>
              <ErrorBoundary>
                <AdminPanel />
              </ErrorBoundary>
            </RequireAuth>
          } />
          <Route path="/admin-profile" element={
            <RequireAuth roles={['admin']}>
              <AdminProfile />
            </RequireAuth>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </EventRefreshProvider>
  );
}

export default App;

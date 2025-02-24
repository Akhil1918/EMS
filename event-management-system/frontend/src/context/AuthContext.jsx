import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";

const AuthContext = createContext();

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://ems-backend-xir2.onrender.com/api',  // adjust this to match your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  // Configure axios interceptor for token
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const { data } = await api.get("/auth/me");
          console.log("Auth response:", data);
          setUser({
            ...data,
            role: data.role,
            profile: data.profile || {},
            adminPermissions: data.adminPermissions || [],
            businessDetails: data.businessDetails || {}
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
          sessionStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        // checkSession();
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [user, logout]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => {
        const newToken = response.headers["x-refreshed-token"];
        if (newToken) {
          sessionStorage.setItem("token", newToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          setUser(prev => ({ ...prev, token: newToken }));
        }
        return response;
      },
      error => {
        if (error.config?.url?.includes("/notifications")) {
          return Promise.reject(error);
        }
        if (error.response?.status === 401) {
          sessionStorage.removeItem("token");
          setUser(null);
          window.location.href = "/login";
        }
        if (error.response?.status === 403 && 
            error.response.data.message.includes('suspended')) {
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
          alert('Your account has been suspended. Contact administrator.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [setUser]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      console.log('Login response:', data);
      
      if (data.token) {
        console.log('Storing token:', data.token);
        sessionStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setUser({
          ...data,
          role: data.role,
          sessionVersion: data.sessionVersion || 1
        });
        return { success: true };
      } else {
        console.error('Login failed - no token received');
        return { success: false, message: "Authentication failed" };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // Add localStorage fallback
  useEffect(() => {
    const storedVersion = localStorage.getItem("sessionVersion");
    if (!user?.sessionVersion && storedVersion) {
      setUser(prev => ({ ...prev, sessionVersion: parseInt(storedVersion) }));
    }
  }, [user]);

  // Add this useEffect to check session storage on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const { data } = await api.get('/auth/check-session');
          if (data.valid) {
            setUser(data.user);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }
        } catch (err) {
          sessionStorage.removeItem('token');
        }
      }
      setLoading(false); // Add this line to indicate auth check completion
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || { 
    user: null, 
    loading: false, 
    error: null,
    login: () => {},
    logout: () => {}
  };
};

// Export the api instance for use in other components
export { api };
export const useApi = () => api;

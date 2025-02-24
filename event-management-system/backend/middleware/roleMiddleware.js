const User = require("../models/User");

// Middleware to check if the user is a vendor or admin
const isVendorOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id); // Assuming the user is authenticated

    // Check if the user is a vendor or admin
    if (user.role !== "vendor" && user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only vendors and admins can access this data." });
    }

    next(); // Continue to the next middleware or controller function
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient privileges" });
    }
    next();
  };
};

// Add to existing role middleware
const isApprovedVendor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role === 'vendor' && !user.approved) {
      return res.status(403).json({ 
        message: "Vendor account pending approval" 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const canSuspendUsers = (req, res, next) => {
  if (req.user.role === 'admin' && req.user.permissions?.includes('suspend_users')) {
    next();
  } else {
    res.status(403).json({ message: "Insufficient permissions" });
  }
};

module.exports = { isVendorOrAdmin, handleRoles, isApprovedVendor, canSuspendUsers };

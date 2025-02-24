const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateToken } = require("../controllers/authController");
const Equipment = require("../models/Equipment");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const currentUser = await User.findById(decoded.id)
      .select('+sessionVersion +suspended');
    
    // Check if user exists and session is valid
    if (!currentUser || currentUser.sessionVersion !== decoded.sessionVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }

    // Check if account is suspended
    if (currentUser.suspended) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended. Contact administrator.'
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Role-based access control middleware
const checkRole = (roles) => (req, res, next) => {
  // Admin bypass
  if (req.user?.role === 'admin') return next();
  
  console.log('User role:', req.user?.role);
  console.log('Required roles:', roles);
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden - Insufficient permissions"
    });
  }
  next();
};

// Add equipment ownership check
const checkEquipmentOwnership = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    if (req.user.role !== 'admin' && equipment.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You don't own this equipment"
      });
    }
    
    req.equipment = equipment;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during authorization check"
    });
  }
};

// Rename protect to authMiddleware while maintaining backward compatibility
const authMiddleware = protect;

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('+role +adminPermissions +lastAdminLogin');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required'
      });
    }

    // Check admin-specific security flags
    if (user.adminPermissions?.disabled) {
      return res.status(403).json({
        success: false,
        message: 'Admin account disabled'
      });
    }

    // Update last admin action timestamp
    user.lastAdminAction = Date.now();
    await user.save();

    next();
  } catch (error) {
    console.error('[ADMIN] Middleware Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Admin validation failed'
    });
  }
};

module.exports = {
  protect,
  authMiddleware,
  checkRole,
  checkEquipmentOwnership,
  adminMiddleware
};

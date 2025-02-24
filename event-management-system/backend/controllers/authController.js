const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const SubInventory = require("../models/SubInventory");
const AuditLog = require("../models/AuditLog");

// Generate a JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion
    }, 
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, password, profile, role = 'user', businessDetails } = req.body;

    // Common validation
    if (!email || !password || !profile?.name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Vendor-specific validation
    if (role === 'vendor') {
      if (!businessDetails?.businessName || !businessDetails?.phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Business name and phone number are required for vendors'
        });
      }
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user with proper profile structure
    const user = await User.create({
      email,
      password,
      profile: {
        name: profile.name
      },
      role,
      approved: false,
      ...(role === 'vendor' && {
        businessDetails: {
          businessName: businessDetails.businessName,
          phoneNumber: businessDetails.phoneNumber,
          businessAddress: businessDetails.businessAddress
        }
      })
    });

    // Generate token and respond
    const token = generateToken(user);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message.includes('validation failed') 
        ? 'Invalid registration data' 
        : 'Registration failed'
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email }).select('+password +suspended');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.suspended) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended. Contact administrator.'
      });
    }

    // If vendor and not approved, do not allow login
    if (user.role === "vendor" && !user.approved) {
      return res.status(403).json({ message: "Your vendor account is pending admin approval" });
    }

    if (user.role === 'admin') {
      user.lastAdminLogin = Date.now();
      await user.save();
    }

    // Send response with token
    const token = generateToken(user);
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          name: user.profile.name,
          phoneNumber: user.profile.phoneNumber,
          address: user.profile.address,
          avatar: user.profile.avatar
        },
        approved: user.approved,
        businessDetails: user.businessDetails
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Controller to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const allowedFields = {
      profile: {
        name: req.body.profile?.name,
        email: req.body.profile?.email,
        phoneNumber: req.body.profile?.phoneNumber,
        address: req.body.profile?.address
      },
      notificationPreferences: req.body.notificationPreferences
    };

    if (req.user.role === 'vendor') {
      allowedFields.businessDetails = {
        businessName: req.body.businessDetails?.businessName,
        businessAddress: req.body.businessDetails?.businessAddress,
        description: req.body.businessDetails?.description
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: allowedFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (user.role !== 'vendor') {
      delete allowedFields.businessDetails;
    }

    const responseUser = {
      _id: user._id,
      email: user.email,
      profile: {
        name: user.profile.name,
        email: user.email,
        phoneNumber: user.profile.phoneNumber,
        address: user.profile.address,
        avatar: user.profile.avatar
      },
      role: user.role,
      approved: user.approved,
      notificationPreferences: user.notificationPreferences,
      ...(user.role === 'vendor' && { 
        businessDetails: user.businessDetails 
      })
    };

    res.status(200).json({
      success: true,
      user: responseUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Profile update failed'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -__v -sessionVersion')
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const responseData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      approved: user.approved,
      suspended: user.suspended,
      profile: {
        name: user.profile?.name || '',
        phoneNumber: user.profile?.phoneNumber || '',
        address: user.profile?.address || '',
        avatar: user.profile?.avatar || '',
        bio: user.profile?.bio || ''
      },
      ...(user.role === 'admin' && {
        adminPermissions: user.adminPermissions,
        lastAdminLogin: user.lastAdminLogin
      }),
      ...(user.role === 'vendor' && {
        businessDetails: user.businessDetails
      })
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -sessionVersion -__v');
    
    if (!user) throw new Error('User not found');

    res.json({ 
      valid: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        businessDetails: user.businessDetails
      }
    });
  } catch (err) {
    res.status(401).json({ 
      valid: false,
      message: "Session expired or invalid" 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  getCurrentUser,
  checkSession,
  generateToken
};

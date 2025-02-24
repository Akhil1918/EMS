const User = require("../models/User");
const Event = require("../models/Event");
const Equipment = require("../models/Equipment");
const SubInventory = require("../models/SubInventory");
const AuditLog = require('../models/AuditLog');


// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: 'organizer',
        select: 'email profile.name role'
      })
      .lean();

    res.status(200).json({ 
      success: true, 
      data: events.map(event => ({
        ...event,
        status: event.status || 'active' // Default status if missing
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all equipment
const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Update role validation
  const validRoles = ["user", "vendor", "admin"];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ 
      success: false, 
      message: `Invalid role. Valid roles: ${validRoles.join(', ')}` 
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent self-demotion
    if (req.user._id.toString() === id && role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Cannot remove your own admin privileges" 
      });
    }

    // Add role change consequences
    if (user.role === 'vendor' && role !== 'vendor') {
      // Remove vendor-specific data when changing from vendor role
      await Equipment.deleteMany({ vendor: user._id });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { role, $inc: { sessionVersion: 1 } }, 
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEquipment = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      // Ensure the user is an admin
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "You do not have permission to edit equipment" });
      }
  
      // Find and update the equipment
      const equipment = await Equipment.findByIdAndUpdate(id, updates, { new: true });
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
  
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

    
  const approveVendor = async (req, res) => {
    const { id } = req.params; // The vendor's user ID
  
    try {
      const vendor = await User.findById(id);
      if (!vendor || vendor.role !== "vendor") {
        return res.status(404).json({ success: false, message: "Vendor not found" });
      }
  
      // Approve the vendor
      vendor.approved = true;
      await vendor.save();
  
      res.status(200).json({ success: true, message: "Vendor approved successfully", data: vendor });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

      // Approve a vendor's equipment
const approveEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        approvedAt: Date.now()
      },
      { new: true }
    );

    // Update inventory status
    await SubInventory.updateMany(
      { "equipment._id": req.params.id },
      { $set: { "equipment.$.status": 'approved' } }
    );

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getDashboardData = async (req, res) => {
  try {
    // Retrieve all events, equipment items, and users
    const events = await Event.find();
    const equipment = await Equipment.find();
    const users = await User.find();

    res.status(200).json({
      success: true,
      data: {
        events,
        equipment,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

// Vendor suspension
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the CORRECT field name 'suspended' from model
    user.suspended = req.body.suspended;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        suspended: user.suspended  // Return actual field name
      }
    });
  } catch (error) {
    console.error('Suspension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Get pending approvals
const getPendingApprovals = async (req, res) => {
  try {
    const pendingVendors = await User.find({ role: 'vendor', approved: false });
    const pendingEquipment = await Equipment.find({ approved: false });
    
    res.status(200).json({
      success: true,
      data: {
        vendors: pendingVendors,
        equipment: pendingEquipment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [users, vendors, events, equipment, pendingVendors, pendingEquipment] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'vendor', approved: true }),
      Event.countDocuments({ status: 'active' }),
      Equipment.countDocuments(),
      User.countDocuments({ role: 'vendor', approved: false }),
      Equipment.countDocuments({ status: 'pending' })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: users,
        approvedVendors: vendors,
        activeEvents: events,
        totalEquipment: equipment,
        pendingVendors,
        pendingEquipment,
        pendingApprovals: pendingVendors + pendingEquipment
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get stats',
      error: error.message
    });
  }
};

const getEquipmentForApproval = async (req, res) => {
  try {
    const equipment = await Equipment.find()
      .populate({
        path: 'vendor',
        select: 'businessDetails.businessName email',
        model: 'User'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
    
  } catch (error) {
    console.error('Admin equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching equipment'
    });
  }
};



const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort('-createdAt')
      .populate('admin', 'email')
      .populate('targetUser', 'email');
    
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateEquipmentStatus = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    
    res.status(200).json({ 
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const toggleVendorApproval = async (req, res) => {
  try {
    const { approved } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );

    res.status(200).json({ 
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};



module.exports = {
  getUsers,
  getEvents,
  getEquipment,
  updateUserRole,
  updateEquipment,  
  approveVendor,
  approveEquipment,
  getDashboardData,
  suspendUser,
  getPendingApprovals,
  getStats,
  getEquipmentForApproval,
  getAuditLogs,
  updateEquipmentStatus,
  toggleVendorApproval,
}

const express = require("express");
const {
  getUsers,
  getEvents,
  getEquipment,
  updateUserRole,
  getPendingApprovals,
  getStats,
  getEquipmentForApproval,
  getAuditLogs,
  updateEquipmentStatus,
  toggleVendorApproval,
  suspendUser,
} = require("../controllers/adminController");
const { protect, checkRole, adminMiddleware } = require("../middleware/authMiddleware");
const { adminLimiter } = require("../middleware/rateLimiter");
const { getVendorDashboard } = require("../controllers/vendorController");
const { approveVendor } = require("../controllers/adminController");
const { approveEquipment } = require("../controllers/adminController");
const { getDashboardData } = require("../controllers/adminController");
const Event = require('../models/Event');

const router = express.Router();

// Admin routes (Protected with JWT and Admin authorization)
router.get("/users", 
  protect, 
  checkRole(['admin']),
  adminLimiter,
  getUsers
); // Get all users
router.get("/equipment", 
  protect, 
  checkRole(['admin']),
  getEquipmentForApproval
); // Get all equipment
router.get("/vendors", protect, checkRole(['admin']), getVendorDashboard); // Get all vendor data
router.put("/users/:id/role", 
  protect, 
  adminMiddleware,
  adminLimiter,
  updateUserRole
); // Update user role
router.put("/vendors/:id/approve", protect, adminMiddleware
  , approveVendor); // Approve a vendor
router.put("/equipment/:equipmentId/approve", protect, adminMiddleware, approveEquipment) // Approve an equipment
router.get("/dashboard", protect, adminMiddleware, getDashboardData);
router.get("/pending-approvals", protect, adminMiddleware, getPendingApprovals);
router.put("/vendors/:id/suspend", 
  protect,
  adminMiddleware,
  adminLimiter,
  suspendUser
);
router.get('/stats', 
  protect, 
  (req, res, next) => {
    console.log('User in stats route:', req.user);
    next();
  },
  checkRole(['admin']),
  getStats
);

// Add proper middleware and fix route paths
router.get('/stats', 
  adminMiddleware, 
  getStats
);

router.get('/users', 
  adminMiddleware,
  getUsers
);

router.get('/pending-approvals',
  adminMiddleware,
  getPendingApprovals
);

// Add missing equipment approval route
router.put('/equipment/approve/:id',
  adminMiddleware,
  approveEquipment
);

router.delete('/events/:id', 
  protect,
  adminMiddleware,
  adminLimiter,
  async (req, res) => {
    try {
      await Event.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.get('/audit-logs',
  protect,
  adminMiddleware,
  adminLimiter,
  getAuditLogs
);

router.get("/events", 
  protect,
  adminMiddleware,
  adminLimiter,
  getEvents
);

router.put('/equipment/:id/status',
  protect,
  adminMiddleware,
  adminLimiter,
  updateEquipmentStatus
);

router.put('/users/:id/approve',
  protect,
  adminMiddleware,
  adminLimiter,
  approveVendor
);

router.put('/users/:id/approval',
  protect,
  adminMiddleware,
  adminLimiter,
  toggleVendorApproval
);

router.put('/users/:id/suspend',
  protect,
  adminMiddleware,
  adminLimiter,
  suspendUser
);

module.exports = router;
  
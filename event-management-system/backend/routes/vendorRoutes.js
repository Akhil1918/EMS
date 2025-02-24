const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isVendorOrAdmin } = require("../middleware/roleMiddleware");
const { getVendorDashboard, getVendorEquipment, getVendorStats } = require("../controllers/vendorController");

const router = express.Router();

// Protect all vendor routes
router.use(protect);

// Vendor dashboard route - only accessible by vendors and admins
router.get("/dashboard", isVendorOrAdmin, getVendorDashboard);

router.get('/equipment', protect, getVendorEquipment);

router.get('/:id/stats', 
  protect,
  getVendorStats
);

module.exports = router;

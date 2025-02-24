const express = require("express");
const { createEquipment, getEquipment, updateEquipment, deleteEquipment, addEquipmentToInventory, getEquipmentById, addEquipmentReview, getEquipmentReviews, updateEquipmentAvailability, updateEquipmentStatus, deleteReview, getAvailableEquipment } = require("../controllers/equipmentController");
const { protect, checkRole, checkEquipmentOwnership } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { isVendorOrAdmin } = require("../middleware/roleMiddleware");
const { getVendorEquipment } = require("../controllers/equipmentController");

const router = express.Router();

// Public route to get available equipment
router.get("/available", getAvailableEquipment);

// Vendor equipment route must come before :id parameter route
router.get("/vendor", protect, checkRole('vendor'), getVendorEquipment);

// Route to create new equipment (protected)
router.post("/", protect, adminMiddleware, createEquipment);

// Route to get all equipment (protected)
router.get("/", protect, adminMiddleware, getEquipment);

// Route to get specific equipment by ID (protected)
router.get("/:id", protect, getEquipmentById);

// Route to update specific equipment (protected)
router.put("/:id", protect, isVendorOrAdmin, updateEquipment);

// Route to delete specific equipment (protected)
router.delete("/:id", protect, checkEquipmentOwnership, deleteEquipment);

router.post("/add", protect, checkRole(['vendor']), addEquipmentToInventory);  // Vendor adds equipment to their sub-inventory

// Equipment reviews and ratings
router.post("/:id/reviews", protect, addEquipmentReview);
router.get("/:id/reviews", protect, getEquipmentReviews);

// Equipment availability management
router.patch("/:id/availability", protect, isVendorOrAdmin, updateEquipmentAvailability);

// Route to update equipment status (protected)
router.put('/:id/status', 
  protect, 
  checkRole(['admin']), 
  updateEquipmentStatus
);

router.delete('/:equipmentId/reviews/:reviewId',
  protect,
  checkRole(['admin']),
  deleteReview
);

module.exports = router;

const express = require("express");
const { createEvent, getEvents, updateEvent, deleteEvent, getEventById, duplicateEvent, getEventStatistics, getMyEvents, getAttendanceReport, addEquipmentToEvent, removeEquipmentFromEvent, updateEventEquipmentQuantity } = require("../controllers/eventController");
const { registerForEvent, getRegistrationDetails } = require("../controllers/registrationController");
const { protect } = require("../middleware/authMiddleware"); // Protect routes if authentication is implemented
const { getTicket } = require("../controllers/registrationController");

const router = express.Router();

// POST /events - Protected route (authentication required)
router.post("/", protect, createEvent);

// GET /events - Protected route (authentication required)
router.get("/", getEvents);

// GET /events/my-events - Protected route (authentication required)
router.get("/my-events", protect, getMyEvents);

// PUT /events/:id - Protected route (authentication required)
router.put("/:id", protect, updateEvent);

// DELETE /events/:id - Protected route (authentication required)
router.delete("/:id", protect, deleteEvent);

// GET /events/:id - Protected route (authentication required)
router.get("/:id", protect, getEventById);

// Registration routes
router.post("/:eventId/register", protect, registerForEvent);
router.get("/:eventId/registrations/:registrationId", protect, getRegistrationDetails);

// Enhanced functionality routes
router.post("/:id/duplicate", protect, duplicateEvent);
router.get("/:id/statistics", protect, getEventStatistics);
router.get("/tickets/:id", protect, getTicket);

// Add this route with the other routes
router.get('/:id/attendance-report', protect, getAttendanceReport);

// Equipment management routes
router.post("/:id/equipment", protect, addEquipmentToEvent);
router.delete("/:id/equipment/:equipmentId", protect, removeEquipmentFromEvent);
router.patch("/:id/equipment/:equipmentId", protect, updateEventEquipmentQuantity);

module.exports = router;

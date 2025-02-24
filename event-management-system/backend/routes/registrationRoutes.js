const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getMyRegistrations,
  getRegistrationDetails,
  cancelRegistration,
  getTicket,
  registerForEvent,
} = require("../controllers/registrationController");

// Register for an event
router.post("/event/:eventId/register", protect, registerForEvent);

// Get all registrations for logged in user
router.get("/", protect, getMyRegistrations);

// Get specific registration details
router.get("/:id", protect, getRegistrationDetails);

// Cancel registration
router.delete("/:id", protect, cancelRegistration);

// Get registration ticket
router.get("/:id/ticket", protect, getTicket);

module.exports = router;

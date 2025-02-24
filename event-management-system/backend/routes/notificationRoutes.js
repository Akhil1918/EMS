const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require("../controllers/notificationController");

const router = express.Router();

// Apply protection to all notification routes
router.use(protect);

// Protected notification routes
router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.get("/unread-count", protect, (req, res, next) => {
  // Allow all authenticated users including vendors
  next();
}, getUnreadCount);

// Mark all notifications as read
router.put("/mark-all-read", markAllAsRead);

// Delete a notification
router.delete("/:id", deleteNotification);

module.exports = router;

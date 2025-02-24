const Notification = require("../models/Notification");
const User = require("../models/User");

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    const notifications = await Notification.find({ user: req.user.id })
      .populate({
        path: 'relatedEvent',
        select: 'name date',
        model: 'Event'
      })
      .populate({
        path: 'relatedRegistration',
        select: 'status',
        model: 'Registration'
      })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (err) {
    console.error('Notification controller error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: err.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking notification as read"
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking notifications as read"
    });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    await notification.remove();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting notification"
    });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }
    
    const count = await Notification.countDocuments({
      user: req.user.id,
      read: false
    });
    
    res.status(200).json({ 
      success: true,
      data: { count } 
    });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching notifications",
      error: error.message
    });
  }
};

// Create notification helper function (for internal use)
const createNotification = async (userId, title, message, type, relatedEvent = null, relatedRegistration = null) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.notificationPreferences.inApp) return;

    await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedEvent,
      relatedRegistration
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification
}; 
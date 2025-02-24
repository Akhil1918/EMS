const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["event", "registration", "reminder", "system", "equipment", "approval", "payment"],
    required: true
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  relatedRegistration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  },
  read: {
    type: Boolean,
    default: false
  },
  entityModel: {
    type: String,
    enum: ["Event", "Registration", "Equipment"]
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification; 
const mongoose = require("mongoose");

// Drop existing indexes before creating new ones
mongoose.connection.on('connected', async () => {
  try {
    await mongoose.connection.db.collection('registrations').dropIndexes();
    console.log('Old registration indexes dropped successfully');
  } catch (error) {
    console.log('No existing registration indexes to drop');
  }
});

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'waitlisted', 'cancelled'],
    default: 'pending'
  },
  ticketNumber: {
    type: String,
    required: true
  }
}, { 
  timestamps: true,
  // Ensure virtuals are included in JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound index for event and user
registrationSchema.index({ 
  event: 1, 
  user: 1 
}, { 
  unique: true,
  partialFilterExpression: { status: { $ne: 'cancelled' } }
});

// Remove the separate ticketNumber index and add as compound
registrationSchema.index({ ticketNumber: 1, event: 1 }, { unique: true });

// Ensure old field is not used
registrationSchema.pre('save', function(next) {
  if (this.registrationNumber !== undefined) {
    delete this.registrationNumber;
  }
  next();
});

const Registration = mongoose.model("Registration", registrationSchema);

module.exports = Registration;

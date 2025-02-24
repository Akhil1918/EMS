const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  timeFrame: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // New field to store the event image URL
  image: {
    type: String,
    required: false
  },
  // Equipment Management fields
  equipment: [{
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    }
  }],
  equipmentCost: {
    type: Number,
    default: 0
  },
  // Capacity Management fields
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  isWaitlistEnabled: {
    type: Boolean,
    default: true
  },
  waitlist: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  }],
  registrations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  }],
  stats: {
    totalRegistrations: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }
}, { 
  timestamps: true,
  strictPopulate: false, // Allow populating fields not in schema
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual field for registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.registrations ? this.registrations.length : 0;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.capacity - this.stats.totalRegistrations);
});

// Virtual for waitlist count
eventSchema.virtual('waitlistCount').get(function() {
  return this.waitlist ? this.waitlist.length : 0;
});

// Method to check if event is full
eventSchema.methods.isFull = function() {
  return this.stats.totalRegistrations >= this.capacity;
};

// Method to update registration stats
eventSchema.methods.updateRegistrationStats = async function() {
  const registrationCount = await mongoose.model('Registration').countDocuments({ 
    event: this._id,
    status: 'confirmed'
  });
  
  this.stats.totalRegistrations = registrationCount;
  return this.save();
};

// Pre-save middleware to update stats
eventSchema.pre('save', async function(next) {
  if (this.isModified('registrations')) {
    this.stats.totalRegistrations = this.registrations.length;
  }
  
  if (this.isModified('equipment')) {
    this.equipmentCost = this.equipment.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  }
  
  if (this.equipment && this.equipment.length > 0) {
    const equipmentIds = this.equipment.map(e => e.equipmentId);
    const existingEquipment = await mongoose.model('Equipment')
      .find({ _id: { $in: equipmentIds } });
      
    if (existingEquipment.length !== equipmentIds.length) {
      const missingIds = equipmentIds.filter(id => 
        !existingEquipment.some(e => e._id.equals(id))
      );
      return next(new Error(
        `Invalid equipment IDs: ${missingIds.join(', ')}`
      ));
    }
  }
  
  next();
});

// Add static method to update registration counts
eventSchema.statics.updateRegistrationCount = async function(eventId) {
  const event = await this.findById(eventId);
  if (event) {
    await event.updateRegistrationStats();
  }
};

module.exports = mongoose.model("Event", eventSchema);

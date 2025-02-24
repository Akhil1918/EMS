const SubInventory = require("./SubInventory");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Drop existing indexes before creating new ones
mongoose.connection.on('connected', async () => {
  try {
    await mongoose.connection.db.collection('users').dropIndexes();
    console.log('Old indexes dropped successfully');
  } catch (error) {
    console.log('No existing indexes to drop');
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    index: true
  },
  profile: {
    name: {
      type: String,
      required: true
    },
    phoneNumber: String,
    avatar: String,
    bio: String,
    address: String
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'user',
  },
  approved: {
    type: Boolean,
    default: false,
    required: true
  },
  suspended: {
    type: Boolean,
    default: false
  },
  // Activity tracking
  activityLog: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: Date,
  activityStats: {
    eventsAttended: { type: Number, default: 0 },
    eventsRegistered: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewsGiven: { type: Number, default: 0 }
  },
  // Vendor specific fields
  businessDetails: {
    businessName: {
      type: String,
      required: function() { return this.role === 'vendor'; }
    },
    businessAddress: String,
    phoneNumber: {
      type: String,
      required: function() { return this.role === 'vendor'; }
    },
    description: String,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  notificationPreferences: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    }
  },
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageContent: { type: Boolean, default: false },
    financialAccess: { type: Boolean, default: false }
  },
  sessionVersion: {
    type: Number,
    required: true,
    default: 1
  },
  adminPermissions: {
    type: [String],
    default: [],
    enum: ['manage_users', 'manage_events', 'manage_content', 'system_settings']
  },
  lastAdminLogin: Date,
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Keep only the root email index
userSchema.index({ email: 1 }, { 
  unique: true,
  name: "email_unique"
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to match passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Virtual for full profile
userSchema.virtual('fullProfile').get(function() {
  return {
    ...this.profile,
    activityStats: this.activityStats,
    notificationPreferences: this.notificationPreferences
  };
});

// Add post-save hook for vendors
userSchema.post('save', async function(doc) {
  if (doc.role === 'vendor') {
    try {
      const exists = await SubInventory.exists({ vendor: doc._id });
      if (!exists) {
        await SubInventory.create({
          vendor: doc._id,
          equipment: [],
          totalValue: 0
        });
        console.log(`Created sub-inventory for vendor ${doc._id}`);
      }
    } catch (error) {
      console.error('Sub-inventory creation failed:', error);
      // Remove user if inventory creation fails
      await User.deleteOne({ _id: doc._id });
      throw error;
    }
  }
});

module.exports = mongoose.model("User", userSchema);

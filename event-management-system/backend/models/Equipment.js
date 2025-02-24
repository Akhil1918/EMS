const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
  },
  quantity: {
    type: Number,
    required: [true, "Please add a quantity"],
    min: 0,
    set: function(value) {
      return Math.max(0, value); // Ensure never goes negative
    }
  },
  imageUrl: {
    type: String,
    required: [true, "Please add an image URL"],
  },
  category: {
    type: String,
    required: [true, "Please specify a category"],
    enum: ["Audio", "Lighting", "Stage", "Video", "Other"],
  },
  condition: {
    type: String,
    required: [true, "Please specify the condition"],
    enum: ["New", "Like New", "Good", "Fair"],
  },
  availability: {
    type: Boolean,
    default: true,
  },
  rentedCount: {
    type: Number,
    default: 0,
    min: 0,
    set: function(value) {
      return Math.max(0, value); // Ensure never goes negative
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subInventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubInventory",
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor ID is required'],
    immutable: true
  },
}, { timestamps: true, strictPopulate: false });

equipmentSchema.virtual('vendorDetails', {
  ref: 'User',
  localField: 'vendor',
  foreignField: '_id',
  justOne: true
});

equipmentSchema.set('toJSON', { virtuals: true });
equipmentSchema.set('toObject', { virtuals: true });

equipmentSchema.index({ status: 1, availability: 1, quantity: 1 });
equipmentSchema.index({ vendor: 1, subInventory: 1 });

module.exports = mongoose.model("Equipment", equipmentSchema);

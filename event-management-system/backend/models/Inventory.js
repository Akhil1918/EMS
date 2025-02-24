const mongoose = require("mongoose");

// Add status tracking to inventory schema
const inventorySchema = new mongoose.Schema({
  name: String,
  subInventories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubInventory'
  }],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'archived'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema); 
const mongoose = require("mongoose");

const subInventorySchema = new mongoose.Schema({
  name: String,
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  equipment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment"
  }],
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active'
  },
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory'
  },
  totalValue: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("SubInventory", subInventorySchema);

const Equipment = require("../models/Equipment");
const SubInventory = require("../models/SubInventory");
const User = require("../models/User");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail")
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");


// Get all equipment
const getEquipment = async (req, res) => {
  try {
    let query = {};
    
    // If requesting from /available endpoint, only return approved and available equipment
    if (req.originalUrl.includes('/available')) {
      query = { 
        approved: true,
        availability: true
      };
    }

    const equipment = await Equipment.find(query)
      .populate('addedBy', 'profile.name businessDetails.businessName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching equipment"
    });
  }
};

// Create a new equipment item
const createEquipment = async (req, res) => {
  const { name, description, price, quantity } = req.body;

  // Validate the input data
  if (!name || !description || !price || !quantity) {
    return res.status(400).json({ success: false, message: "Please provide all required fields (name, description, price, quantity)" });
  }

  if (typeof name !== "string" || typeof description !== "string") {
    return res.status(400).json({ success: false, message: "Name and description must be strings" });
  }

  if (typeof price !== "number" || typeof quantity !== "number") {
    return res.status(400).json({ success: false, message: "Price and quantity must be numbers" });
  }

  try {
    const equipment = await Equipment.create({
      name,
      description,
      price,
      quantity,
      addedBy: req.user.id, // Ensure that only authenticated users can add equipment
    });

    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an equipment item
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Update all sub-inventory references
    await SubInventory.updateMany(
      { "equipment._id": req.params.id },
      { 
        $set: { 
          "equipment.$.status": req.body.status,
          "equipment.$.name": req.body.name,
          "equipment.$.price": req.body.price
        } 
      }
    );

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete an equipment item
const deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findById(id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    // Enhanced authorization check
    if (req.user.role !== 'admin' && equipment.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only delete your own equipment"
      });
    }

    // Remove from sub-inventories first
    await SubInventory.updateMany(
      { "equipment._id": id },
      { $pull: { equipment: { _id: id } } }
    );

    await Equipment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Equipment deleted successfully"
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during deletion"
    });
  }
};



const addEquipmentToInventory = async (req, res) => {
  const { name, description, price, quantity, imageUrl, category, condition } = req.body;

  try {
    // Add vendor validation at the start
    if (req.user.role !== "vendor") {
      return res.status(403).json({ 
        success: false, 
        message: "Only vendors can add equipment" 
      });
    }

    // Find the vendor's sub-inventory first
    const subInventory = await SubInventory.findOne({ vendor: req.user.id });
    if (!subInventory) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor sub-inventory not found" 
      });
    }

    // Create equipment with all required relationships
    const equipment = new Equipment({
      name,
      description,
      price,
      quantity,
      imageUrl: imageUrl || "",
      category,
      condition,
      vendor: req.user.id,
      addedBy: req.user.id,
      subInventory: subInventory._id,
      status: 'pending'
    });

    await equipment.save();

    // Update sub-inventory
    subInventory.equipment.push(equipment._id);
    await subInventory.save();

    // Notify admins
    const admins = await User.find({ role: "admin" });
    
    for (const admin of admins) {
      if (admin.notificationSettings?.inApp) {
        await Notification.create({
          user: admin._id,
          message: `New equipment "${name}" added by vendor ${req.user.profile.name}. Please review.`,
          type: 'EQUIPMENT_ADDED',
          relatedEquipment: equipment._id
        });
      }
    }

    res.status(201).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Add equipment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Error adding equipment"
    });
  }
};

// Get equipment by ID
const getEquipmentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid equipment ID format"
      });
    }

    const equipment = await Equipment.findById(req.params.id)
      .populate('addedBy', 'profile.name businessDetails.businessName');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add a review to equipment
const addEquipmentReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const equipmentId = req.params.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5"
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    // Check if user has already reviewed this equipment
    const existingReview = equipment.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this equipment"
      });
    }

    // Add the new review
    const review = {
      user: req.user.id,
      rating,
      comment,
      date: Date.now()
    };

    equipment.reviews.push(review);

    // Update equipment rating
    const totalRating = equipment.reviews.reduce((sum, item) => sum + item.rating, 0);
    equipment.rating = totalRating / equipment.reviews.length;

    await equipment.save();

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get reviews for specific equipment
const getEquipmentReviews = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('reviews.user', 'profile.name');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reviews: equipment.reviews,
        averageRating: equipment.rating
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update equipment availability
const updateEquipmentAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const equipmentId = req.params.id;

    if (typeof availability !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Availability must be a boolean value"
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    // Check if user is authorized to update this equipment
    if (req.user.role !== 'admin' && equipment.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this equipment"
      });
    }

    equipment.availability = availability;
    await equipment.save();

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add rental count to stats aggregation
const getVendorStats = async (req, res) => {
  try {
    const stats = await SubInventory.aggregate([
      {
        $match: { vendor: req.user._id }
      },
      { $unwind: "$equipment" },
      { 
        $group: {
          _id: null,
          // ... existing stats ...
          rentedEquipment: {
            $sum: { $cond: [{ $eq: ["$equipment.status", "rented"] }, 1, 0] }
          }
        }
      }
    ]);
    // Update response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendorEquipment = async (req, res) => {
  try {
    // Fetch directly from Equipment collection with proper filtering
    const equipment = await Equipment.find({
      addedBy: req.user.id,
      status: { $in: ['pending', 'approved', 'rejected'] }
    })
    .sort('-createdAt')
    .lean();

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Equipment fetch error:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching equipment: ${error.message}`
    });
  }
};

const updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
      });
    }

    // Add deep population for inventory relationships
    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('subInventory');

    // Update main inventory reference
    await Inventory.updateMany(
      { "subInventories": equipment.subInventory._id },
      { $set: { "subInventories.$[sub].equipment.$[eq].status": status } },
      {
        arrayFilters: [
          { "sub._id": equipment.subInventory._id },
          { "eq._id": equipment._id }
        ]
      }
    );

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const equipment = await Equipment.findOneAndUpdate(
      { "reviews._id": req.params.id },
      { $pull: { reviews: { _id: req.params.id } } },
      { new: true }
    );

    // Recalculate from equipment's own reviews
    const newRating = equipment.reviews.length > 0 
      ? equipment.reviews.reduce((sum, r) => sum + r.rating, 0) / equipment.reviews.length
      : 0;

    await Equipment.findByIdAndUpdate(equipment._id, { rating: newRating });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this new controller method
const getAvailableEquipment = async (req, res) => {
  try {
    console.log('Starting equipment query...');
    const equipment = await Equipment.find({
      status: 'approved',
      availability: true,
      quantity: { $gt: 0 }
    })
    .populate({
      path: 'vendor',
      select: 'profile.name businessDetails.businessName approved',
      match: { 
        approved: true,
        role: 'vendor'
      }
    })
    .populate({
      path: 'subInventory',
      select: 'status',
      match: { status: 'active' }
    })
    .lean();

    console.log('Raw equipment results:', equipment);
    
    const filteredEquipment = equipment.filter(e => 
      e.vendor && 
      e.subInventory &&
      e.subInventory.status === 'active'
    );

    console.log('Filtered equipment count:', filteredEquipment.length);
    
    res.status(200).json({ success: true, data: filteredEquipment });
  } catch (error) {
    console.error('Available equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available equipment'
    });
  }
};

module.exports = { 
  createEquipment, 
  getEquipment, 
  updateEquipment, 
  deleteEquipment, 
  addEquipmentToInventory, 
  getEquipmentById,
  addEquipmentReview,
  getEquipmentReviews,
  updateEquipmentAvailability,
  getVendorStats,
  getVendorEquipment,
  updateEquipmentStatus,
  deleteReview,
  getAvailableEquipment
};

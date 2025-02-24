const User = require("../models/User");
const SubInventory = require("../models/SubInventory");
const Equipment = require("../models/Equipment");

// Get vendor dashboard data
const getVendorDashboard = async (req, res) => {
  try {
    // Get equipment directly from Equipment collection
    const equipment = await Equipment.find({
      addedBy: req.user.id,
      status: 'approved'
    }).lean();

    // Get stats
    const stats = await Equipment.aggregate([
      { $match: { addedBy: req.user._id } },
      {
        $group: {
          _id: null,
          totalEquipment: { $sum: 1 },
          approvedEquipment: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          totalRented: { $sum: "$rentedCount" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        equipment,
        stats: stats[0] || {}
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard data'
    });
  }
};

// Helper functions for dashboard calculations
const calculateAverageRating = (equipment) => {
  const totalRating = equipment.reduce((sum, e) => sum + e.rating, 0);
  return equipment.length > 0 ? (totalRating / equipment.length).toFixed(1) : 0;
};

const calculateEquipmentByCategory = (equipment) => {
  return equipment.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});
};

const getRecentReviews = (equipment) => {
  const allReviews = equipment.flatMap(e => 
    e.reviews.map(r => ({
      equipmentName: e.name,
      ...r.toObject(),
      date: r.date
    }))
  );
  return allReviews
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);
};

const getTopPerformingEquipment = (equipment) => {
  return equipment
    .sort((a, b) => b.rentedCount - a.rentedCount)
    .slice(0, 5);
};

const calculateInventoryValue = (equipment) => {
  return equipment.reduce((sum, e) => sum + (e.price * e.quantity), 0);
};

const getRecentActivity = async (vendorId) => {
  const recentEquipment = await Equipment.find({ addedBy: vendorId })
    .sort({ createdAt: -1 })
    .limit(5);
  
  return recentEquipment.map(e => ({
    type: 'equipment_added',
    equipment: e.name,
    date: e.createdAt,
    status: e.approved ? 'approved' : 'pending'
  }));
};

const getVendorEquipment = async (req, res) => {
  try {
    const subInventory = await SubInventory.findOne({ vendor: req.user.id })
      .populate({
        path: 'equipment',
        select: 'name category price quantity status'
      });

    if (!subInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found"
      });
    }

    res.status(200).json({
      success: true,
      data: subInventory.equipment
    });
  } catch (error) {
    console.error('Equipment fetch error:', error);
    res.status(500).json({
      success: false,
      message: "Server error fetching equipment"
    });
  }
};

// Add to getVendorStats
const getVendorStats = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id)
      .select('businessDetails activityStats')
      .populate('equipment', 'name status price');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const stats = {
      totalEquipment: await Equipment.countDocuments({ vendor: req.params.id }),
      availableEquipment: await Equipment.countDocuments({ 
        vendor: req.params.id,
        status: 'available'
      }),
      ...vendor.toObject()
    };

    res.json({ success: true, data: stats });
    
  } catch (error) {
    console.error('Vendor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor stats'
    });
  }
};

const addEquipment = async (req, res) => {
  try {
    const { name, description, price, quantity, imageUrl, category, condition } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !quantity || !category || !condition) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Find vendor's sub-inventory
    const subInventory = await SubInventory.findOne({ vendor: req.user.id });
    if (!subInventory) {
      return res.status(404).json({
        success: false,
        message: 'Vendor sub-inventory not found'
      });
    }

    const equipment = new Equipment({
      name,
      description,
      price: Number(price),
      quantity: Number(quantity),
      imageUrl,
      category,
      condition,
      vendor: req.user.id,
      addedBy: req.user.id,
      subInventory: subInventory._id,
      status: 'pending'
    });

    await equipment.save();
    
    // Add equipment to sub-inventory
    subInventory.equipment.push(equipment._id);
    await subInventory.save();

    res.status(201).json({ 
      success: true, 
      data: equipment 
    });
  } catch (error) {
    console.error('Add equipment error:', error);
    res.status(400).json({
      success: false,
      message: 'Error adding equipment: ' + error.message
    });
  }
};

module.exports = { getVendorDashboard, getVendorEquipment, getVendorStats, addEquipment };

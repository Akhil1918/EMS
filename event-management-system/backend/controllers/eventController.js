const Event = require("../models/Event");
const User = require("../models/User");
const Registration = require("../models/Registration");
const generateAttendanceReport = require("../utils/generateAttendanceReport");
const Equipment = require("../models/Equipment");
const mongoose = require('mongoose');
const Notification = require("../models/Notification");
const { createNotification } = require('./notificationController');

// Create a new event
const createEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { 
      name, 
      description, 
      date, 
      location, 
      timeFrame, 
      image,
      capacity,
      equipment // Add equipment to destructuring
    } = req.body;

    // Validate required fields
    if (!name || !description || !date || !location || !timeFrame || !capacity) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Validate capacity
    if (typeof capacity !== 'number' || capacity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid capacity value'
      });
    }

    // Validate image if provided
    if (image && !image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Use base64 encoded image'
      });
    }

    // Validate equipment
    if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one equipment item is required'
      });
    }

    // Validate and process equipment first
    const equipmentUpdates = await Promise.all(
      equipment.map(async (item) => {
        const equipmentItem = await Equipment.findById(item.equipmentId).session(session);
        if (!equipmentItem) {
          throw new Error(`Equipment ${item.equipmentId} not found`);
        }
        if (item.quantity > equipmentItem.quantity) {
          throw new Error(`Insufficient quantity for ${equipmentItem.name}`);
        }
        
        // Update equipment counts
        equipmentItem.quantity -= item.quantity;
        equipmentItem.rentedCount += item.quantity;
        await equipmentItem.save({ session });
        
        return {
          equipmentId: item.equipmentId,
          quantity: item.quantity,
          price: equipmentItem.price
        };
      })
    );

    // Create event with transaction
    const newEvent = await Event.create([{
      name,
      description,
      date: new Date(date),
      location,
      timeFrame,
      image: image || null,
      capacity,
      equipment: equipmentUpdates,
      createdBy: req.user._id
    }], { session });

    await session.commitTransaction();
    
    // Create notification
    await createNotification(
      req.user.id,
      'Event Created',
      `Your event "${name}" was successfully created`,
      'event',
      newEvent[0]._id
    );

    res.status(201).json({
      success: true,
      data: newEvent[0]
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Event creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// Get events with enhanced filtering and statistics
const getEvents = async (req, res) => {
  try {
    const { status, search, sortBy, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    const now = new Date();

    // Date filtering
    if (status === 'upcoming') {
      query.date = { $gt: now };
    } else if (status === 'past') {
      query.date = { $lte: now };
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'date_asc':
        sort.date = 1;
        break;
      case 'date_desc':
        sort.date = -1;
        break;
      case 'popularity':
        sort = { 'stats.totalRegistrations': -1 };
        break;
      default:
        sort.date = 1;
    }

    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('registrations');

    const total = await Event.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalResults: total
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const { name, description, date, location, timeFrame, image } = req.body;

    // Validate timeFrame if it's being updated
    if (timeFrame && (!timeFrame.startTime || !timeFrame.endTime)) {
      return res.status(400).json({
        status: 'error',
        message: 'Both start time and end time are required'
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    // Check if user is authorized to update the event
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this event'
      });
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        date,
        location,
        timeFrame: timeFrame ? {
          startTime: timeFrame.startTime,
          endTime: timeFrame.endTime
        } : event.timeFrame,
        image
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: updatedEvent
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Release reserved equipment
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      for (const item of event.equipment) {
        const equipment = await Equipment.findById(item.equipmentId).session(session);
        if (equipment) {
          equipment.quantity += item.quantity;
          equipment.rentedCount = Math.max(0, equipment.rentedCount - item.quantity);
          await equipment.save({ session });
        }
      }
      
      await Event.deleteOne({ _id: req.params.id }).session(session);
      await session.commitTransaction();
      
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'createdBy',
        select: 'email profile.name role businessDetails',
        model: 'User'
      });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Transform response to include organizer data
    const responseData = event.toObject();
    responseData.organizer = {
      name: event.createdBy?.role === 'vendor' 
        ? event.createdBy.businessDetails?.businessName 
        : event.createdBy?.profile?.name,
      email: event.createdBy?.email,
      businessDetails: event.createdBy?.businessDetails
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Duplicate an event
const duplicateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the original event
    const originalEvent = await Event.findById(id);
    if (!originalEvent) {
      return res.status(404).json({
        success: false,
        message: "Original event not found"
      });
    }

    // Check authorization
    if (originalEvent.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to duplicate this event"
      });
    }

    // Create new event object
    const newEvent = new Event({
      name: `${originalEvent.name} (Copy)`,
      description: originalEvent.description,
      date: new Date(), // Set to current date
      location: originalEvent.location,
      timeFrame: originalEvent.timeFrame,
      createdBy: req.user.id,
      image: originalEvent.image
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      data: newEvent
    });
  } catch (error) {
    console.error('Duplicate event error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get event statistics
const getEventStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id).populate('registrations');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Calculate various statistics
    const registrations = await Registration.find({ event: id });
    const stats = {
      totalRegistrations: registrations.length,
      revenue: registrations.reduce((sum, reg) => sum + (reg.amount || 0), 0),
      registrationTrend: await getRegistrationTrend(id),
      popularTimeSlots: await getPopularTimeSlots(id),
      demographicBreakdown: await getDemographicBreakdown(id)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get event statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper functions for statistics
const getRegistrationTrend = async (eventId) => {
  const registrations = await Registration.aggregate([
    { $match: { event: eventId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);
  return registrations;
};

const getPopularTimeSlots = async (eventId) => {
  const registrations = await Registration.aggregate([
    { $match: { event: eventId } },
    {
      $group: {
        _id: "$timeSlot",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  return registrations;
};

const getDemographicBreakdown = async (eventId) => {
  const registrations = await Registration.aggregate([
    { $match: { event: eventId } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' },
    {
      $group: {
        _id: "$userDetails.profile.ageGroup",
        count: { $sum: 1 }
      }
    }
  ]);
  return registrations;
};

// Get events created by the current user
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .populate({
        path: 'equipment.equipmentId',
        select: 'name price imageUrl category condition'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add this new controller method
const getAttendanceReport = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'registrations',
        populate: {
          path: 'user',
          select: 'email profile.name'
        }
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is authorized (event creator or admin)
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access attendance report'
      });
    }

    // Generate PDF
    const pdfBuffer = await generateAttendanceReport(event, event.registrations);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${event._id}.pdf`);

    // Send the PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating attendance report',
      error: error.message
    });
  }
};

// Add equipment to event
const addEquipmentToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { equipment } = req.body;

    // Validate input
    if (!equipment || !Array.isArray(equipment)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid equipment data provided"
      });
    }

    // Get the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found"
      });
    }

    // Check if user is authorized
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to modify this event"
      });
    }

    // Validate and process each equipment item
    const equipmentPromises = equipment.map(async (item) => {
      const equipmentItem = await Equipment.findById(item.equipmentId);
      if (!equipmentItem) {
        throw new Error(`Equipment with ID ${item.equipmentId} not found`);
      }
      
      // Check if quantity is available
      if (item.quantity > equipmentItem.quantity) {
        throw new Error(`Insufficient quantity available for ${equipmentItem.name}`);
      }

      // Update equipment quantity and rentedCount
      equipmentItem.quantity -= item.quantity;
      equipmentItem.rentedCount += item.quantity;
      await equipmentItem.save();

      return {
        equipment: item.equipmentId,
        quantity: item.quantity,
        price: equipmentItem.price
      };
    });

    // Wait for all equipment validations and updates
    const processedEquipment = await Promise.all(equipmentPromises);

    // Add equipment to event
    event.equipment = processedEquipment;
    await event.save();

    res.status(200).json({
      status: "success",
      message: "Equipment added to event successfully",
      data: event
    });
  } catch (error) {
    // If there's an error, we should rollback any equipment quantity changes
    // This would be a good place to implement a transaction
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// Remove equipment from event
const removeEquipmentFromEvent = async (req, res) => {
  try {
    const { eventId, equipmentId } = req.params;

    // Get the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found"
      });
    }

    // Check if user is authorized
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to modify this event"
      });
    }

    // Find the equipment in the event
    const equipmentItem = event.equipment.find(
      item => item.equipment.toString() === equipmentId
    );

    if (!equipmentItem) {
      return res.status(404).json({
        status: "error",
        message: "Equipment not found in event"
      });
    }

    // Return the quantity to the equipment inventory
    const equipment = await Equipment.findById(equipmentId);
    if (equipment) {
      equipment.quantity += equipmentItem.quantity;
      await equipment.save();
    }

    // Remove the equipment from the event
    event.equipment = event.equipment.filter(
      item => item.equipment.toString() !== equipmentId
    );
    await event.save();

    res.status(200).json({
      status: "success",
      message: "Equipment removed from event successfully",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// Update equipment quantity in event
const updateEventEquipmentQuantity = async (req, res) => {
  try {
    const { eventId, equipmentId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid quantity provided"
      });
    }

    // Get the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found"
      });
    }

    // Check if user is authorized
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to modify this event"
      });
    }

    // Find the equipment in the event
    const equipmentIndex = event.equipment.findIndex(
      item => item.equipment.toString() === equipmentId
    );

    if (equipmentIndex === -1) {
      return res.status(404).json({
        status: "error",
        message: "Equipment not found in event"
      });
    }

    const currentQuantity = event.equipment[equipmentIndex].quantity;
    const equipment = await Equipment.findById(equipmentId);

    if (!equipment) {
      return res.status(404).json({
        status: "error",
        message: "Equipment not found"
      });
    }

    // Calculate the quantity difference
    const quantityDiff = quantity - currentQuantity;
    
    // Check if the new quantity is available
    if (quantityDiff > equipment.quantity) {
      return res.status(400).json({
        status: "error",
        message: "Insufficient quantity available"
      });
    }

    // Update equipment inventory
    equipment.quantity -= quantityDiff;
    await equipment.save();

    // Update event equipment quantity
    event.equipment[equipmentIndex].quantity = quantity;
    await event.save();

    res.status(200).json({
      status: "success",
      message: "Equipment quantity updated successfully",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
};

// In the admin events controller
const getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: 'createdBy',
        select: 'email profile.name', // Add profile.name to the selection
        model: 'User'
      })
      .sort('-createdAt');

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createEvent, getEvents, updateEvent, deleteEvent, getEventById, duplicateEvent, getEventStatistics, getMyEvents, getAttendanceReport, addEquipmentToEvent, removeEquipmentFromEvent, updateEventEquipmentQuantity, getAdminEvents };

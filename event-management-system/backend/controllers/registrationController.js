const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const mongoose = require("mongoose"); 
const generateTicket = require("../utils/generateTicket");
const { 
  sendRegistrationConfirmation, 
  sendWaitlistNotification,
  sendSpotAvailableNotification 
} = require("../utils/sendEmail");
const { createNotification } = require("./notificationController");

// Helper function to generate unique ticket number
const generateUniqueTicketNumber = async (session) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const ticketNumber = `TKT-${timestamp}-${random}`;
  
  // Check if ticket number already exists
  const existingTicket = await Registration.findOne(
    { ticketNumber },
    null,
    { session }
  );
  
  if (existingTicket) {
    // If exists, try again recursively
    return generateUniqueTicketNumber(session);
  }
  
  return ticketNumber;
};

// Register for an event
const registerForEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(req.params.eventId).session(session);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      event: event._id,
      user: req.user._id
    }).session(session);

    if (existingRegistration) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event"
      });
    }

    // Check if event is full
    if (event.isFull() && !event.isWaitlistEnabled) {
      throw new Error("Event is full and waitlist is not enabled");
    }

    const ticketNumber = await generateUniqueTicketNumber(session);
    const registration = await Registration.create([{
      event: event._id,
      user: req.user._id,
      ticketNumber,
      status: event.isFull() ? 'waitlisted' : 'confirmed'
    }], { session });

    // Update event registration count
    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { 
        $inc: { 'stats.totalRegistrations': 1 },
        $addToSet: { registrations: registration[0]._id }
      },
      { new: true, session }
    ).populate('organizer', 'email profile.name');

    if (event.isFull()) {
      // Add to waitlist
      event.waitlist.push({ user: req.user._id });
      await event.save({ session });

      // Send waitlist notification
      if (req.user.notificationPreferences.email) {
        await sendWaitlistNotification(req.user.profile.email, event);
      }

      // Create in-app notification for waitlist
      await createNotification(
        req.user._id,
        'Added to Waitlist',
        `You have been added to the waitlist for ${event.name}`,
        'registration',
        event._id,
        registration[0]._id
      );
    } else {
      // Regular registration
      event.registrations.push(registration[0]._id);
      await event.save({ session });

      // Send confirmation email
      if (req.user.notificationPreferences.email) {
        await sendRegistrationConfirmation(req.user.profile.email, event, ticketNumber);
      }

      // Create in-app notification for successful registration
      await createNotification(
        req.user._id,
        'Registration Confirmed',
        `Your registration for ${event.name} has been confirmed`,
        'registration',
        event._id,
        registration[0]._id
      );

      // Create reminder notification if enabled
      if (req.user.notificationPreferences.eventReminders) {
        const eventDate = new Date(event.date);
        const reminderDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
        
        if (reminderDate > new Date()) {
          await createNotification(
            req.user._id,
            'Event Reminder',
            `Your event ${event.name} is tomorrow!`,
            'reminder',
            event._id,
            registration[0]._id
          );
        }
      }
    }

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      data: registration[0],
      updatedEvent
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get all registrations for logged in user
// @route   GET /api/registrations
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate("event")
      .sort("-createdAt");

    res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("Error in getMyRegistrations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching registrations",
      error: error.message,
    });
  }
};

// @desc    Get specific registration details
// @route   GET /api/registrations/:id
// @access  Private
const getRegistrationDetails = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate("event")
      .populate("user", "name email");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check if user is authorized to view this registration
    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this registration",
      });
    }

    res.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Error in getRegistrationDetails:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching registration details",
      error: error.message,
    });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    
    // Use atomic operation to prevent race conditions
    const updatedEvent = await Event.findByIdAndUpdate(
      registration.event,
      { 
        $inc: { 'stats.totalRegistrations': -1 },
        $pull: { registrations: registration._id }
      },
      { new: true }
    ).populate('organizer', 'email profile.name');

    res.status(200).json({
      success: true,
      updatedEvent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get registration ticket
// @route   GET /api/registrations/:id/ticket
// @access  Private
const getTicket = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'email profile.name'
      })
      .populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check if user is authorized to view this ticket
    if (registration.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this ticket",
      });
    }

    // Generate PDF ticket
    const pdfBuffer = await generateTicket(registration);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket_${registration.ticketNumber}.pdf`);
    
    // Send the PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error in getTicket:", error);
    res.status(500).json({
      success: false,
      message: "Error generating ticket",
      error: error.message,
    });
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getRegistrationDetails,
  getTicket
};

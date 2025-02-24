const Registration = require("../models/Registration");
const { createNotification } = require("../controllers/notificationController");
const { sendRegistrationConfirmation } = require("./sendEmail");

// Schedule reminders for an event registration
const scheduleEventReminders = async (registration, event, user) => {
  if (!user.notificationPreferences.eventReminders) return;

  const eventDate = new Date(event.date);
  const now = new Date();

  // Schedule 24-hour reminder
  const dayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
  if (dayBefore > now) {
    setTimeout(async () => {
      try {
        // Check if registration is still valid
        const currentReg = await Registration.findById(registration._id)
          .populate('event')
          .populate('user');

        if (currentReg && currentReg.status === 'confirmed') {
          // Send reminder notification
          await createNotification(
            user._id,
            'Event Tomorrow',
            `Don't forget! ${event.name} is tomorrow at ${event.timeFrame.startTime}`,
            'reminder',
            event._id,
            registration._id
          );

          // Send email reminder if enabled
          if (user.notificationPreferences.email) {
            await sendRegistrationConfirmation(
              user.profile.email,
              event,
              registration.ticketNumber,
              true // isReminder flag
            );
          }
        }
      } catch (error) {
        console.error('Error sending reminder:', error);
      }
    }, dayBefore.getTime() - now.getTime());
  }

  // Schedule 1-hour reminder
  const hourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
  if (hourBefore > now) {
    setTimeout(async () => {
      try {
        // Check if registration is still valid
        const currentReg = await Registration.findById(registration._id)
          .populate('event')
          .populate('user');

        if (currentReg && currentReg.status === 'confirmed') {
          // Send reminder notification
          await createNotification(
            user._id,
            'Event Starting Soon',
            `${event.name} starts in 1 hour at ${event.timeFrame.startTime}`,
            'reminder',
            event._id,
            registration._id
          );
        }
      } catch (error) {
        console.error('Error sending reminder:', error);
      }
    }, hourBefore.getTime() - now.getTime());
  }
};

module.exports = { scheduleEventReminders }; 
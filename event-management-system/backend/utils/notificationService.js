const InAppNotification = require("../models/InAppNotification");




// Function to send an in-app notification (by saving a notification to the database)
const sendInAppNotification = async (userId, message) => {
  try {
    const notification = new InAppNotification({
      user: userId,
      message,
    });
    await notification.save();
    console.log("In-app notification saved for user:", userId);
    return true;
  } catch (error) {
    console.error("Error saving in-app notification:", error);
    return false;
  }
};

const createRoleChangeNotification = async (user, newRole) => {
  await InAppNotification.create({
    user: user._id,
    type: 'role_change',
    message: `Your role has been changed to ${newRole.toUpperCase()}`,
    metadata: { previousRole: user.role }
  });
};

module.exports = { sendInAppNotification, createRoleChangeNotification };

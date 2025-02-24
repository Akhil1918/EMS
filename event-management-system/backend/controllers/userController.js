const Registration = require('../models/Registration');

const getCurrentUserStats = async (req, res) => {
  try {
    const stats = await Registration.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event'
        }
      },
      {
        $unwind: '$event'
      },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          cancellations: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          upcomingEvents: {
            $sum: {
              $cond: [{ $gt: ['$event.date', new Date()] }, 1, 0]
            }
          },
          pastEvents: {
            $sum: {
              $cond: [{ $lt: ['$event.date', new Date()] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRegistrations: stats[0]?.totalRegistrations || 0,
        cancellations: stats[0]?.cancellations || 0,
        upcomingEvents: stats[0]?.upcomingEvents || 0,
        pastEvents: stats[0]?.pastEvents || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats'
    });
  }
};

module.exports = {
  getCurrentUserStats
}; 
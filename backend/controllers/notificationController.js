const Notification = require('../models/Notification');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    let notifications;
    if (global.dbConnected) {
      notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(50);
    } else {
      notifications = fallbackDb.getNotifications();
    }
    res.json({ status: 'success', notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error retrieving notifications' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    if (global.dbConnected) {
      await Notification.updateMany({ read: false }, { read: true });
    } else {
      fallbackDb.markAllNotificationsRead();
    }
    res.json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error updating notifications' });
  }
};

module.exports = {
  getNotifications,
  markAllAsRead
};

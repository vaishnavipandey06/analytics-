const Setting = require('../models/Setting');
const AuditLog = require('../models/AuditLog');
const fallbackDb = require('../utils/fallbackDb');

// @desc    Get dashboard configurations
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings;
    if (global.dbConnected) {
      settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create({});
      }
    } else {
      settings = fallbackDb.getSettings();
    }

    res.json({ status: 'success', settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error retrieving settings' });
  }
};

// @desc    Update dashboard configuration parameters
// @route   PUT /api/settings
// @access  Private (Admin Only)
const updateSettings = async (req, res) => {
  try {
    const { churnThreshold, emailNotifications, defaultModel, theme, alertEmail } = req.body;

    const fieldsToUpdate = {};
    if (churnThreshold !== undefined) fieldsToUpdate.churnThreshold = parseInt(churnThreshold);
    if (emailNotifications !== undefined) fieldsToUpdate.emailNotifications = emailNotifications;
    if (defaultModel !== undefined) fieldsToUpdate.defaultModel = defaultModel;
    if (theme !== undefined) fieldsToUpdate.theme = theme;
    if (alertEmail !== undefined) fieldsToUpdate.alertEmail = alertEmail;
    fieldsToUpdate.updatedAt = new Date();

    let updated;
    if (global.dbConnected) {
      updated = await Setting.findOneAndUpdate({}, fieldsToUpdate, { new: true, upsert: true });
      await AuditLog.create({
        action: 'UPDATE_SETTINGS',
        details: `Updated platform settings: ${JSON.stringify(fieldsToUpdate)}.`,
        userId: req.user.id || req.user._id,
        username: req.user.name
      });
    } else {
      updated = fallbackDb.saveSettings(fieldsToUpdate);
      fallbackDb.saveAuditLog({
        action: 'UPDATE_SETTINGS',
        details: `Updated platform settings: ${JSON.stringify(fieldsToUpdate)}.`,
        userId: req.user.id,
        username: req.user.name
      });
    }

    res.json({ status: 'success', settings: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error updating settings' });
  }
};

// @desc    Retrieve system audit log records
// @route   GET /api/settings/logs
// @access  Private (Admin Only)
const getAuditLogs = async (req, res) => {
  try {
    let logs;
    if (global.dbConnected) {
      logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    } else {
      logs = fallbackDb.getAuditLogs();
    }
    res.json({ status: 'success', logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error retrieving logs' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getAuditLogs
};

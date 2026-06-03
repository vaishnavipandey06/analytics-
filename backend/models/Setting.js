const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  churnThreshold: {
    type: Number,
    default: 80 // Alert when probability exceeds this
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  defaultModel: {
    type: String,
    enum: ['rf', 'lr'],
    default: 'rf'
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'dark'
  },
  alertEmail: {
    type: String,
    default: 'admin@churnvision.com'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Setting', SettingSchema);

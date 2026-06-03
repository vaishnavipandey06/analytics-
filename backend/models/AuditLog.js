const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  userId: {
    type: String, // String representation or user reference
    default: 'System'
  },
  username: {
    type: String,
    default: 'System'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);

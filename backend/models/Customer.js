const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['Basic', 'Standard', 'Premium'],
    required: true
  },
  monthlyCharges: {
    type: Number,
    required: true
  },
  totalCharges: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number,
    required: true // in months
  },
  supportTickets: {
    type: Number,
    default: 0
  },
  lastLoginDate: {
    type: Date,
    default: Date.now
  },
  usageFrequency: {
    type: Number,
    default: 0 // logins or activities per month
  },
  churnStatus: {
    type: Number,
    enum: [0, 1], // 0: Active, 1: Churned
    default: 0
  },
  churnProbability: {
    type: Number,
    default: 0.0 // percentage
  },
  riskLevel: {
    type: String,
    enum: ['Low Risk', 'Medium Risk', 'High Risk'],
    default: 'Low Risk'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Customer', CustomerSchema);

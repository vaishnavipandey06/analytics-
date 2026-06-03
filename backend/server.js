const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to Database (with automatic fallback to JSON if missing)
connectDB();

// API Route Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/ml', require('./routes/mlRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Root Status Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    appName: 'ChurnVision API Service',
    database: global.dbConnected ? 'MongoDB Atlas' : 'JSON Fallback Database',
    version: '1.0.0'
  });
});

// Custom 404 Route
app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error occurred' : err.message
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 ChurnVision API Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  console.log(`📡 Database Mode: ${global.dbConnected ? 'MongoDB' : 'Offline JSON Files'}`);
});

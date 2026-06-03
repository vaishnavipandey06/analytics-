const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/churnvision';
  
  try {
    mongoose.set('strictQuery', false);
    // Set a short timeout (3 seconds) for quick fallback check
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    
    isConnected = true;
    global.dbConnected = true;
    console.log('✨ MongoDB Connected successfully.');
  } catch (err) {
    global.dbConnected = false;
    console.error('⚠️ MongoDB Connection Failed. Using JSON-file database fallback for seamless execution.');
  }
};

module.exports = connectDB;

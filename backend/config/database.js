const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI (or MONGO_URI) in environment');
  }
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined,
  });
  console.log('MongoDB connected');
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    if (error.code === 'ESERVFAIL' || error.message.includes('querySrv')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Check if your MongoDB Atlas cluster is paused (free tier pauses after inactivity)');
      console.error('   2. Go to https://cloud.mongodb.com and resume your cluster if needed');
      console.error('   3. Verify your connection string in MongoDB Atlas dashboard');
      console.error('   4. Check your network connectivity');
    }
    
    // Don't exit immediately - let nodemon keep running so you can fix the issue
    console.error('\n⚠️  Server will continue running, but database operations will fail until connection is restored.\n');
  }
};

module.exports = connectDB;
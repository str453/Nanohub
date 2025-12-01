// Script to check order dates and IDs for debugging
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function checkOrderDates() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 CHECKING ORDER DATES AND IDs');
    console.log('='.repeat(80) + '\n');

    const now = new Date();
    console.log(`Current date/time: ${now.toISOString()}\n`);

    // Get all orders sorted by _id (newest first) - same as the API
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .limit(10)
      .select('_id orderedAt createdAt status totalPrice');

    console.log(`📋 Top 10 orders by _id (newest first):\n`);

    orders.forEach((order, index) => {
      const orderId = order._id.toString();
      const orderedAt = order.orderedAt ? new Date(order.orderedAt) : null;
      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      
      // Extract timestamp from ObjectId (first 8 characters are timestamp)
      const objectIdTimestamp = new Date(parseInt(orderId.substring(0, 8), 16) * 1000);
      
      console.log(`${index + 1}. Order #${orderId.slice(-8).toUpperCase()}`);
      console.log(`   ObjectId timestamp: ${objectIdTimestamp.toISOString()}`);
      console.log(`   orderedAt: ${orderedAt ? orderedAt.toISOString() : 'N/A'}`);
      console.log(`   createdAt: ${createdAt ? createdAt.toISOString() : 'N/A'}`);
      console.log(`   Status: ${order.status || 'N/A'}`);
      console.log(`   Total: $${(order.totalPrice || 0).toFixed(2)}`);
      
      // Check if dates are in future
      if (orderedAt && orderedAt > now) {
        console.log(`   ⚠️  orderedAt is in the FUTURE!`);
      }
      if (createdAt && createdAt > now) {
        console.log(`   ⚠️  createdAt is in the FUTURE!`);
      }
      console.log('');
    });

    // Check for orders with future dates
    const futureOrderedAt = await Order.countDocuments({ orderedAt: { $gt: now } });
    const futureCreatedAt = await Order.countDocuments({ createdAt: { $gt: now } });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Orders with future orderedAt: ${futureOrderedAt}`);
    console.log(`   Orders with future createdAt: ${futureCreatedAt}`);
    console.log(`   Total orders: ${await Order.countDocuments({})}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.\n');
    process.exit(0);
  }
}

// Run the check
checkOrderDates();


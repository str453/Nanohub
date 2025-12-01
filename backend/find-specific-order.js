// Script to find a specific order by ID
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function findOrder() {
  try {
    // Search for orders ending in 95F26B50
    const orders = await Order.find({});
    
    const targetOrder = orders.find(o => 
      o._id.toString().toUpperCase().endsWith('95F26B50')
    );

    if (targetOrder) {
      const orderId = targetOrder._id.toString();
      const orderedAt = targetOrder.orderedAt ? new Date(targetOrder.orderedAt) : null;
      const createdAt = targetOrder.createdAt ? new Date(targetOrder.createdAt) : null;
      const objectIdTimestamp = new Date(parseInt(orderId.substring(0, 8), 16) * 1000);
      
      console.log(`\nOrder #${orderId.slice(-8).toUpperCase()}:`);
      console.log(`   ObjectId timestamp: ${objectIdTimestamp.toISOString()}`);
      console.log(`   orderedAt: ${orderedAt ? orderedAt.toISOString() : 'N/A'}`);
      console.log(`   createdAt: ${createdAt ? createdAt.toISOString() : 'N/A'}`);
      console.log(`   Status: ${targetOrder.status || 'N/A'}`);
      console.log(`   Total: $${(targetOrder.totalPrice || 0).toFixed(2)}\n`);
    } else {
      console.log('Order not found. Searching for similar...');
      // Show orders with similar endings
      orders.filter(o => o._id.toString().toUpperCase().includes('95F26')).slice(0, 5).forEach(o => {
        console.log(`Order #${o._id.toString().slice(-8).toUpperCase()}`);
      });
    }

    // Also get the newest orders to compare
    console.log('\nNewest 5 orders by _id:');
    const newest = await Order.find({}).sort({ _id: -1 }).limit(5);
    newest.forEach((o, i) => {
      const ts = new Date(parseInt(o._id.toString().substring(0, 8), 16) * 1000);
      console.log(`${i+1}. Order #${o._id.toString().slice(-8).toUpperCase()} - Created: ${ts.toISOString()}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

findOrder();


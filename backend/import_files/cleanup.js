require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product.js');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for cleanup');
    } catch (error) {
        console.error(' Database connection error:', error);
        process.exit(1);
    }
};

const cleanupProducts = async () => {
    await connectDB();
    
    try {
        // Delete GPUs, CPUs, and Monitors
        const deleteResult = await Product.deleteMany({
            category: { $in: ['GPU', 'CPU', 'Monitor'] }
        });
        
        console.log(` Deleted ${deleteResult.deletedCount} total products`);
        console.log('Deleted categories: GPU, CPU, Monitor');
        
        // Optional: Show remaining products by category
        const remaining = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        
        console.log('\n Remaining products by category:');
        remaining.forEach(item => {
            console.log(`   ${item._id}: ${item.count} products`);
        });
        
        mongoose.connection.close();
    } catch (error) {
        console.error(' Cleanup error:', error);
    }
};

cleanupProducts();
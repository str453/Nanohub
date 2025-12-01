require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const getProductModel = require('../models/Product.js');

async function addDiscounts() {
  try {
    // Connect to database
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('❌ MONGODB_URI not found in .env');
      console.log('Please set MONGODB_URI environment variable');
      process.exit(1);
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected to MongoDB');

    const Product = getProductModel(mongoose);

    // Find some GPU products and add 20% discount
    const gpuProducts = await Product.find({ category: 'GPU' }).limit(3);
    
    if (gpuProducts.length === 0) {
      console.log('❌ No GPU products found');
      process.exit(1);
    }

    console.log(`\nFound ${gpuProducts.length} GPU products to update with discount:`);

    for (let product of gpuProducts) {
      const oldPrice = product.price;
      
      product.discount = {
        isActive: true,
        percentage: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };

      await product.save();
      
      const discountedPrice = (oldPrice * (1 - 20 / 100)).toFixed(2);
      console.log(`  ✓ ${product.name}`);
      console.log(`    Original: $${oldPrice.toFixed(2)} → Discounted: $${discountedPrice}`);
    }

    console.log('\n✓ Successfully added discounts!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDiscounts();

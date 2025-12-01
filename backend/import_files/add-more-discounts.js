require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const getProductModel = require('../models/Product.js');

async function addMoreDiscounts() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('❌ MONGODB_URI not found');
      process.exit(1);
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✓ Connected to MongoDB\n');

    const Product = getProductModel(mongoose);

    // Find products by name pattern
    const gpuProducts = await Product.find({ category: 'GPU' }).limit(10);
    
    console.log(`Found ${gpuProducts.length} GPU products:\n`);

    for (let product of gpuProducts) {
      // Check if already has discount
      if (!product.discount || !product.discount.isActive) {
        const oldPrice = product.price;
        
        product.discount = {
          isActive: true,
          percentage: 20,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        await product.save();
        
        const discountedPrice = (oldPrice * 0.8).toFixed(2);
        console.log(`✓ ${product.name}`);
        console.log(`  $${oldPrice.toFixed(2)} → $${discountedPrice} (20% off)\n`);
      } else {
        console.log(`⊘ ${product.name} (already has discount)\n`);
      }
    }

    console.log('✓ Discounts applied successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addMoreDiscounts();

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const getProductModel = require('../models/Product.js');

async function findAndDiscountProduct() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('❌ MONGODB_URI not found');
      process.exit(1);
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✓ Connected to MongoDB\n');

    const Product = getProductModel(mongoose);

    // Search for the specific product
    const product = await Product.findOne({ 
      name: /STRIX GTX 1080/i 
    });
    
    if (product) {
      console.log('✓ Found product:', product.name);
      
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
        console.log(`\n✓ Added 20% discount:`);
        console.log(`  $${oldPrice.toFixed(2)} → $${discountedPrice}\n`);
      } else {
        console.log('⊘ Product already has discount\n');
      }
    } else {
      console.log('❌ Product not found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findAndDiscountProduct();

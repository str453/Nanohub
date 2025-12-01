require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const getProductModel = require('../models/Product.js');

async function checkDiscounts() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('❌ MONGODB_URI not found');
      process.exit(1);
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✓ Connected to MongoDB\n');

    const Product = getProductModel(mongoose);

    // Find one product with discount
    const productWithDiscount = await Product.findOne({ 'discount.isActive': true });
    
    if (productWithDiscount) {
      console.log('✓ Found product with discount:');
      console.log('  Name:', productWithDiscount.name);
      console.log('  Price:', productWithDiscount.price);
      console.log('  Discount:', JSON.stringify(productWithDiscount.discount, null, 2));
    } else {
      console.log('❌ No products with active discounts found');
      
      // Check if any products have discount field at all
      const anyDiscount = await Product.findOne({ discount: { $exists: true } });
      if (anyDiscount) {
        console.log('\n✓ Found product with discount field:');
        console.log('  Name:', anyDiscount.name);
        console.log('  Discount:', JSON.stringify(anyDiscount.discount, null, 2));
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDiscounts();

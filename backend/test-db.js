// Simple test script to query MongoDB and verify connection
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Test queries
async function testDatabase() {
  try {
    console.log('\n📊 Running Database Tests...\n');

    // Test 1: Count all products
    const totalProducts = await Product.countDocuments();
    console.log(`✅ Total products in database: ${totalProducts}`);

    // Test 2: Get all CPUs
    const cpus = await Product.find({ category: 'CPU' });
    console.log(`✅ Found ${cpus.length} CPUs`);
    if (cpus.length > 0) {
      console.log('   Example CPU:', cpus[0].name);
    }

    // Test 3: Get all GPUs
    const gpus = await Product.find({ category: 'GPU' });
    console.log(`✅ Found ${gpus.length} GPUs`);
    if (gpus.length > 0) {
      console.log('   Example GPU:', gpus[0].name);
    }

    // Test 4: Get all Monitors
    const monitors = await Product.find({ category: 'Monitor' });
    console.log(`✅ Found ${monitors.length} Monitors`);
    if (monitors.length > 0) {
      console.log('   Example Monitor:', monitors[0].name);
    }

    // Test 5: Get all Motherboards
    const motherboards = await Product.find({ category: 'Motherboard' });
    console.log(`✅ Found ${motherboards.length} Motherboards`);
    if (motherboards.length > 0) {
      console.log('   Example Motherboard:', motherboards[0].name);
    }

    // Test 6: Get all RAM
    const ram = await Product.find({ category: 'RAM' });
    console.log(`✅ Found ${ram.length} RAM modules`);
    if (ram.length > 0) {
      console.log('   Example RAM:', ram[0].name);
    }

    // Test 7: Search for a specific product
    const searchTerm = 'Intel';
    const searchResults = await Product.find({ 
      name: new RegExp(searchTerm, 'i') 
    }).limit(5);
    console.log(`\n✅ Search results for "${searchTerm}": ${searchResults.length} found`);
    searchResults.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
    });

    // Test 8: Get the most expensive product
    const mostExpensive = await Product.findOne().sort({ price: -1 });
    console.log(`\n💰 Most expensive product: ${mostExpensive.name} - $${mostExpensive.price}`);

    // Test 9: Get the cheapest product
    const cheapest = await Product.findOne().sort({ price: 1 });
    console.log(`💵 Cheapest product: ${cheapest.name} - $${cheapest.price}`);

    // Test 10: Top 10 Most Expensive CPUs
    console.log('\n🏆 TOP 10 MOST EXPENSIVE CPUs:');
    const top10CPUs = await Product.find({ category: 'CPU' })
      .sort({ price: -1 })
      .limit(10);
    top10CPUs.forEach((cpu, index) => {
      console.log(`   ${index + 1}. ${cpu.name} - $${cpu.price}`);
    });

    // Test 11: Top 10 Most Expensive GPUs
    console.log('\n🎮 TOP 10 MOST EXPENSIVE GPUs:');
    const top10GPUs = await Product.find({ category: 'GPU' })
      .sort({ price: -1 })
      .limit(10);
    top10GPUs.forEach((gpu, index) => {
      console.log(`   ${index + 1}. ${gpu.name} - $${gpu.price}`);
    });

    // Test 12: Top 5 Cheapest Monitors
    console.log('\n🖥️ TOP 5 CHEAPEST MONITORS:');
    const cheapMonitors = await Product.find({ category: 'Monitor' })
      .sort({ price: 1 })
      .limit(5);
    cheapMonitors.forEach((monitor, index) => {
      console.log(`   ${index + 1}. ${monitor.name} - $${monitor.price}`);
    });

    // Test 13: Products in specific price range ($200-$500)
    const midRange = await Product.find({ 
      price: { $gte: 200, $lte: 500 } 
    });
    console.log(`\n💰 Products between $200-$500: ${midRange.length} found`);

    // Test 14: Average price by category
    console.log('\n📊 AVERAGE PRICE BY CATEGORY:');
    const categories = ['CPU', 'GPU', 'Monitor', 'Motherboard', 'RAM'];
    for (const cat of categories) {
      const products = await Product.find({ category: cat });
      if (products.length > 0) {
        const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
        console.log(`   ${cat}: $${avgPrice.toFixed(2)} (${products.length} items)`);
      }
    }

    // Test 15: Products by brand (example: get all AMD products)
    const amdProducts = await Product.find({ 
      brand: new RegExp('AMD', 'i') 
    });
    console.log(`\n🔴 AMD Products: ${amdProducts.length} found`);
    if (amdProducts.length > 0) {
      console.log('   Examples:');
      amdProducts.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name} - $${p.price}`);
      });
    }

    // Test 16: Products by brand (example: get all NVIDIA products)
    const nvidiaProducts = await Product.find({ 
      brand: new RegExp('NVIDIA', 'i') 
    });
    console.log(`\n🟢 NVIDIA Products: ${nvidiaProducts.length} found`);
    if (nvidiaProducts.length > 0) {
      console.log('   Examples:');
      nvidiaProducts.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name} - $${p.price}`);
      });
    }

    // Test 17: Find products with "gaming" in name or description
    const gamingProducts = await Product.find({
      $or: [
        { name: new RegExp('gaming', 'i') },
        { description: new RegExp('gaming', 'i') }
      ]
    });
    console.log(`\n🎯 Products with "gaming": ${gamingProducts.length} found`);

    // Test 18: Get 5 random products
    console.log('\n🎲 5 RANDOM PRODUCTS:');
    const randomProducts = await Product.aggregate([
      { $sample: { size: 5 } }
    ]);
    randomProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price} (${product.category})`);
    });

    // Test 19: Count products by category
    console.log('\n📈 PRODUCT COUNT BY CATEGORY:');
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat });
      console.log(`   ${cat}: ${count} products`);
    }

    // Test 20: Most expensive item in each category
    console.log('\n👑 MOST EXPENSIVE IN EACH CATEGORY:');
    for (const cat of categories) {
      const expensive = await Product.findOne({ category: cat }).sort({ price: -1 });
      if (expensive) {
        console.log(`   ${cat}: ${expensive.name} - $${expensive.price}`);
      }
    }

    console.log('\n✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Error testing database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  }
}

// Run tests
testDatabase();


// Script to compare MongoDB database with scraped_photos.csv
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const csv = require('csv-parser');

// Category name mapping from scraped_photos to MongoDB
const categoryMap = {
  'CPUs': 'CPU',
  'GPUs': 'GPU',
  'Monitors': 'Monitor',
  'Motherboards': 'Motherboard',
  'RAMs': 'RAM',
  'HDDs': 'Storage',
  'SSDs': 'Storage',
  'Power_Supplys': 'PSU',
  'CPU_Coolers': 'Cooling',
  'Towers': 'Case'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function compareDbToCsv() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 COMPARING DATABASE TO SCRAPED_PHOTOS.CSV');
    console.log('='.repeat(80) + '\n');

    // Step 1: Get all products from MongoDB
    console.log('📦 Loading products from MongoDB...');
    const dbProducts = await Product.find({}).select('name category');
    console.log(`   Found ${dbProducts.length} products in database\n`);

    // Create a Set of database product names for quick lookup
    const dbProductSet = new Set();
    const dbProductsByCategory = {};
    
    dbProducts.forEach(p => {
      const key = `${p.name}|${p.category}`;
      dbProductSet.add(key);
      
      if (!dbProductsByCategory[p.category]) {
        dbProductsByCategory[p.category] = [];
      }
      dbProductsByCategory[p.category].push(p.name);
    });

    // Step 2: Load scraped_photos.csv
    console.log('📸 Loading scraped_photos.csv...');
    const csvProducts = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream('./csvFiles/scraped_photos.csv')
        .pipe(csv())
        .on('data', (row) => {
          if (row.productName && row.productName.trim() !== '') {
            csvProducts.push({
              name: row.productName.trim(),
              category: categoryMap[row.category] || row.category,
              originalCategory: row.category,
              hasImages: row.image_urls && row.image_urls !== 'nan' && row.image_urls.trim() !== ''
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`   Found ${csvProducts.length} products in CSV\n`);

    // Create a Set of CSV product names
    const csvProductSet = new Set();
    const csvProductsByCategory = {};
    
    csvProducts.forEach(p => {
      const key = `${p.name}|${p.category}`;
      csvProductSet.add(key);
      
      if (!csvProductsByCategory[p.category]) {
        csvProductsByCategory[p.category] = [];
      }
      csvProductsByCategory[p.category].push(p.name);
    });

    // Step 3: Find products in DB but NOT in CSV
    console.log('='.repeat(80));
    console.log('🔴 PRODUCTS IN DATABASE BUT NOT IN CSV (missing images):');
    console.log('='.repeat(80));
    
    const inDbNotInCsv = [];
    dbProducts.forEach(p => {
      const key = `${p.name}|${p.category}`;
      if (!csvProductSet.has(key)) {
        inDbNotInCsv.push({ name: p.name, category: p.category });
      }
    });

    if (inDbNotInCsv.length > 0) {
      // Group by category
      const grouped = {};
      inDbNotInCsv.forEach(p => {
        if (!grouped[p.category]) grouped[p.category] = [];
        grouped[p.category].push(p.name);
      });

      console.log(`\n⚠️  Total: ${inDbNotInCsv.length} products in database have NO images in CSV\n`);
      
      Object.keys(grouped).sort().forEach(category => {
        console.log(`\n📁 ${category} (${grouped[category].length}):`);
        grouped[category].slice(0, 10).forEach(name => {
          console.log(`   - ${name}`);
        });
        if (grouped[category].length > 10) {
          console.log(`   ... and ${grouped[category].length - 10} more`);
        }
      });
    } else {
      console.log('✅ All database products have images in CSV!');
    }

    // Step 4: Find products in CSV but NOT in DB
    console.log('\n\n' + '='.repeat(80));
    console.log('🔵 PRODUCTS IN CSV BUT NOT IN DATABASE (not imported):');
    console.log('='.repeat(80));
    
    const inCsvNotInDb = [];
    csvProducts.forEach(p => {
      const key = `${p.name}|${p.category}`;
      if (!dbProductSet.has(key)) {
        inCsvNotInDb.push({ 
          name: p.name, 
          category: p.category,
          originalCategory: p.originalCategory 
        });
      }
    });

    if (inCsvNotInDb.length > 0) {
      // Group by category
      const grouped = {};
      inCsvNotInDb.forEach(p => {
        if (!grouped[p.category]) grouped[p.category] = [];
        grouped[p.category].push(p.name);
      });

      console.log(`\n⚠️  Total: ${inCsvNotInDb.length} products have images but are NOT in database\n`);
      
      Object.keys(grouped).sort().forEach(category => {
        console.log(`\n📁 ${category} (${grouped[category].length}):`);
        grouped[category].slice(0, 10).forEach(name => {
          console.log(`   - ${name}`);
        });
        if (grouped[category].length > 10) {
          console.log(`   ... and ${grouped[category].length - 10} more`);
        }
      });
    } else {
      console.log('✅ All CSV products are in the database!');
    }

    // Step 5: Summary Statistics
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`📦 Database products: ${dbProducts.length}`);
    console.log(`📸 CSV products (with images): ${csvProducts.length}`);
    console.log(`✅ Products in BOTH: ${dbProducts.length - inDbNotInCsv.length}`);
    console.log(`🔴 In DB but NOT in CSV: ${inDbNotInCsv.length}`);
    console.log(`🔵 In CSV but NOT in DB: ${inCsvNotInDb.length}`);

    // Step 6: Category breakdown
    console.log('\n📊 BREAKDOWN BY CATEGORY:');
    console.log('-'.repeat(80));
    console.log(`${'Category'.padEnd(20)} ${'In DB'.padEnd(10)} ${'In CSV'.padEnd(10)} ${'Missing Images'.padEnd(15)}`);
    console.log('-'.repeat(80));
    
    const allCategories = new Set([
      ...Object.keys(dbProductsByCategory),
      ...Object.keys(csvProductsByCategory)
    ]);

    allCategories.forEach(category => {
      const dbCount = (dbProductsByCategory[category] || []).length;
      const csvCount = (csvProductsByCategory[category] || []).length;
      const missing = dbCount - csvCount;
      
      console.log(
        `${category.padEnd(20)} ${dbCount.toString().padEnd(10)} ${csvCount.toString().padEnd(10)} ${missing.toString().padEnd(15)}`
      );
    });

    // Save detailed reports
    if (inDbNotInCsv.length > 0) {
      const report = inDbNotInCsv.map(p => `${p.category},${p.name}`).join('\n');
      fs.writeFileSync('./csvFiles/products_in_db_missing_images.txt', 
        'category,product_name\n' + report);
      console.log('\n💾 Saved detailed report: products_in_db_missing_images.txt');
    }

    if (inCsvNotInDb.length > 0) {
      const report = inCsvNotInDb.map(p => `${p.category},${p.name}`).join('\n');
      fs.writeFileSync('./csvFiles/products_in_csv_not_in_db.txt', 
        'category,product_name\n' + report);
      console.log('💾 Saved detailed report: products_in_csv_not_in_db.txt');
    }

  } catch (error) {
    console.error('❌ Error during comparison:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.\n');
    process.exit(0);
  }
}

// Run the comparison
compareDbToCsv();


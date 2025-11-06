// Complete cleanup and import script with images
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const csv = require('csv-parser');

// Category name mapping
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

// Load scraped photos into memory
async function loadScrapedPhotos() {
  const photos = {};
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('./csvFiles/scraped_photos.csv')
      .pipe(csv())
      .on('data', (row) => {
        if (row.productName && row.productName.trim() !== '' && row.image_urls && row.image_urls !== 'nan') {
          const category = categoryMap[row.category] || row.category;
          const key = `${row.productName.trim()}|${category}`;
          
          // Parse image URLs
          const imageUrls = row.image_urls.split('|').filter(url => url && url.trim() !== '');
          
          photos[key] = {
            name: row.productName.trim(),
            category: category,
            imageUrls: imageUrls,
            images: imageUrls.map((url, idx) => ({
              url: url.trim(),
              alt: `${row.productName} - Image ${idx + 1}`
            }))
          };
        }
      })
      .on('end', () => resolve(photos))
      .on('error', reject);
  });
}

// Load product data from CSV files
async function loadProductsFromCsv(filename, category) {
  const products = [];
  const csvPath = `./csvFiles/${filename}`;
  
  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️  File not found: ${csvPath}`);
    return products;
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.Name && row.Name.trim() !== '') {
          products.push({
            name: row.Name.trim(),
            price: parseFloat(row.Price?.replace(/[^0-9.]/g, '')) || 0,
            brand: row.Producer || 'Unknown',
            category: category,
            description: row.Name,
            stockQuantity: 10,
            inStock: true
          });
        }
      })
      .on('end', () => resolve(products))
      .on('error', reject);
  });
}

async function main() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 COMPLETE DATABASE CLEANUP AND IMPORT');
    console.log('='.repeat(80) + '\n');

    // STEP 1: Load scraped photos
    console.log('📸 Loading scraped_photos.csv...');
    const scrapedPhotos = await loadScrapedPhotos();
    console.log(`✅ Loaded ${Object.keys(scrapedPhotos).length} products with images\n`);

    // STEP 2: Delete all RAM products
    console.log('='.repeat(80));
    console.log('🗑️  STEP 1: Deleting all RAM products...');
    console.log('='.repeat(80));
    const ramDeleteResult = await Product.deleteMany({ category: 'RAM' });
    console.log(`✅ Deleted ${ramDeleteResult.deletedCount} RAM products\n`);

    // STEP 3: Update existing products with images
    console.log('='.repeat(80));
    console.log('🖼️  STEP 2: Adding images to existing products...');
    console.log('='.repeat(80));
    
    const existingProducts = await Product.find({
      category: { $in: ['CPU', 'GPU', 'Monitor', 'Motherboard'] }
    });
    
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const product of existingProducts) {
      const key = `${product.name}|${product.category}`;
      const photoData = scrapedPhotos[key];
      
      if (photoData && photoData.images.length > 0) {
        product.images = photoData.images;
        await product.save();
        updatedCount++;
        console.log(`✅ Updated images: ${product.name}`);
      } else {
        notFoundCount++;
        console.log(`⚠️  No images found: ${product.name}`);
      }
    }

    console.log(`\n📊 Image Update Summary:`);
    console.log(`   ✅ Updated with images: ${updatedCount}`);
    console.log(`   ⚠️  No images found: ${notFoundCount}\n`);

    // STEP 4: Import new categories
    console.log('='.repeat(80));
    console.log('📦 STEP 3: Importing new categories with images...');
    console.log('='.repeat(80) + '\n');

    const categoriesToImport = [
      { file: 'HDD.csv', category: 'Storage', name: 'HDDs' },
      { file: 'SSD.csv', category: 'Storage', name: 'SSDs' },
      { file: 'CPU_Cooler.csv', category: 'Cooling', name: 'CPU Coolers' },
      { file: 'Towers.csv', category: 'Case', name: 'Cases/Towers' }
    ];

    let totalImported = 0;
    let totalSkipped = 0;

    for (const cat of categoriesToImport) {
      console.log(`\n📁 Importing ${cat.name} from ${cat.file}...`);
      
      const products = await loadProductsFromCsv(cat.file, cat.category);
      console.log(`   Found ${products.length} products in CSV`);
      
      let imported = 0;
      let skipped = 0;

      for (const productData of products) {
        const key = `${productData.name}|${productData.category}`;
        const photoData = scrapedPhotos[key];

        // Only import if we have images
        if (photoData && photoData.images.length > 0) {
          try {
            // Check if already exists
            const existing = await Product.findOne({
              name: productData.name,
              category: productData.category
            });

            if (!existing) {
              const newProduct = new Product({
                ...productData,
                images: photoData.images
              });
              await newProduct.save();
              imported++;
              console.log(`   ✅ Imported: ${productData.name}`);
            } else {
              skipped++;
            }
          } catch (error) {
            console.error(`   ❌ Error importing ${productData.name}:`, error.message);
          }
        } else {
          skipped++;
        }
      }

      console.log(`   📊 ${cat.name}: ${imported} imported, ${skipped} skipped (no images or duplicate)`);
      totalImported += imported;
      totalSkipped += skipped;
    }

    // FINAL SUMMARY
    console.log('\n\n' + '='.repeat(80));
    console.log('🎉 FINAL SUMMARY');
    console.log('='.repeat(80));
    
    const finalCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Products by Category:');
    let totalProducts = 0;
    finalCounts.forEach(cat => {
      console.log(`   ${cat._id.padEnd(15)}: ${cat.count}`);
      totalProducts += cat.count;
    });
    
    console.log(`\n📦 Total products in database: ${totalProducts}`);
    console.log(`✅ RAM products deleted: ${ramDeleteResult.deletedCount}`);
    console.log(`🖼️  Products updated with images: ${updatedCount}`);
    console.log(`📥 New products imported: ${totalImported}`);
    console.log(`⏭️  Products skipped: ${totalSkipped + notFoundCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.\n');
    process.exit(0);
  }
}

// Run the script
main();


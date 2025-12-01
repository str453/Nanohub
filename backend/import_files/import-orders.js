// Script to import orders from CSV file
require('dotenv').config();
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const User = require('./models/User');
const Product = require('./models/Product')(mongoose);
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function importOrders() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📦 IMPORTING ORDERS FROM CSV');
    console.log('='.repeat(80) + '\n');

    // First, load all users and products into memory for quick lookup
    const users = await User.find({});
    const products = await Product.find({});
    
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user.email.toLowerCase(), user._id);
      userMap.set(user.username?.toLowerCase(), user._id);
    });

    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product.name.toLowerCase(), product._id);
    });

    console.log(`📋 Loaded ${users.length} users and ${products.length} products for lookup\n`);

    const orders = [];
    let rowCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Expected CSV format:
    // user_email, product_name, quantity, price, street, city, state, zipcode, payment_method, is_paid, created_at
    // OR
    // username, product_name, quantity, price, street, city, state, zipcode, payment_method, is_paid, created_at

    await new Promise((resolve, reject) => {
      fs.createReadStream('./csvFiles/orders.csv')
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          
          try {
            // Find user by email or username
            const userIdentifier = (row.user_email || row.username || row.email || '').toLowerCase().trim();
            const userId = userMap.get(userIdentifier);
            
            if (!userId) {
              skippedCount++;
              errors.push({ row: rowCount, error: `User not found: ${userIdentifier}` });
              return;
            }

            // Find product by name
            const productName = (row.product_name || row.product || row.name || '').toLowerCase().trim();
            
            if (!productName) {
              skippedCount++;
              errors.push({ row: rowCount, error: 'Product name is empty' });
              return;
            }
            
            const productId = productMap.get(productName);
            
            if (!productId) {
              skippedCount++;
              // Try to find similar product names (case-insensitive partial match)
              const similarProducts = Array.from(productMap.keys()).filter(p => 
                p.includes(productName.substring(0, 10)) || productName.includes(p.substring(0, 10))
              );
              const errorMsg = similarProducts.length > 0 
                ? `Product not found: "${row.product_name || productName}". Similar: ${similarProducts.slice(0, 3).join(', ')}`
                : `Product not found: "${row.product_name || productName}"`;
              errors.push({ row: rowCount, error: errorMsg });
              return;
            }

            // Parse order data
            const quantity = parseInt(row.quantity || row.qty || '1', 10);
            const itemPrice = parseFloat(row.price || row.item_price || '0', 10);
            const itemsPrice = itemPrice * quantity;
            const taxPrice = parseFloat(row.tax || row.tax_price || (itemsPrice * 0.0875).toFixed(2), 10);
            const shippingPrice = parseFloat(row.shipping || row.shipping_price || '0', 10);
            const totalPrice = itemsPrice + taxPrice + shippingPrice;

            // Build order item
            const orderItem = {
              product: productId,
              name: row.product_name || row.product || row.name,
              price: itemPrice,
              quantity: quantity
            };

            // Build shipping address
            const shippingAddress = {
              street: row.street || row.address || row.address1 || '',
              city: row.city || '',
              state: row.state || '',
              zipCode: row.zipcode || row.zip || row.postal_code || '',
              country: row.country || 'US'
            };

            // Payment method
            const paymentMethod = (row.payment_method || row.payment || 'credit_card').toLowerCase();
            const validPaymentMethods = ['credit_card', 'debt_card', 'paypal', 'crypto'];
            const finalPaymentMethod = validPaymentMethods.includes(paymentMethod) 
              ? paymentMethod 
              : 'credit_card';

            // Payment result
            const paymentResult = row.is_paid === 'true' || row.is_paid === '1' || row.paid === 'true'
              ? {
                  id: row.payment_id || `payment_${Date.now()}_${rowCount}`,
                  status: 'succeeded',
                  update_time: row.paid_at || row.paid_date || new Date().toISOString(),
                  email_address: row.user_email || row.email || ''
                }
              : {};

            // Calculate shipping timeline
            // orderedAt: use created_at from CSV, or current date
            const orderedAt = row.created_at || row.created_date || row.date
              ? new Date(row.created_at || row.created_date || row.date)
              : new Date();

            // shippedAt: orderedAt + 3 days
            const shippedAt = new Date(orderedAt);
            shippedAt.setDate(shippedAt.getDate() + 3);

            // deliveredAt: shippedAt + 5 days (or use CSV value if provided)
            let deliveredAt;
            if (row.delivered_at || row.delivered_date) {
              deliveredAt = new Date(row.delivered_at || row.delivered_date);
            } else {
              deliveredAt = new Date(shippedAt);
              deliveredAt.setDate(deliveredAt.getDate() + 5);
            }

            // Calculate status based on current date
            const now = new Date();
            let status;
            if (now >= deliveredAt) {
              status = 'delivered';
            } else if (now >= shippedAt) {
              status = 'shipped';
            } else {
              status = 'ordered';
            }

            // Build order
            const orderData = {
              user: userId,
              orderItems: [orderItem],
              shippingAddress: shippingAddress,
              paymentMethod: finalPaymentMethod,
              paymentResult: paymentResult,
              itemsPrice: itemsPrice,
              taxPrice: taxPrice,
              shippingPrice: shippingPrice,
              totalPrice: totalPrice,
              isPaid: row.is_paid === 'true' || row.is_paid === '1' || row.paid === 'true',
              paidAt: row.is_paid === 'true' || row.is_paid === '1' 
                ? (row.paid_at ? new Date(row.paid_at) : new Date())
                : null,
              // Shipping timeline fields
              orderedAt: orderedAt,
              shippedAt: shippedAt,
              deliveredAt: deliveredAt,
              isDelivered: status === 'delivered',
              status: status
            };

            // Set createdAt if provided (for timestamps)
            if (row.created_at || row.created_date || row.date) {
              orderData.createdAt = new Date(row.created_at || row.created_date || row.date);
            }

            orders.push(orderData);
          } catch (error) {
            skippedCount++;
            errors.push({ row: rowCount, error: error.message });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📋 Read ${rowCount} rows from CSV`);
    console.log(`📦 Prepared ${orders.length} orders for import`);
    console.log(`⚠️  Skipped ${skippedCount} rows due to errors\n`);

    if (errors.length > 0 && errors.length <= 20) {
      console.log('⚠️  Errors encountered:');
      errors.forEach(err => {
        console.log(`   Row ${err.row}: ${err.error}`);
      });
      console.log('');
    }

    // Import orders
    if (orders.length > 0) {
      const result = await Order.insertMany(orders);
      console.log(`✅ Successfully imported ${result.length} orders\n`);
    } else {
      console.log('⚠️  No orders to import\n');
    }

    // Summary
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ isPaid: true });
    const deliveredOrders = await Order.countDocuments({ isDelivered: true });

    console.log('📊 FINAL DATABASE STATS:');
    console.log(`   Total orders: ${totalOrders}`);
    console.log(`   Paid orders: ${paidOrders}`);
    console.log(`   Delivered orders: ${deliveredOrders}`);

  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.\n');
    process.exit(0);
  }
}

// Run the import
importOrders();


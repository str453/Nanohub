// Script to generate random orders for testing
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./models/User');
const Product = require('./models/Product')(mongoose);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Helper function to roll dice (0-6)
function rollDice() {
  return Math.floor(Math.random() * 7); // 0 to 6
}

// Helper function to get random date between start and end
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to format date for CSV
function formatDateForCSV(date) {
  return date.toISOString();
}

// Calculate shipping timeline based on ordered date
function calculateShippingTimeline(orderedAt) {
  const shippedAt = new Date(orderedAt);
  shippedAt.setDate(shippedAt.getDate() + 3);
  
  const deliveredAt = new Date(shippedAt);
  deliveredAt.setDate(deliveredAt.getDate() + 5);
  
  const now = new Date();
  let status;
  if (now >= deliveredAt) {
    status = 'delivered';
  } else if (now >= shippedAt) {
    status = 'shipped';
  } else {
    status = 'ordered';
  }
  
  return { shippedAt, deliveredAt, status };
}

async function generateRandomOrders() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🎲 GENERATING RANDOM ORDERS');
    console.log('='.repeat(80) + '\n');

    // Get all customers (users, not admins) with their addresses
    const customers = await User.find({ role: 'user' }).select('email username address');
    console.log(`📋 Found ${customers.length} customers\n`);

    if (customers.length === 0) {
      console.log('⚠️  No customers found. Please import users first.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Get all products
    const products = await Product.find({}).select('name price');
    console.log(`📦 Found ${products.length} products\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Please import products first.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Date range: October 1, 2024 to today
    const startDate = new Date('2024-10-01T00:00:00Z');
    const endDate = new Date(); // Today
    console.log(`📅 Generating orders between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}\n`);

    const orders = [];
    let totalOrdersGenerated = 0;
    let totalItemsGenerated = 0;

    // Process each customer
    for (const customer of customers) {
      // Roll dice for number of orders (0-6)
      const numOrders = rollDice();
      
      if (numOrders === 0) {
        console.log(`   ${customer.email}: 0 orders (skipped)`);
        continue;
      }

      // Check if customer has address
      if (!customer.address || !customer.address.street || !customer.address.city) {
        console.log(`   ⚠️  ${customer.email}: Missing address - skipping`);
        continue;
      }

      console.log(`   ${customer.email}: ${numOrders} order(s)`);

      // Generate orders for this customer
      for (let orderNum = 0; orderNum < numOrders; orderNum++) {
        // Generate random order date
        const orderedAt = randomDate(startDate, endDate);
        const { shippedAt, deliveredAt, status } = calculateShippingTimeline(orderedAt);

        // Roll dice for number of items in this order (0-6)
        const numItems = rollDice();
        
        if (numItems === 0) {
          // Skip orders with 0 items
          continue;
        }

        // Randomly select products for this order
        const selectedProducts = [];
        const usedProductIndices = new Set();
        
        for (let i = 0; i < numItems; i++) {
          let productIndex;
          do {
            productIndex = Math.floor(Math.random() * products.length);
          } while (usedProductIndices.has(productIndex) && products.length > numItems);
          
          usedProductIndices.add(productIndex);
          const product = products[productIndex];
          
          // Random quantity (1-3)
          const quantity = Math.floor(Math.random() * 3) + 1;
          
          selectedProducts.push({
            product: product,
            quantity: quantity,
            price: product.price
          });
        }

        // Calculate order totals
        let itemsPrice = 0;
        selectedProducts.forEach(item => {
          itemsPrice += item.price * item.quantity;
        });
        
        const taxPrice = parseFloat((itemsPrice * 0.0875).toFixed(2)); // 8.75% tax
        const shippingPrice = 0; // Free shipping
        const totalPrice = itemsPrice + taxPrice + shippingPrice;

        // Use customer's actual address from database
        const street = customer.address?.street || '';
        const city = customer.address?.city || '';
        const state = customer.address?.state || '';
        const zipcode = customer.address?.zipcode || '';

        // Create order row for each product (one row per product in CSV)
        selectedProducts.forEach(item => {
          orders.push({
            user_email: customer.email,
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.price.toFixed(2),
            street: street,
            city: city,
            state: state,
            zipcode: zipcode,
            payment_method: ['credit_card', 'paypal', 'debt_card'][Math.floor(Math.random() * 3)],
            is_paid: 'true', // All generated orders are paid
            created_at: formatDateForCSV(orderedAt),
            // Additional info for reference
            _shipped_at: formatDateForCSV(shippedAt),
            _delivered_at: formatDateForCSV(deliveredAt),
            _status: status,
            _items_price: itemsPrice.toFixed(2),
            _tax_price: taxPrice.toFixed(2),
            _total_price: totalPrice.toFixed(2)
          });
          
          totalItemsGenerated += item.quantity;
        });

        totalOrdersGenerated++;
      }
    }

    console.log(`\n✅ Generated ${totalOrdersGenerated} orders with ${totalItemsGenerated} total items\n`);

    // Write to CSV file
    const csvPath = './csvFiles/generated_orders.csv';
    const csvHeader = 'user_email,product_name,quantity,price,street,city,state,zipcode,payment_method,is_paid,created_at\n';
    
    let csvContent = csvHeader;
    orders.forEach(order => {
      // Escape quotes in product names for CSV
      const escapedProductName = order.product_name.replace(/"/g, '""');
      csvContent += `${order.user_email},"${escapedProductName}",${order.quantity},${order.price},"${order.street}","${order.city}",${order.state},${order.zipcode},${order.payment_method},${order.is_paid},${order.created_at}\n`;
    });

    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`📄 CSV file written to: ${csvPath}`);
    console.log(`   Total rows: ${orders.length} (one row per product in order)`);
    console.log(`   Total orders: ${totalOrdersGenerated}`);

    // Also create a summary file with additional info
    const summaryPath = './csvFiles/generated_orders_summary.txt';
    let summary = 'ORDER GENERATION SUMMARY\n';
    summary += '='.repeat(80) + '\n\n';
    summary += `Generated: ${new Date().toISOString()}\n`;
    summary += `Total Customers: ${customers.length}\n`;
    summary += `Total Orders: ${totalOrdersGenerated}\n`;
    summary += `Total Items: ${totalItemsGenerated}\n`;
    summary += `Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}\n\n`;
    
    // Count by status
    const statusCounts = { ordered: 0, shipped: 0, delivered: 0 };
    const uniqueOrders = new Set();
    orders.forEach(order => {
      const orderKey = `${order.user_email}_${order.created_at}`;
      if (!uniqueOrders.has(orderKey)) {
        uniqueOrders.add(orderKey);
        statusCounts[order._status]++;
      }
    });
    
    summary += 'Orders by Status:\n';
    summary += `  Ordered: ${statusCounts.ordered}\n`;
    summary += `  Shipped: ${statusCounts.shipped}\n`;
    summary += `  Delivered: ${statusCounts.delivered}\n`;

    fs.writeFileSync(summaryPath, summary, 'utf8');
    console.log(`📊 Summary written to: ${summaryPath}\n`);

    console.log('✅ Order generation complete!');
    console.log('   Review the CSV file before importing with: node import-orders.js\n');

  } catch (error) {
    console.error('❌ Error during generation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.\n');
    process.exit(0);
  }
}

// Run the generator
generateRandomOrders();


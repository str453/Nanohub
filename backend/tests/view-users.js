// Script to view all users/customers in the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function viewUsers() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('👥 VIEWING ALL USERS/CUSTOMERS');
    console.log('='.repeat(80) + '\n');

    // Count total users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}\n`);

    if (totalUsers === 0) {
      console.log('⚠️  No users found in database.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Get all users (including password field for admins)
    // Use +password to include fields that are excluded by default (select: false)
    const users = await User.find({}).select('+password').sort({ createdAt: -1 });

    console.log('📋 USER LIST:\n');
    console.log('-'.repeat(80));

    users.forEach((user, index) => {

      if(user.role === 'admin'){
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Password: ${user.password}`);
      
      if (user.address && (user.address.street || user.address.city)) {
        const addr = [];
        if (user.address.street) addr.push(user.address.street);
        if (user.address.city) addr.push(user.address.city);
        if (user.address.state) addr.push(user.address.state);
        if (user.address.zipcode) addr.push(user.address.zipcode);
        if (addr.length > 0) {
          console.log(`   Address: ${addr.join(', ')}`);
        }
      }
      
      if (user.phone) {
        console.log(`   Phone: ${user.phone}`);
      }
      
      console.log(`   Created: ${user.createdAt ? user.createdAt.toLocaleDateString() : 'N/A'}`);
      console.log('-'.repeat(80));}
    });

    // Summary by role
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user' || !u.role).length;

    console.log('\n📊 SUMMARY BY ROLE:');
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Regular Users: ${userCount}`);
    console.log(`   Total: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Error viewing users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.\n');
    process.exit(0);
  }
}

// Run the script
viewUsers();


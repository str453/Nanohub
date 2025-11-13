// Script to import users from fake_users.csv
require('dotenv').config();
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function importUsers() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('👥 IMPORTING USERS FROM fake_users.csv');
    console.log('='.repeat(80) + '\n');

    const users = [];
    let rowCount = 0;

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream('./csvFiles/fake_users.csv')
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          
          // Map CSV fields to User model
          const userData = {
            name: `${row.first_name} ${row.last_name}`.trim(),
            email: row.email.toLowerCase().trim(),
            password: row.password, // Will be hashed by pre-save hook
            role: row.role === 'Admin' ? 'admin' : 'user', // Map Admin -> admin, Customer -> user
            phone: row.phone ? row.phone.replace(/-/g, '') : undefined, // Remove dashes
            address: {
              street: row.address1 || '',
              city: row.city || '',
              state: row.state || '',
              zipcode: row.postal_code || '',
              country: 'USA' // Default since all addresses appear to be US
            }
          };

          users.push(userData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📋 Read ${rowCount} rows from CSV`);
    console.log(`📦 Prepared ${users.length} users for import\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    // Import users one by one (to handle duplicates)
    for (const userData of users) {
      try {
        // Check if user already exists by email
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
          // Update existing user (don't update password to avoid breaking existing logins)
          existingUser.name = userData.name;
          existingUser.role = userData.role;
          existingUser.phone = userData.phone;
          existingUser.address = userData.address;
          await existingUser.save();
          updated++;
          console.log(`🔄 Updated: ${userData.name} (${userData.email})`);
        } else {
          // Create new user
          // Check if password is valid (at least 8 characters)
          if (!userData.password || userData.password.length < 8) {
            // Pad short passwords to meet minimum requirement
            const originalPassword = userData.password || '';
            // Pad with '!' repeated to reach 8 characters
            userData.password = originalPassword + '!'.repeat(8 - originalPassword.length);
            console.log(`⚠️  Padded password for new user: ${userData.name} (${userData.email})`);
          }
          
          const newUser = new User(userData);
          await newUser.save();
          created++;
          console.log(`✅ Created: ${userData.name} (${userData.email})`);
        }
      } catch (error) {
        skipped++;
        errors.push({ email: userData.email, error: error.message });
        console.log(`⚠️  Error with ${userData.email}: ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 IMPORT SUMMARY:');
    console.log('='.repeat(80));
    console.log(`✅ Created: ${created} new users`);
    console.log(`🔄 Updated: ${updated} existing users`);
    console.log(`⚠️  Skipped/Errors: ${skipped} users`);
    console.log(`📝 Total processed: ${users.length} users`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(err => {
        console.log(`   - ${err.email}: ${err.error}`);
      });
    }

    // Final count
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });

    console.log('\n📊 FINAL DATABASE STATS:');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Regular users: ${userCount}`);

  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.\n');
    process.exit(0);
  }
}

// Run the import
importUsers();

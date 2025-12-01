// Script to delete all users and re-import from fake_users.csv with usernames
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

async function reimportUsers() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔄 RE-IMPORTING USERS FROM fake_users.csv (WITH USERNAMES)');
    console.log('='.repeat(80) + '\n');

    // Step 1: Delete all existing users
    console.log('🗑️  Deleting all existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`   ✅ Deleted ${deleteResult.deletedCount} users\n`);

    // Step 2: Read CSV and prepare users
    const users = [];
    let rowCount = 0;

    await new Promise((resolve, reject) => {
      fs.createReadStream('./csvFiles/fake_users.csv')
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          
          // Map CSV fields to User model (including username)
          const userData = {
            username: row.username.toLowerCase().trim(), // Username from CSV
            firstName: row.first_name.trim(),
            lastName: row.last_name.trim(),
            name: `${row.first_name} ${row.last_name}`.trim(),
            email: row.email.toLowerCase().trim(),
            password: row.password, // Will be hashed by pre-save hook
            role: row.role === 'Admin' ? 'admin' : 'user', // Map Admin -> admin, Customer -> user
            phone: row.phone ? row.phone.replace(/\D/g, '') : undefined, // Remove non-digits
            address: {
              street: row.address1 || '',
              city: row.city || '',
              state: row.state || '',
              zipcode: row.postal_code || '',
              country: 'USA'
            },
            dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined
          };

          users.push(userData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📋 Read ${rowCount} rows from CSV`);
    console.log(`📦 Prepared ${users.length} users for import\n`);

    // Step 3: Import users
    let created = 0;
    let errors = [];

    console.log('📥 Importing users...\n');

    for (const userData of users) {
      try {
        // Check if password is valid (at least 8 characters)
        if (!userData.password || userData.password.length < 8) {
          // Pad short passwords to meet minimum requirement
          const originalPassword = userData.password || '';
          userData.password = originalPassword + '!'.repeat(8 - originalPassword.length);
          console.log(`⚠️  Padded password for: ${userData.name} (${userData.email})`);
        }

        const newUser = new User(userData);
        await newUser.save();
        created++;
        
        if (created % 50 === 0) {
          console.log(`   ✅ Imported ${created} users...`);
        }
      } catch (error) {
        errors.push({ 
          email: userData.email, 
          username: userData.username,
          error: error.message 
        });
        console.log(`⚠️  Error with ${userData.email} (${userData.username}): ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 IMPORT SUMMARY:');
    console.log('='.repeat(80));
    console.log(`✅ Created: ${created} users`);
    console.log(`⚠️  Errors: ${errors.length} users`);
    console.log(`📝 Total processed: ${users.length} users`);

    if (errors.length > 0 && errors.length <= 20) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(err => {
        console.log(`   - ${err.email} (${err.username}): ${err.error}`);
      });
    } else if (errors.length > 20) {
      console.log(`\n⚠️  ${errors.length} errors encountered (too many to display)`);
    }

    // Final count
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });
    const usersWithUsername = await User.countDocuments({ username: { $exists: true, $ne: null } });

    console.log('\n📊 FINAL DATABASE STATS:');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with username: ${usersWithUsername}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Regular users: ${userCount}`);

    if (usersWithUsername === totalUsers) {
      console.log('\n✅ All users have usernames!');
    } else {
      console.log(`\n⚠️  Warning: ${totalUsers - usersWithUsername} users are missing usernames`);
    }

  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.\n');
    process.exit(0);
  }
}

// Run the import
reimportUsers();


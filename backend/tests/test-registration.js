// Test script to verify user registration works
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

async function testRegistration() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING USER REGISTRATION');
    console.log('='.repeat(80) + '\n');

    // Test data
    const testUser = {
      username: 'testuser_' + Date.now(), // Unique username
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User',
      email: 'test_' + Date.now() + '@example.com', // Unique email
      password: 'TestPass123!',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zipcode: '12345',
        country: 'USA'
      },
      phone: '1234567890',
      role: 'user'
    };

    console.log('📝 Creating test user...');
    console.log('   Username:', testUser.username);
    console.log('   Email:', testUser.email);
    console.log('   Name:', testUser.name);
    console.log('');

    // Try to create the user
    const user = await User.create(testUser);

    if (user) {
      console.log('✅ User created successfully!');
      console.log('   User ID:', user._id);
      console.log('   Username:', user.username);
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Created at:', user.createdAt);
      
      // Clean up - delete test user
      await User.deleteOne({ _id: user._id });
      console.log('\n🧹 Test user cleaned up');
      
      console.log('\n✅ REGISTRATION TEST PASSED!');
      console.log('   The registration endpoint should work correctly.');
    }

  } catch (error) {
    console.error('\n❌ REGISTRATION TEST FAILED!');
    console.error('Error:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('\nValidation Errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
    
    if (error.code === 11000) {
      console.error('\nDuplicate Key Error:');
      console.error('   A user with this username or email already exists');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.\n');
    process.exit(0);
  }
}

// Run the test
testRegistration();


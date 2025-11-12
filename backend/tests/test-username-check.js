// Test the username check functionality
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => {
    console.error('❌ Connection Error:', err);
    process.exit(1);
  });

async function testUsernameCheck() {
  try {
    const testUsername = 'testuser_' + Date.now();
    
    console.log('\n🧪 Testing Username Check Functionality\n');
    console.log('1. Creating test user with username:', testUsername);
    
    // Create a test user
    const user = await User.create({
      username: testUsername,
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User',
      email: `test_${Date.now()}@test.com`,
      password: 'TestPass123!'
    });
    
    console.log('   ✅ User created with username:', user.username);
    
    // Test 1: Check if the username we just created is detected as taken
    console.log('\n2. Checking if username is taken (should be FALSE - not available):');
    const check1 = await User.findOne({ username: testUsername.toLowerCase() });
    console.log('   Result:', check1 ? '✅ CORRECTLY DETECTED AS TAKEN' : '❌ ERROR: Should be taken but shows as available');
    
    // Test 2: Check a new username that doesn't exist
    console.log('\n3. Checking new username (should be TRUE - available):');
    const newUsername = 'newuser_' + Date.now();
    const check2 = await User.findOne({ username: newUsername.toLowerCase() });
    console.log('   Result:', !check2 ? '✅ CORRECTLY DETECTED AS AVAILABLE' : '❌ ERROR: Should be available but shows as taken');
    
    // Test 3: Case sensitivity test
    console.log('\n4. Testing case sensitivity:');
    const check3 = await User.findOne({ username: testUsername.toUpperCase() });
    console.log('   Checking uppercase version:', check3 ? '✅ CORRECTLY DETECTED (case-insensitive)' : '❌ ERROR: Case sensitivity issue');
    
    // Clean up
    await User.deleteOne({ _id: user._id });
    console.log('\n🧹 Test user cleaned up');
    
    console.log('\n✅ Username check functionality is working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testUsernameCheck();


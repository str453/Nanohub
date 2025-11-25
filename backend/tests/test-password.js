// Quick test to verify which password works
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => {
    console.error('❌ Connection Error:', err);
    process.exit(1);
  });

async function testPassword() {
  try {
    const user = await User.findOne({ email: 'jestrada309@csu.fullerton.edu' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n🔍 Testing passwords for Jake Estrada:');
    console.log(`Email: ${user.email}\n`);

    // Test different password possibilities
    const testPasswords = [
      'CPSC491',      // Original 7 chars
      'CPSC491!',     // 8 chars (if already fixed)
      'CPSC491!!',    // 9 chars (if double padded)
    ];

    for (const testPwd of testPasswords) {
      const isMatch = await user.correctPassword(testPwd, user.password);
      console.log(`Password "${testPwd}": ${isMatch ? '✅ MATCH!' : '❌ No match'}`);
    }

    console.log(`\n📝 Stored hash: ${user.password.substring(0, 20)}...`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testPassword();


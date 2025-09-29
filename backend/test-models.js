require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product.js');
const User = require('./models/User.js');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' MongoDB Connected for model testing');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const testModels = async () => {
  await connectDB();

  try {
    // Test creating a product
    const testProduct = new Product({
      name: 'NVIDIA RTX 4090',
      description: 'High-performance gaming graphics card',
      price: 1599.99,
      category: 'GPU',
      brand: 'NVIDIA',
      stockQuantity: 10,
      specifications: {
        'VRAM': '24GB GDDR6X',
        'Boost Clock': '2520 MHz',
        'Power Consumption': '450W'
      }
    });

    const savedProduct = await testProduct.save();
    console.log(' Product created:', savedProduct.name);

    // Test creating a user
    const testUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword123', // In real app, this would be hashed
      address: {
        street: '123 Main St',
        city: 'Tech City',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      }
    });

    const savedUser = await testUser.save();
    console.log(' User created:', savedUser.name);

    console.log(' All models working correctly!');

  } catch (error) {
    console.error(' Model test error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

testModels();
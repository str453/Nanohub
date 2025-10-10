require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database.js');
const cors = require('cors');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors({
  origin: 'https://localhost:3000',
  credentials: true
}));

app.use(express.json());

const product_routes = require('./routes/product.js');

app.use('/api/product', product_routes);

app.get('/', (req, res) => {
  res.json({
    messages: 'Backend API running',
    endpoints: {
      product: '/api/product',
      product_number: '/api/product/:number',
    }
  });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route for API not found'
  })
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
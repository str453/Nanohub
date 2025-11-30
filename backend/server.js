require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database.js');
const cors = require('cors');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  next();
});

const product_routes = require('./routes/product.js');
const auth_routes = require('./routes/auth.js');
const payment_routes = require('./routes/payment.js');


app.use('/api/product', product_routes);
app.use('/api/auth', auth_routes);
app.use('/api/payment', payment_routes);


app.get('/', (req, res) => {
  res.json({
    messages: 'Backend API running',
    endpoints: {
      product: '/api/product',
      product_number: '/api/product/:number',
    },
    auth: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    },
    user: {
      profile: 'GET /api/user/profile',
      by_id: 'GET /api/user/:id'
    }
  });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route for API not found'
  })
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
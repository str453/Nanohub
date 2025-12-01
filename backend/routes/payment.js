const express = require('express');
const router = express.Router();

// Initialize Stripe with error handling
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️  WARNING: STRIPE_SECRET_KEY is not set in .env file!');
  console.error('   Please add: STRIPE_SECRET_KEY=sk_test_... to your backend/.env file');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product')(mongoose);
const auth = require('../middleware/auth');

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to .env file.'
      });
    }

    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        userId: req.user.id.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment processing failed'
    });
  }
});

// Create order after successful payment
router.post('/create-order', auth, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    // Validate required fields
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order items are required'
      });
    }

    // Calculate shipping timeline for new order
    const orderedAt = new Date();
    const shippedAt = new Date(orderedAt);
    shippedAt.setDate(shippedAt.getDate() + 3); // Ship 3 days after order
    const deliveredAt = new Date(shippedAt);
    deliveredAt.setDate(deliveredAt.getDate() + 5); // Deliver 5 days after shipping
    const status = 'ordered'; // New orders start as "ordered"

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'credit_card',
      paymentResult: paymentResult || {},
      itemsPrice: itemsPrice || 0,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice || 0,
      isPaid: paymentResult ? true : false,
      paidAt: paymentResult ? new Date() : null,
      // Shipping timeline fields
      orderedAt: orderedAt,
      shippedAt: shippedAt,
      deliveredAt: deliveredAt,
      isDelivered: false,
      status: status
    });

    // Update product stock quantities
    for (const item of orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stockQuantity: -item.quantity } }
        );
      }
    }

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order'
    });
  }
});

// Get user's orders
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'orderItems.product',
        select: 'name images price category brand'
      })
      .sort({ createdAt: -1, _id: -1 }); // Sort by createdAt first (when order was inserted), then _id

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get single order by ID
router.get('/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product', 'name image price');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// Get all orders (Admin only)
router.get('/admin/orders', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const orders = await Order.find({})
      .populate({
        path: 'user',
        select: 'name firstName lastName email phone'
      })
      .populate({
        path: 'orderItems.product',
        select: 'name images price category brand'
      })
      .sort({ createdAt: -1, _id: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get order locations for map markers - Admin only
router.get('/admin/order-locations', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Get all orders with shipping addresses
    const orders = await Order.find({
      'shippingAddress.street': { $exists: true, $ne: '' },
      'shippingAddress.city': { $exists: true, $ne: '' },
      'shippingAddress.state': { $exists: true, $ne: '' }
    })
    .select('shippingAddress totalPrice createdAt')
    .limit(1000); // Limit to prevent too many markers

    // Format addresses for geocoding
    const locations = orders.map(order => {
      const addr = order.shippingAddress;
      const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}, ${addr.country || 'USA'}`.trim();
      
      return {
        orderId: order._id,
        address: fullAddress,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country || 'USA',
        totalPrice: order.totalPrice,
        createdAt: order.createdAt
      };
    });

    res.json({
      success: true,
      locations
    });
  } catch (error) {
    console.error('Error fetching order locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order locations'
    });
  }
});

// Get geography data (sales by country, focused on USA) - Admin only
router.get('/admin/geography', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Aggregate orders by country (most of your orders are USA)
    const geographyData = await Order.aggregate([
      {
        $group: {
          _id: '$shippingAddress.country',
          value: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Map country names/codes to ISO3 IDs used by the geoFeatures (e.g. 'USA')
    const countryCodeMap = {
      'USA': 'USA',
      'US': 'USA',
      'United States': 'USA',
      'United States of America': 'USA'
    };

    const formattedData = geographyData
      .map(item => {
        const raw = item._id || 'USA';
        const id = countryCodeMap[raw] || raw;
        return {
          id,
          value: Math.round(item.value),
          country: raw
        };
      })
      // Only keep countries that exist in the world map data
      .filter(item => !!item.id);

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching geography data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch geography data'
    });
  }
});

module.exports = router;


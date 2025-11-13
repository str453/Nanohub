////FR# 7
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    price: Number,
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'debt_card', 'paypal', 'crypto']
    },
    paymentResult:{
        id: String,
        status: String,
        update_time: String,
        email_address: String
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number, 
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: Date,
    // Shipping timeline fields
    orderedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    shippedAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    // Order status: "ordered" | "shipped" | "delivered"
    status: {
        type: String,
        enum: ['ordered', 'shipped', 'delivered'],
        required: true,
        default: 'ordered'
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

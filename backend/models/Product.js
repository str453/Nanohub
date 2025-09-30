const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 charactesr']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxLength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Product price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: ['CPU', 'GPU', 'Motherboard', 'Storage', 'PSU', 'Cooling', 'Case', 'Accessories'],
            message: 'Please select a valid category'
        }
    },
    brand: {
        type: String,
        required: [true, 'Product brand is required'],
        trim: true
    },
    inStock: {
        type: Boolean, 
        default: true
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    images: [{
        url: String,
        alt: String
    }],
    specifications: {
        type: Map,
        of: String
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot exceed 5']
        },
        count: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, brand: 1 });

module.exports = mongoose.model('Product', productSchema)
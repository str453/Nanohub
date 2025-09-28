const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
        maxLength: [40, 'Name cannot exceed 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 characters']
    },
    role: {
        type: String,
        emnum: ['user', 'admin'],
        default: 'user'
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    phone: {
        type: String,
        match: [/^\d{10,15}$/, 'Please enter a valid phone number']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
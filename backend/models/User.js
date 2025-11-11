//FR#7
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        minLength: [8, 'Password must be at least 5 characters'],
        select: false
    },
    role: {
        type: String,
        emnum: ['Customer', 'admin'],
        default: 'Customer'
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipcode: String,
    },
    phone: {
        type: String,
        match: [/^\d{10,15}$/, 'Please enter a valid phone number']
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);
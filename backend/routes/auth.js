//FR #: 2-4
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET || 'temp_secret_key', {
        expiresIn: '30d',
    });
};

// Check if username is available
router.get('/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const usernameLower = username.toLowerCase();
        
        // Check if username exists (case-insensitive)
        const userExists = await User.findOne({ username: usernameLower });
        
        // Also check if username matches the pattern
        const isValidFormat = /^[a-zA-Z0-9_]{3,30}$/.test(username);
        
        if (!isValidFormat) {
            return res.json({
                available: false,
                reason: 'Invalid format'
            });
        }
        
        res.json({
            available: !userExists
        });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({
            success: false,
            error: 'Error checking username'
        });
    }
});

router.post('/register', async (req, res) =>{
    try{
        const {
            username,
            firstName,
            lastName,
            email,
            password,
            address,
            city,
            state,
            postal_code,
            phone,
            date_of_birth
        } = req.body;

        // Check if username exists
        const usernameExists = await User.findOne({ username: username.toLowerCase() });
        if(usernameExists){
            return res.status(400).json({
                success: false,
                error: 'Username already exists'
            });
        }

        // Check if email exists
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if(emailExists){
            return res.status(400).json({
                success: false,
                error: 'User associated with email exists'
            });
        }

        // Create full name from first and last name
        const name = `${firstName} ${lastName}`.trim();

        // Create user with all fields
        const user = await User.create({
            username: username.toLowerCase(),
            name,
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            address: {
                street: address || '',
                city: city || '',
                state: state || '',
                zipcode: postal_code || '',
                country: 'USA'
            },
            phone: phone ? phone.replace(/\D/g, '') : undefined, // Remove non-digits, undefined if empty
            dateOfBirth: date_of_birth ? new Date(date_of_birth) : undefined,
            role: 'user' // Automatically set to user/customer
        });

        if(user){
            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                message: 'User successfully registered',
                token,
                user:{
                    id: user._id,
                    username: user.username,
                    name: user.name,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    address: user.address,
                    phone: user.phone
                }
            });
        }
    } catch(error){
        console.error('Error registering user:', error);
        
        // Handle validation errors
        if(error.name === 'ValidationError'){
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }

        // Handle duplicate key errors
        if(error.code === 11000){
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                error: `${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Error registering user'
        });
    }
});

router.post('/login', async(req, res) => {
    try{
        const{email, password} = req.body;

        const user = await User.findOne({email}).select('+password');

        if(user && (await user.correctPassword(password, user.password))){
            const token = generateToken(user._id);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    address: user.address,
                    phone: user.phone
                }
            });
        } else{
            res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
    } catch(error){
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            error: 'Error logging in'
        });
    }
});

module.exports = router;
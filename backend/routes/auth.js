const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET || 'temp_secret_key', {
        expiresIn: '30d',
    });
};

router.post('/register', async (req, res) =>{
    try{
        const {name, email, password} = req.body;

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({
                success: false,
                error: 'User associated with email exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        if(user){
            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                message: 'User successfully registerd',
                token,
                user:{
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    address: user.address,
                    phone: user.phone
                }
            });
        }
    } catch(error){
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Error registering user'
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
                    phonse: user.phone
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
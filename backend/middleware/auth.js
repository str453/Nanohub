//FR 2-4
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const auth = async(req, res, next) => {
    try{
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if(!token){
            return res.status(401).json({
                success: false,
                error: 'Authorization denied, no token'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if(!user){
            return res.status(401).json({
                success: false,
                error: 'Token not valid'
            });
        }

        req.user = user;
        next();
    } catch(error){
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            error: 'Token not valid'
        });
    }
};

module.exports = auth;
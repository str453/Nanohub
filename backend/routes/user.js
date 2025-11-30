//FR #: 2-4
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const auth = require('../middel/auth.js');

router.get('/', auth, async (req, res) => {
    try {
        if(req.user.role !== 'admin') {
            return res.status(403).json({
            success: false,
            error: 'Admin required to access'
        });

    }

const { page=1, limit = 10} = req.query;

const users = await User.find({})
    .select('-password')
    .limit(parseInt(limit))
    .skip((parseInt(page)-1) * parseInt(limit))
    .sort({ createdAt: -1});

const total = await User.countDocuments();

res.json({
    success: true,
    count: users.length,
    total,
    users,
    pagination: {
        cur_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        next_page: page * limit < total,
        prev_page: page > 1
    }
});
} catch(error){
    console.error('Error getting users:', error);
    res.status(500).json({
        success: false,
        error: 'Error fetching users'
    });
}
});

router.get('/profile', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');

        if(!user){
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch(error){
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching user'
        });
    }
});

router.get('/:id', auth, async(req, res) => {
    try{
        if(req.user.role !== 'admin'){
            return res.status(403).json({
                success: false,
                error: 'Admin required to access'
            });
        }
        const user = await User.findById(req.params.id).select('-password');

        if(!user){
            return res.status(404).json({
                success:false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch(error){
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching user'
        });
    }
});

router.put('/profile', auth, async(req, res) =>{
    try{
        const allowedChanges = ['name', 'email', 'address', 'phone'];
        const changes = {};

        Object.keys(req.body).forEach(key => {
            if(allowedChanges.includes(key)){
                changes[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            changes,
            {new: true, runValidators: true}
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile Successfully updated',
            user
        });
    } catch(error){
        console.error('Error updating profile:', error);
        if(error.code === 11000){
            return res.status(400).json({
                success: false,
                error: 'Email exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error updating profile'
        });
    }
});

router.delete('/:id', auth, async(req, res) =>{
    try{
        if(req.user.role !== 'admin'){
            return res.status(403).json({
                success: false,
                error: 'Admin required for this action'
            });
        }
        
        const user = await User.findByIdAndDelete(req.params.id);

        if(!user){
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User successfully deleted'
        });
    }  catch(error){
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting user'
        });
    }
})

module.exports = router;
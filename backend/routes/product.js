const express = require('express');
const router = express.Router();
const Product = require('../models/Product.js');


router.get('/', async (req, res) => {
    try{
        const {category, brand, search, page=1, limit=10} = req.query;

        let filter = {};
        if(category) filter.category = category;
        if(brand) filter.brand = new RegExp(brand, 'i');
        if(search){
            filter.$or = [
                {name: new RegExp(search, 'i')},
                {description: new RegExp(search, 'i')}
            ];
            }
        const products = await Product.find(filter)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({name:1});
        
        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            count: products.length,
            total, 
            products,
            pagination:{
                cur_page: parseInt(page),
                total_pages: Math.ceil(total/limit),
                next_page: page*limit < total,
                prev_page: page > 1
            }
        });
        } catch (error){
            console.error('Error getting products', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching products'
            });
        }
    });
router.get('/:id', async (req, res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        res.json({
            success: true,
            product
        });
    }
    catch (error){
        console.error('Error getting product:', error);
        res.status(500).json({
            success:false,
            error: 'Error fetching product'
        });
    }
});
router.get('/category/:category', async (req, res) => {
    try{
        const {page=1, limit=10} = req.query;
        const category = req.params.category;

        const products = await Product.find({category})
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({name: 1});
        const total = await Product.countDocuments({category});

        res.json({
            success: true,
            count: products.length,
            total,
            products,
            pagination: {
                cur_page: parseInt(page),
                total_pages: Math.ceil(total/limit),
                next_page: page*limit < total,
                prev_page: page > 1
            }
        });
    }
    catch (error) {
        console.error('Error gettings products by category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
});

module.exports = router;
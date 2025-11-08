require('dotenv').config();
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const Product = require('./models/Product.js')

const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MONGODB connected for import csv');
    }
    catch(error){
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

await mongoose.connect(process.env.MONGODB_URI);
const c = mongoose.connection;
console.log('✅ IMPORT connected to MongoDB ->', c.host, '| DB:', c.name);


const importRAM = async() => {
    await connectDB();

    const products = [];
    fs.createReadStream('csvFiles/RAM.csv')
        .pipe(csv())
        .on('data', (row) => {
            const price = parseFloat(row.Price.replace('$', '').replace('USD', '')) || 0;
            const stockQuantity = Math.floor(Math.random() * 61);
            const product = {
                name: row.Name,
                description: `${row.Producer} RAM`,
                price: price,
                category: 'RAM',
                brand: row.Producer,
                stockQuantity: stockQuantity,
                inStock: stockQuantity > 0,
                images: []
            };

            // specification for RAM
            // Ram Type, 	Size	Clock	Timings, 	Sticks	
            const specifications = new Map();
            if(row['Ram Type']) specifications.set('RAM type', row['Ram Type']);
            if(row.Size) specifications.set('Size', row.Size);
            if(row.Clock) specifications.set('Clock', row.Clock);
            if(row.Timings) specifications.set('Timings', row.Timings);
            if(row.Sticks) specifications.set('Sticks', row.Sticks);

            product.specifications = specifications;
            products.push(product);
        })
        .on('error', (error) => {
            console.error('File Stream Error:', error);
        })
        
        .on('end', async() => {
            try{
                console.log(`Read ${products.length} RAM from RAM.csv`);
                const result = await Product.insertMany(products);
                console.log(`Successfully import ${result.length} RAM`);
        
                console.log('Example of imported RAM');
                console.log(products[0]);
        
                mongoose.connection.close();
            }
            catch(error){
                console.error('CSV Import Error: ', error);
            }
        })
}

importRAM();
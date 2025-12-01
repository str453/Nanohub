require('dotenv').config();
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const Product = require('./models/Product.js');


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

const importMotherboard = async() => {
    await connectDB();

    const products = [];
    fs.createReadStream('csvFiles/Motherboards.csv')
        .pipe(csv())
        .on('data', (row) => {
            const price = parseFloat(row.Price.replace('$', '').replace('USD', '')) || 0;
            const stockQuantity = Math.floor(Math.random() * 61);
            const product = {
                name: row.Name,
                description: `${row.Producer} Motherboard`,
                price: price,
                category: 'Motherboard',
                brand: row.Producer,
                stockQuantity: stockQuantity,
                inStock: stockQuantity > 0,
                images: []
            };

            // Specifications for Motherboards
            //	Socket	Chipset	 Unlocked	Form Factor	  Memory Type   
            // 	Memory Capacity	   RAM Slots	SATA	VGA	  DVI	  Display Port	
            // HDMI	   WiFi	    Integrated Graphics
            const specifications = new Map();
            if(row.Socket) specifications.set('Socket', row.Socket);
            if(row.Chipset) specifications.set('Chipset', row.Chipset);
            if(row.Unlocked) specifications.set('Unlocked', row.Unlocked);
            if(row['Form Factor']) specifications.set('Form Factor', row['Form Factor']);
            if(row['Memory Type']) specifications.set('Memory Type', row['Memory Type']);
            if(row['Memory Capacity']) specifications.set('Memory Capacity', row['Memory Capacity']);
            if(row['RAM Slots']) specifications.set('RAM Slots', row['RAM Slots']);
            if(row.SATA) specifications.set('SATA', row.SATA);
            if(row.VGA) specifications.set('VGA', row.VGA);
            if(row.DVI) specifications.set('DVI', row.DVI);
            if(row['Display Port']) specifications.set('Display Port', row['Display Port']);
            if(row.HDMI) specifications.set('HDMI', row.HDMI);
            if(row.WiFi) specifications.set('WiFi', row.WiFi);
            if(row['Integrated Graphics']) specifications.set('Integrated Graphics', row['Integrated Graphics']);

            product.specifications = specifications;
            products.push(product);
        })
        .on('error', (error) => {
            console.error('File Stream Error:', error);
        })

        .on('end', async() => {
            try{
                console.log(`Read ${products.length} Motherboards from Motherboards.csv`);
                const result = await Product.insertMany(products);
                console.log(`Successfully import ${result.length} Motherboards`);
            
                console.log('Example of imported Motherboard');
                console.log(products[0]);
            
                mongoose.connection.close();
                }
                catch(error){
                console.error('CSV Import Error:', error);
                }
        })
}

importMotherboard();
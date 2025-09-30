require('dotenv').config();
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const Product = require('./models/Product.js');

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MONGODB connected for import csv');
    }
    catch(error){
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const importGPUs = async () => {
    await connectDB();

    const products = [];
    fs.createReadStream('csvFiles/GPU.csv')
        .pipe(csv())
        .on('data', (row) =>{
            const price = parseFloat(row.Price.replace('$', '').replace('USD', '')) || 0;
            const product = {
                name: row.Name,
                description: `${row.Producer} Graphics Processing Unit`,
                price: price,
                category: 'GPU',
                brand: row.Producer,
                StockQuantity: Math.floor(Math.random() * 31),
                inStock: true,
                images: []
            };

            // Specfication for GPUs
            const specifications = new Map();
            if(row.Length) specifications.set('Length', row.Length);
            if(row.Slots) specifications.set('Slot Width', `${row.Slots}-slot`);
            if(row.HDMI) specifications.set('HDMI Ports', row.HDMI);
            if(row.DisplayPort) specifications.set('Display Ports', row.DisplayPort);
            if(row.DVI) specifications.set('DVI Ports', row.DVI);
            if(row.VGA) specifications.set('VGA Ports', row.VGA);
            if(row['Boost Clock']) specifications.set('Boost Clock', row['Boost Clock']);
            if(row.Vram) specifications.set('VRAM', row.Vram);
            if(row['Memory Clock']) specifications.set('Memory Clock', row['Memory Clock']);
            if(row.TDP) specifications.set('TDP', row.TDP);


            const connectors = [];
            if(row['8-Pin Connectors'] > 0) connectors.push(`${row['8-Pin Connectors']}x 8-pin`);
            if(row['6-Pin Connectors'] > 0) connectors.push(`${row['6-Pin Connectors']}x 6-pin`);
            if(connectors.length > 0){
                specifications.set('Connectors', connectors.join(' + '));
            }
            
            product.specifications = specifications;
            products.push(product);
            })
            .on('error', (error) => {
                console.error('File Stream Error:', error);
            })
            
            .on('end', async () => {
                try{
                    console.log(`Read ${products.length} GPUs from GPU.csv`);
                    const result = await Product.insertMany(products);
                    console.log(`Successfully import ${result.length} GPUs`);

                    console.log('Example of imported GPU');
                    console.log(products[0]);

                    mongoose.connection.close();
                }
                catch(error){
                    console.error('CSV Import Error:', error);
                }
            });
};

importGPUs();
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

const importCPUs = async () => {
    await connectDB();

    const products = [];
    fs.createReadStream('csvFiles/CPU.csv')
        .pipe(csv())
        .on('data', (row) => {
            const price = parseFloat(row.Price.replace('$', '').replace('USD', '')) || 0;
            const product = {
                name: row.Name,
                description: `${row.Producer} Central Processing Unit`,
                price: price,
                category: 'CPU',
                brand: row.Producer,
                stockQuantity: Math.floor(Math.random() * 31),
                inStock: true,
                images: []
            };

            const specifications = new Map();
            //need Base Clock, Turbo Clock, Unlocked Multiplier, Cores, Threads, TDP, Socket, Integrated GPU
            
            if(row['Base Clock']) specifications.set('Base Clock', row['Base Clock']);
            if(row['Turbo Clock']) specifications.set('Turbo Clock', row['Turbo Clock']);
            if(row['Unlocked Multiplier']) specifications.set('Unlocked Multiplier', row['Unlocked Multiplier']);
            if(row.Cores) specifications.set('Cores', row.Cores);
            if(row.Threads) specifications.set('Threads', row.Threads);
            if(row.TDP) specifications.set('TDP', row.TDP);
            if(row.Socket) specifications.set('Socket', row.Socket);
            if(row['Integrated GPU']) specifications.set('Integrated GPU', row['Integrated GPU'])
                
            product.specifications = specifications;
            products.push(product);
        })
        .on('error', (error) => {
            console.error('File Stream Error:', error);
        })

        .on('end', async () => {
            try{
                console.log(`Read ${products.length} CPUs from CPU.csv`);
                const result = await Product.insertMany(products);
                console.log(`Successfully import ${result.length} CPUs`);

                console.log('Example of imported CPU');
                console.log(products[0]);

                mongoose.connection.close();
            }
            catch(error){
                console.error('CSV Import Error:', error);
            }
        })
}

importCPUs();
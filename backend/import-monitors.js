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

const importMonitors = async() => {
    await connectDB();

    const products = [];
    fs.createReadStream('csvFiles/Monitors.csv')
        .pipe(csv())
        .on('data', (row) => {
            const price = parseFloat(row.Price.replace('$', '').replace('USD', '')) || 0;
            const stockQuantity = Math.floor(Math.random() * 51);
            const product = {
            name: row.Name,
            description: `${row.Producer} Monitor`,
            price: price,
            category: 'Monitor',
            brand: row.Producer,
            stockQuantity: stockQuantity,
            inStock: stockQuantity > 0,
            images: []
            };

            // specifications for Monitors
            // need Resolution	Refresh Rate	Size	Panel	Response Time	HDMI
            // 	DisplayPort	DVI	VGA	Speaker	Curved	Adjustable Height	Sync
            const specifications = new Map();
            if(row.Resolution) specifications.set('Resolution', row.Resolution);
            if(row['Refresh Rate']) specifications.set('Refresh Rate', row['Refresh Rate']);
            if(row.Size) specifications.set('Size', row.Size);
            if(row.Panel) specifications.set('Panel', row.Panel);
            if(row['Response Time']) specifications.set('Response Time', row['Response Time']);
            if(row.HDMI) specifications.set('HDMI', row.HDMI);
            if(row.DisplayPort) specifications.set('DisplayPort', row.DisplayPort);
            if(row.DVI) specifications.set('DVI', row.DVI);
            if(row.VGA) specifications.set('VGA', row.VGA);
            if(row.Speaker) specifications.set('Speaker', row.Speaker);
            if(row.Curved) specifications.set('Curved', row.Curved);
            if(row['Adjustable Height']) specifications.set('Adjustable Height', row['Adjustable Height']);
            if(row.Sync) specifications.set('Sync', row.Sync);

            product.specifications = specifications;
            products.push(product);
        })
        .on('error', (error) => {
            console.error('File Stream Error:', error);
        })

        .on('end', async() => {
            try{
                console.log(`Read ${products.length} Monitors from Monitors.csv`);
                const result = await Product.insertMany(products);
                console.log(`Successfully import ${result.length} Monitors`);

                console.log('Example of imported Monitors');
                console.log(products[0]);

                mongoose.connection.close();
            }
            catch(error){
                console.error('CSV Import Error: ', error);
            }
        })

}

importMonitors();
require('dotenv').config();
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const User = require('./models/User.js');

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



const importUsers = async () => {
    await connectDB();

    const users = [];
    fs.createReadStream('fake_users.csv')
        .pipe(csv())
        .on('data', (row) => {
            if (row.password.length < 8){
                return; //skipped row with password with less than 8 chars
            }
            const user ={
                name: row.name,
                email: row.email,
                password: row.password,
                address: {
                    street: row.address1,
                    city: row.city,
                    state: row.state,
                    zipcode: row.postal_code
                },
                phone: row.phone.replace(/\D/g, '')
            } 
        users.push(user);
        })
        .on('error', (error) => {
            console.error('File Stream Error:', error);
        })

        .on('end', async () => {
            try{
                console.log(`Read ${users.length} users from fake_users.csv`);
                
                console.log(`Importing ${users.length} Users`);
                
                if (users.length > 0) {
                    const savedUsers = []
                    let successfullImports = 0;

                    for(const userData of users){
                        try{
                            const user = new User(userData);
                            await user.save();
                            savedUsers.push(user);
                            successfullImports++;
                        } catch(error){
                            console.log(`Failed to import a user`)
                        }
                    }
                


                console.log(`Successfully imported ${successfullImports} Users`);

                console.log('Example of imported User');
                console.log(users[0]);

                mongoose.connection.close();
            }
        }
            catch(error){
                console.error('CSV import Error', error);
            }
        });
};


importUsers();

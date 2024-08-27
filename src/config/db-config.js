const mongoose = require('mongoose');
const { MONGOURI } = require('./server-config');

async function connectDB(){
    try {
        await mongoose.connect(MONGOURI);
        console.log(`Connected to database successfully`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB;
const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
    country: {
        type: String,
        required: false,
    },
    profession: {
        type: String,
        required: false,
    },
    job_title: {
        type: String,
        required: false,
    },
    job_description: {
        type: String,
        required: false,
    },
    price_range: {
      type: String,
      required: false,  
    },
    pincode: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Gig = new mongoose.model('Gig', gigSchema);

module.exports = Gig;
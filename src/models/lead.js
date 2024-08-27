const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    lawyer: {
        type: Boolean,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    graduation: {
        type: String,
        required: false,
    },
    experience: {
        type: String,
        required: false,
    },
}, { timestamps: true });

const Lead = new mongoose.model('Lead', leadSchema);

module.exports = Lead;
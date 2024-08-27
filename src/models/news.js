const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    sourceUrl: {
        type: String,
        required: true
    },
    publishedAt: {
        type: Date,
        required: true
    },
    type: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const News = new mongoose.model('News', newsSchema);

module.exports = News;
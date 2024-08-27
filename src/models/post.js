const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    description: {
        type: 'string',
        required: true,
    },
    price_range: {
        type: 'string',
        required: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    }
}, { timestamps: true });

const Post = new mongoose.model('Post', postSchema);

module.exports = Post;
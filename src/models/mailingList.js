const mongoose = require('mongoose');

const mailingListSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, { timestamps: true });

const MailingList = new mongoose.model('MailingList', mailingListSchema);

module.exports = MailingList;
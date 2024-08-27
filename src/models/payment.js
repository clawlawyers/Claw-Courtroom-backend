const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: String },
    orderId: { type: String },
    paymentIntentId: { type: String, required: true, trim: true },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enums: ['INITIATED', 'SUCCESS', 'FAILED']
    },

}, { timestamps: true });

const Payments = new mongoose.model('Payment', paymentSchema);

module.exports = Payments;
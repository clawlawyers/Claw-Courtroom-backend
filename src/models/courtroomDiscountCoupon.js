const mongoose = require("mongoose");

const courtoomDiscountCoupon = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

module.exports = mongoose.model(
  "CourtroomDiscountCoupon",
  courtoomDiscountCoupon
);

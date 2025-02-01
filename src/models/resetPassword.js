const mongoose = require("mongoose");

const resetPasswordSchema = new mongoose.Schema({
  phoneOrEmail: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Document auto-deletes after 5 minutes (300 seconds)
  },
});

const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);

module.exports = ResetPassword;

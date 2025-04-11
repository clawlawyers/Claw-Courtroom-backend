const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual courtroom booking subdocument schema
const CourtroomUserSchema = new Schema({
  userId: { type: String },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  recording: { type: Boolean, required: true, default: false },
  drafteFavor: { type: String },
  caseOverview: {
    type: String,
    required: true,
    default: "",
  },
  caseId: {
    type: String,
    // unique: true,
  },
  booking: [
    {
      date: {
        type: Date,
      },
      time: {
        type: Number,
      },
    },
  ],
});

const CourtroomPricingUser = mongoose.model(
  "CourtroomPricingUser",
  CourtroomUserSchema
);

module.exports = CourtroomPricingUser;

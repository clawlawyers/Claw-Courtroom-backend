const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the courtroom history schema
const CourtroomFeedbackSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourtroomPricingUser",
      required: true,
    },
    rating: { type: Number, required: true },
    feedback: { type: String, required: true },
  },
  { timestamps: true }
);

const CourtroomFeedback = mongoose.model(
  "CourtroomPricingFeedback",
  CourtroomFeedbackSchema
);

module.exports = CourtroomFeedback;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the courtroom history schema
const CourtroomFreeFeedbackSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourtroomFreeUser",
      required: true,
    },
    rating: { type: Number, required: true },
    feedback: { type: String, required: true },
  },
  { timestamps: true }
);

const CourtroomFreeFeedback = mongoose.model(
  "CourtroomFreeFeedback",
  CourtroomFreeFeedbackSchema
);

module.exports = CourtroomFreeFeedback;

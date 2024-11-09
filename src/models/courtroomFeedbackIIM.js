const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the courtroom history schema
const CourtroomFeedbackSchemaIIM = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourtroomUserIIM",
      required: true,
    },
    rating: { type: Number, required: true },
    feedback: { type: String, required: true },
  },
  { timestamps: true }
);

const CourtroomFeedbackIIM = mongoose.model(
  "CourtroomFeedbackIIM",
  CourtroomFeedbackSchemaIIM
);

module.exports = CourtroomFeedbackIIM;

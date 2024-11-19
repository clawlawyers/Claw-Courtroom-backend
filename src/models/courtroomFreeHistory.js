const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual case history subdocument schema
const CaseHistorySchema = new Schema({
  caseId: {
    type: String,
    required: true,
  },
  argument: [{ type: String, required: true }],
  counter_argument: [{ type: String, required: true }],
  judgement: [{ type: String, required: true }],
  potential_objection: [{ type: String, required: true }],
  verdict: { type: String, default: "NA" },
});

// Define the courtroom history schema
const CourtroomHistorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourtroomFreeUser",
      required: true,
    },

    history: [CaseHistorySchema],
    latestCaseHistory: CaseHistorySchema,
  },
  { timestamps: true }
);

const CourtroomHistory = mongoose.model(
  "CourtroomFreeHistory",
  CourtroomHistorySchema
);

module.exports = CourtroomHistory;

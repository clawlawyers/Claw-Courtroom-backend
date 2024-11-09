const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual case history subdocument schema
const CaseHistorySchemaIIM = new Schema({
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
const CourtroomHistoryIIMSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourtroomUserIIM",
      required: true,
    },
    history: [CaseHistorySchemaIIM],
    latestCaseHistory: CaseHistorySchemaIIM,
  },
  { timestamps: true }
);

const CourtroomHistoryIIM = mongoose.model(
  "CourtroomHistoryIIM",
  CourtroomHistoryIIMSchema
);

module.exports = CourtroomHistoryIIM;

const { required } = require("joi");
const mongoose = require("mongoose");

const courtroomFreeUserSchema = new mongoose.Schema({
  userId: { type: String },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  // password: { type: String },
  drafteFavor: { type: String },
  caseOverview: {
    type: String,
  },
  caseId: {
    type: String,
    unique: true,
  },
  todaysSlot:{
    type:Date,
    default:null,
    required:true

  }
});
const CourtroomFreeUser =mongoose.model("CourtroomFreeUser", courtroomFreeUserSchema);

module.exports = CourtroomFreeUser
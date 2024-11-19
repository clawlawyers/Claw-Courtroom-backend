const mongoose = require("mongoose");

const courtroomUserPlanSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "courtroomPlan",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourtroomPricingUser",
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startData: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endData: {
    type: Date,
    required: true,
  },
});

const CourtroomUserPlan = mongoose.model(
  "CourtroomUserPlan",
  courtroomUserPlanSchema
);

module.exports = CourtroomUserPlan;

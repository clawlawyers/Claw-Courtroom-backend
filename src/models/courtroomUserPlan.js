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
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usedHours: {
    type: Number,
    required: true,
    default: 0,
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

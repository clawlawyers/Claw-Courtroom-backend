const mongoose = require("mongoose");
const { paymentStatus } = require("../utils/common/constants");

const CourtroomPlanOrderSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: [
        paymentStatus.INITIATED,
        paymentStatus.SUCCESS,
        paymentStatus.FAILED,
      ],
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courtroomPlan",
    },
  },
  { timestamps: true }
);

const CourtroomPlanOrder = new mongoose.model(
  "CourtroomPlanOrder",
  CourtroomPlanOrderSchema
);

module.exports = CourtroomPlanOrder;

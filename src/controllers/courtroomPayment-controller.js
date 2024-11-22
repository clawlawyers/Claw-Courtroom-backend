const { RAZORPAY_ID, RAZORPAY_SECRET_KEY } = require("../config/server-config");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const {
  BookingPayment,
  CourtroomService,
  CourtroomPricingService,
  CourtroomPaymentService,
} = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { paymentStatus } = require("../utils/common/constants");
const { hashPassword } = require("../utils/coutroom/auth");
const { sendConfirmationEmail } = require("../utils/coutroom/sendEmail");
const CourtroomPricingUser = require("../models/courtroomPricingUser");
const { CourtroomPricingController } = require(".");
const { trusted } = require("mongoose");

const razorpay = new Razorpay({
  key_id: RAZORPAY_ID,
  key_secret: RAZORPAY_SECRET_KEY,
});

async function createPayment(req, res) {
  const { amount, currency, receipt, planId, phoneNumber } = req.body;
  // const { _id, phoneNumber } = req.body.client;
  console.log(req.body);

  const order = await CourtroomPaymentService.createOrder({
    phoneNumber,
    paymentStatus: paymentStatus.INITIATED,
    plan: planId,
  });

  console.log(order);

  try {
    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };

    const orderr = await razorpay.orders.create(options);
    const combinedResponse = {
      razorpayOrder: orderr,
      createdOrder: order,
    };
    console.log(combinedResponse);
    res.status(200).json(combinedResponse);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function verifyPayment(req, res) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    _id,
    bookingData,
    amount,
  } = req.body;

  const hmac = crypto.createHmac("sha256", RAZORPAY_SECRET_KEY);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  let respo;

  if (generated_signature === razorpay_signature) {
    try {
      console.log(_id);
      const placedOrder = await CourtroomPaymentService.updateOrder(_id, {
        paymentStatus: paymentStatus.SUCCESS,
      });

      console.log(placedOrder);

      const { phoneNumber, email, planId, endDate } = bookingData;

      respo = await CourtroomPricingService.addNewPlan(
        phoneNumber,
        email,
        planId,
        endDate
      );

      // res.status(200).json(respo);
      // console.log(respo);

      // let amout1 = amount;

      // await sendConfirmationEmail(
      //   email,
      //   name,
      //   phoneNumber,
      //   password,
      //   (amout1 = amout1 / 100)
      // );
    } catch (error) {
      console.log(error);
    }
    res.status(200).json({ status: "Payment verified successfully", respo });
  } else {
    res.status(400).json({ status: "Payment verification failed" });
  }
}

module.exports = {
  createPayment,
  verifyPayment,
};

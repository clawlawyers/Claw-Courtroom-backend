// server/routes/salesman.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares");
const CourtroomPaymentController = require("../../controllers/courtroomPayment-controller");

router.post(
  "/create-order",

  CourtroomPaymentController.createPayment
);
router.post(
  "/verifyPayment",

  CourtroomPaymentController.verifyPayment
);

module.exports = router;

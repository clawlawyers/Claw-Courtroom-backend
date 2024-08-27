const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = require("../config/server-config");
const { OrderService, PaymentService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require('http-status-codes');
const { paymentStatus } = require("../utils/common/constants");
const { GptServices } = require("../services");
const stripe = require("stripe")(STRIPE_SECRET_KEY);


async function createPaymentIntent(req, res) {
    try {
        const { amount, plan, request, session, billingCycle } = req.body;
        const { _id } = req.body.client;
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "inr",
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
        });
        // create order
        const order = await OrderService.createOrder({ plan, request, session, billingCycle, user: _id });
        // create payment
        const payment = await PaymentService.createPayment({ amount, userId: _id, orderId: order.id, status: paymentStatus.INITIATED, paymentIntentId: paymentIntent.id });
        
        res.status(StatusCodes.CREATED).json(SuccessResponse({ clientSecret: paymentIntent.client_secret }))
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse({}, error));
    }
}


async function successEvent(paymentIntentId) {
    try {
        // update payment
        const updatedPayment = await PaymentService.updatePaymentByPaymentIntentId(paymentIntentId, { status: paymentStatus.SUCCESS });
        // fetch order details
        const placedOrder = await OrderService.fetchOrderById(updatedPayment.orderId);
        // update the plan for user
        await GptServices.updateUserPlan(updatedPayment.userId, placedOrder.plan);
        console.log(updatedUser)
    } catch (error) {
        console.error(error);
    }
}

async function captureEvent(req, res) {
    try {
        const sig = req.headers['stripe-signature']
        const event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                await successEvent(paymentIntent.id)
                console.log(paymentIntent, "succeeded")
                // Then define and call a method to handle the successful payment intent.
                // handlePaymentIntentSucceeded(paymentIntent);
                break;
            case 'payment_method.attached':
                const paymentMethod = event.data.object;
                // Then define and call a method to handle the successful attachment of a PaymentMethod.
                // handlePaymentMethodAttached(paymentMethod);
                break;
            // ... handle other event types
            default:
                console.log(`Unhandled event type`);
        }

        res.status(StatusCodes.OK).json({ received: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ received: false });
    }
}


module.exports = {
    createPaymentIntent,
    captureEvent,
}
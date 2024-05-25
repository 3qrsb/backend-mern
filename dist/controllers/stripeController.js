"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const emailController_1 = require("./emailController");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
});
const createCheckoutSession = async (req, res) => {
    try {
        const { items, orderId } = req.body;
        const session = await stripe.checkout.sessions.create({
            line_items: items.map((item) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100), // price in cents
                },
                quantity: item.qty,
            })),
            mode: 'payment',
            allow_promotion_codes: true,
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
            metadata: {
                orderId: orderId,
            }
        });
        res.status(200).json({ id: session.id });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.sendStatus(400);
    }
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const orderId = session.metadata?.orderId;
            const paid = session.payment_status === 'paid';
            const paymentMethod = session.payment_method_types[0];
            if (orderId && paid && session.customer_details?.email) {
                try {
                    const order = await orderModel_1.default.findById(orderId);
                    if (order) {
                        order.isPaid = true;
                        await order.save();
                        await (0, emailController_1.sendPaymentConfirmationEmail)(session.customer_details.email, orderId, paymentMethod);
                    }
                    else {
                        console.error(`Order with id ${orderId} not found`);
                    }
                }
                catch (err) {
                    console.error(`Error updating order status: ${err.message}`);
                }
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.sendStatus(200);
};
exports.handleWebhook = handleWebhook;

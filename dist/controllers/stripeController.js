"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
});
const createCheckoutSession = async (req, res) => {
    try {
        const { items, orderId } = req.body;
        const order = await orderModel_1.default.findById(orderId);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        const discountAmount = order.discountAmount || 0;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
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
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
            allow_promotion_codes: true,
            metadata: {
                orderId: orderId,
                discountAmount: discountAmount.toString(), // Convert to string for metadata
            },
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
        return res.status(400).send(`Webhook error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId) {
            const order = await orderModel_1.default.findById(orderId);
            if (order) {
                order.isPaid = true;
                // Use the total_details field from the Stripe event data to update the discountAmount
                if (session.total_details?.amount_discount) {
                    order.discountAmount = session.total_details.amount_discount / 100; // Convert from cents to dollars
                }
                await order.save();
            }
        }
    }
    res.status(200).json({ received: true });
};
exports.handleWebhook = handleWebhook;

import { Request, Response } from 'express';
import Stripe from 'stripe';
import Order from '../models/orderModel'
import { sendPaymentConfirmationEmail } from './emailController';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { items, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const discountAmount = order.discountAmount || 0;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
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
      allow_promotion_codes: true, // Enable promotion codes
      metadata: {
        orderId: orderId,
        discountAmount: discountAmount.toString(), // Convert to string for metadata
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && session.customer_details?.email) {
        order.isPaid = true;
        if (session.total_details?.amount_discount) {
          order.discountAmount = session.total_details.amount_discount / 100;
          order.totalPrice = order.totalPrice - session.total_details?.amount_discount / 100 // Convert from cents to dollars
        }
        await order.save();
        await sendPaymentConfirmationEmail(session.customer_details.email, orderId, session.payment_method_types[0]);
      }
    }
  }
  
  res.status(200).json({ received: true });
};
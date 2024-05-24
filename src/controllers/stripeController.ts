import { Request, Response } from 'express';
import Stripe from 'stripe';
import Order from '../models/orderModel'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { items, orderId } = req.body;
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
      metadata: {
          orderId: orderId,
      }
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
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const paid = session.payment_status === 'paid';
      if (orderId && paid) {
        try {
          const order = await Order.findById(orderId);
          if (order) {
            order.isPaid = true;
            await order.save();
          } else {
            console.error(`Order with id ${orderId} not found`);
          }
        } catch (err: any) {
          console.error(`Error updating order status: ${err.message}`);
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  } 

  res.sendStatus(200);
};
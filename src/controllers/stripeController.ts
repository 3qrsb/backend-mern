import { Request, Response } from "express";
import Stripe from "stripe";
import { sendPaymentConfirmationEmail } from "./emailController";
import Order, { CartItems } from "../models/orderModel";
import Product from "../models/productModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
});

const updateProductStock = async (cartItems: CartItems[]) => {
  await Promise.all(
    cartItems.map(async (item) => {
      const product = await Product.findById(item._id);
      if (!product) return;
      product.qty = Math.max(0, (product.qty ?? 0) - item.qty);
      product.totalSales += item.qty;
      product.inStock = product.qty > 0;
      await product.save();
    })
  );
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    const { items, shippingAddress, totalPrice, discountAmount = 0 } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    const pendingOrder = await Order.create({
      user: userId,
      cartItems: items,
      shippingAddress,
      totalPrice,
      discountAmount,
      isPaid: false,
      status: "pending",
    });

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${
        process.env.CLIENT_URL || "http://localhost:3000"
      }/success`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/cancel`,
      allow_promotion_codes: true,
      metadata: { orderId: pendingOrder._id.toString() },
    });

    return res.status(200).json({ id: session.id });
  } catch (error: any) {
    console.error("❌ createCheckoutSession error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const amountPaid = (session.amount_total ?? 0) / 100;

    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error(`Order ${orderId} not found`);

        order.isPaid = true;
        order.status = "paid";
        await order.save();
        await updateProductStock(order.cartItems);

        const email = session.customer_details?.email;
        if (email) {
          await sendPaymentConfirmationEmail(
            email,
            order._id.toString(),
            session.payment_method_types[0],
            amountPaid
          );
        }
      } catch (err: any) {
        console.error("❌ Webhook processing error:", err);
      }
    }
  }

  return res.status(200).json({ received: true });
};

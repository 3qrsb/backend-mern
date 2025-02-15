import { Request, Response } from "express";
import Stripe from "stripe";
import { sendPaymentConfirmationEmail } from "./emailController";
import Order from "../models/orderModel";
import Product from "../models/productModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
});

const updateProductStock = async (cartItems: any[]) => {
  await Promise.all(
    cartItems.map(async (item) => {
      const product = await Product.findById(item._id);
      if (product) {
        product.qty = Math.max(0, (product.qty ?? 0) - item.qty);
        product.totalSales += item.qty;
        product.inStock = product.qty > 0;
        await product.save();
      }
    })
  );
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user ? (req as any).user._id : null;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { items, shippingAddress, totalPrice, discountAmount } = req.body;
    if (!items || items.length === 0) {
      res.status(400).json({ message: "No order items provided" });
      return;
    }

    const orderDetails = JSON.stringify({
      shippingAddress,
      totalPrice,
      discountAmount,
      cartItems: items.map((item: any) => ({
        _id: item._id,
        qty: item.qty,
        price: item.price,
        name: item.name,
        image: item.image,
      })),
      user: userId,
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
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      allow_promotion_codes: true,
      metadata: { orderDetails },
    });

    res.status(200).json({ id: session.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const amount = (session?.amount_total ?? 0) / 100;

    const orderDetailsStr = session.metadata?.orderDetails;
    if (orderDetailsStr) {
      try {
        const orderDetails = JSON.parse(orderDetailsStr);
        const order = new Order({
          cartItems: orderDetails.cartItems,
          shippingAddress: orderDetails.shippingAddress,
          totalPrice: orderDetails.totalPrice,
          discountAmount: orderDetails.discountAmount || 0,
          user: orderDetails.user,
          isPaid: true,
          status: "paid",
        });
        const newOrder = await order.save();

        await updateProductStock(order.cartItems);

        if (session.customer_details?.email) {
          await sendPaymentConfirmationEmail(
            session.customer_details.email,
            newOrder._id.toString(),
            session.payment_method_types[0],
            amount
          );
        }
      } catch (parseError) {
        console.error("Failed to parse order details:", parseError);
      }
    }
  }

  res.status(200).json({ received: true });
};

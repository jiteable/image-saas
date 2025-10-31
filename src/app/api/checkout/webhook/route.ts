/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db/db";
import { orders, users } from "@/server/db/schema";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!);
export async function POST(request: NextRequest) {

  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig ?? "",
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(err);
    return new Response("", {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
      event.data.object.id,
      {
        expand: ["line_items"],
      }
    );
    // const lineItems = sessionWithLineItems.line_items;

    const order = await db.query.orders.findFirst({
      where: (orders, { eq }) =>
        eq(orders.sessionId, (event.data.object as any).id),
    });

    if (!order || order.status !== "created") {
      return new Response("", {
        status: 400,
      });
    }

    await db.update(orders).set({
      status: "completed",
    });

    await db.update(users).set({
      plan: "payed",
    });
  }
}
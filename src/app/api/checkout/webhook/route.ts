/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { db } from "@/server/db/db";
import { orders, users } from "@/server/db/schema";

const stripe = new Stripe(
  "sk_test_51OxJEERpNCX4mrCtH0CK84iMV2ZgEKLtbrAwnJ2YM48AT0fOaUXUS1FFIJoOnlTGDrOzzOthfsFMcWFnUf18OdC700goEMDYqe"
);
export async function POST(request: NextRequest) {

  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig ?? "",
      "whsec_af21a56affa68ddac7d32619197632aa40fc4ebbd7507cba26eb09bc73a35bc3"
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
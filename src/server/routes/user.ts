
import { Stripe } from 'stripe'
import { protectedProcedure, router } from "../trip";
import { db } from "../db/db";
import { TRPCError } from '@trpc/server';

export const userRoute = router({

  getPlan: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.query.users.findFirst({
      where: (users, { eq, and }) => eq(users.id, ctx.session.user!.id),
      columns: { plan: true }
    });

    return result;
  }),

  upgrade: protectedProcedure.mutation(async ({ ctx }) => {

    const stripe = new Stripe(
      "sk_test_51OxJEERpNCX4mrCtH0CK84iMV2ZgEKLtbrAwnJ2YM48AT0fOaUXUS1FFIJoOnlTGDrOzzOthfsFMcWFnUf18OdC700goEMDYqe"
    );

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: "prod_TKs1CGqIQwTXjP",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `http://localhost:3000/pay/callback/success`,
      cancel_url: `http://localhost:3000/pay/callback/cancel`,
    });

    if (!session.url) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR'
      })
    }

    return {
      url: session.url
    }


    // await db.update(users).set({
    //   plan: "payed",
    // });
  }),
});
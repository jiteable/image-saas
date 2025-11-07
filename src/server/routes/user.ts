import { Stripe } from 'stripe'
import { protectedProcedure, router } from "../trip";
import { db } from "../db/db";
import { TRPCError } from '@trpc/server';
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
      process.env.STRIPE_SECRET_KEY!
    );

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: process.env.STRIPE_PRODUCT_PRICE!,
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

  updateName: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Name cannot be empty").max(50, "Name too long")
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.update(users)
        .set({ name: input.name })
        .where(eq(users.id, ctx.session.user!.id))
        .returning({ name: users.name });

      if (result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      return result[0];
    }),
});
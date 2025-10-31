import { protectedProcedure, router } from "../trip";
import { db } from "../db/db";
import { users } from "../db/schema";

export const userRoute = router({

  getPlan: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.query.users.findFirst({
      where: (users, { eq, and }) => eq(users.id, ctx.session.user!.id),
      columns: { plan: true }
    });

    return result;
  }),

  upgrade: protectedProcedure.mutation(async ({ ctx }) => {

    await db.update(users).set({
      plan: "payed",
    });
  }),
});
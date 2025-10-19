import { uuid } from "zod";
import { createAppSchema } from "../db/validate-schema";
import { protectedProcedure, router } from "../trip";
import { db } from "../db/db";
import { apps } from "../db/schema";

export const appsRoute = router({
  createApp: protectedProcedure.input(createAppSchema.pick({ name: true, description: true })).mutation(async ({ ctx, input }) => {
    const result = await db.insert(apps).values({
      name: input.name,
      description: input.description,
      userId: ctx.session.user.id
    }).returning()

    return result[0]
  })
})
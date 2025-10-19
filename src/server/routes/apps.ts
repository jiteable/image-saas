import { uuid } from "zod";
import { createAppSchema } from "../db/validate-schema";
import { protectedProcedure, router } from "../trip";
import { db } from "../db/db";
import { apps } from "../db/schema";

export const appsRoute = router({
  createApp: protectedProcedure.input(createAppSchema).mutation(async ({ ctx, input }) => {
    return db.insert(apps).values({
      name: input.name,
      description: input.description,
      userId: ctx.session.user.id
    }).returning()
  })
})
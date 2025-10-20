import { createAppSchema } from "../db/validate-schema";
import { protectedProcedure, router } from "../trip";
import { db } from "../db/db";
import { apps } from "../db/schema";
import { desc } from "drizzle-orm"; // 添加此行导入


export const appsRoute = router({
  createApp: protectedProcedure.input(createAppSchema.pick({ name: true, description: true })).mutation(async ({ ctx, input }) => {
    const result = await db.insert(apps).values({
      name: input.name,
      description: input.description,
      userId: ctx.session.user.id
    }).returning()

    return result[0]
  }),

  listApps: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.query.apps.findMany({
      where: (apps, { eq, and, isNull }) => and(eq(apps.id, ctx.session.user.id), isNull(apps.deletedAt)),
      orderBy: [desc(apps.createdAt)]
    })

    return result
  })
})
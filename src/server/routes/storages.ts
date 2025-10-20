import { protectedProcedure, router } from "../trip";
import { db } from "../db/db";
import z from "zod"
import { storageConfiguration } from "../db/schema";
import { isConfig } from "drizzle-orm";


export const storagesRoute = router({
  listStorages: protectedProcedure.query(async ({ ctx }) => {
    return db.query.storageConfiguration.findMany({
      where: (storages, { eq, and, isNull }) => and(eq(storages.userId, ctx.session.user.id), isNull(storages.deletedAt))
    })
  }),

  createStorage: protectedProcedure.input(z.object({
    name: z.string().min(3).max(50),
    bucket: z.string().min(1),
    region: z.string().min(1),
    assessKeyId: z.string().min(1),
    secretAccessKey: z.string().min(1),
    apiEndpoint: z.string().optional()
  })).mutation(async ({ ctx, input }) => {

    const { name, ...configuration } = input

    const result = await db.insert(storageConfiguration).values({
      name: input.name,
      configuration: configuration,
      userId: ctx.session.user.id
    }).returning()

    return result[0]
  })
})
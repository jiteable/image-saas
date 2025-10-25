import { createAppSchema } from "../db/validate-schema";
import { protectedProcedure, router } from "../trip";
import { db } from "../db/db";
import { apps, storageConfiguration } from "../db/schema";
import { and, desc, eq } from "drizzle-orm"; // 添加此行导入
import z from "zod";
import { TRPCError } from "@trpc/server";

export const appsRoute = router({
  createApp: protectedProcedure.input(createAppSchema.pick({ name: true, description: true })).mutation(async ({ ctx, input }) => {
    // 首先检查是否存在默认存储配置，如果不存在则创建一个
    console.log("defaultStorageaaaaaaa: after")

    const userId = ctx.session.user?.id;
    console.log('userId: ', userId)
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated"
      });
    }

    let defaultStorage = await db.query.storageConfiguration.findFirst({
      where: (storage, { eq, and, isNull }) => and(
        eq(storage.userId, ctx.session.user!.id),
        eq(storage.name, 'Default COS Storage'),
        isNull(storage.deletedAt)
      )
    });

    console.log("defaultStorage: ", defaultStorage)

    // 如果默认存储配置不存在，则创建一个基于环境变量的默认配置
    if (!defaultStorage) {
      // 检查必要的环境变量是否存在
      const requiredEnvVars = ['BUCKET_NAME', 'API_ENDPOINT', 'REGION', 'COS_SECRET_ID', 'COS_SECRET_KEY'];
      const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

      if (missingEnvVars.length > 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Missing required environment variables: ${missingEnvVars.join(', ')}`
        });
      }

      const defaultStorageResult = await db.insert(storageConfiguration).values({
        name: 'Default COS Storage',
        userId: ctx.session.user!.id,
        configuration: {
          bucket: process.env.BUCKET_NAME!,
          region: process.env.REGION!,
          assessKeyId: process.env.COS_SECRET_ID!,
          secretAccessKey: process.env.COS_SECRET_KEY!,
          apiEndpoint: process.env.API_ENDPOINT!
        }
      }).returning();

      defaultStorage = defaultStorageResult[0];
    }

    // 创建应用并关联默认存储配置
    const result = await db.insert(apps).values({
      name: input.name,
      description: input.description,
      userId: ctx.session.user!.id,
      storageId: defaultStorage.id
    }).returning();

    return result[0];
  }),

  listApps: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.query.apps.findMany({
      where: (apps, { eq, and, isNull }) => and(eq(apps.userId, ctx.session.user!.id), isNull(apps.deletedAt)),
      orderBy: [desc(apps.createdAt)],
      with: {
        storage: true
      }
    });

    return result;
  }),

  changeStorage: protectedProcedure.input(z.object({ appId: z.string(), storageId: z.number() }))
    .mutation(async ({ ctx, input }) => {

      const storage = await db.query.storageConfiguration.findFirst({
        where: (storages, { eq }) => eq(storageConfiguration.id, input.storageId)
      });

      if (storage?.userId !== ctx.session.user!.id) {
        throw new TRPCError({
          code: "FORBIDDEN"
        });
      }

      await db.update(apps).set({
        storageId: input.storageId
      }).where(
        and(
          eq(apps.id, input.appId),
          eq(apps.userId, ctx.session.user!.id)
        )
      );
    })
});
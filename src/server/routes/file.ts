import z from "zod";
import { protectedProcedure, router } from "../trip"
import { TRPCError } from "@trpc/server";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { files } from "../db/schema";
import { db } from "../db/db";
import { desc, asc, sql, eq, isNull, and } from 'drizzle-orm';
import { filesCanOrderByColumns } from "../db/validate-schema";

const filesOrderByColumnSchema = z.object({
  field: filesCanOrderByColumns.keyof(),
  order: z.enum(['desc', 'asc']),
}).optional()

export type FilesOrderByColumn = z.infer<typeof filesOrderByColumnSchema>

export const fileRoutes = router({
  createPresignedUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 验证环境变量
      const bucketName = process.env.BUCKET_NAME;
      const apiEndpoint = process.env.API_ENDPOINT;
      const region = process.env.REGION;
      const cosSecretId = process.env.COS_SECRET_ID;
      const cosSecretKey = process.env.COS_SECRET_KEY;

      if (!bucketName || !apiEndpoint || !region || !cosSecretId || !cosSecretKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Missing required environment variables"
        });
      }

      const date = new Date();
      const isoString = date.toISOString();
      const dateString = isoString.split("T")[0];

      const params: PutObjectCommandInput = {
        Bucket: bucketName,
        Key: `${dateString}/${input.filename.replaceAll(" ", "_")}`,
        ContentType: input.contentType,
        ContentLength: input.size
      };

      const s3Client = new S3Client({
        endpoint: apiEndpoint,
        region: region,
        credentials: {
          accessKeyId: cosSecretId,
          secretAccessKey: cosSecretKey
        }
      });

      const command = new PutObjectCommand(params)
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 60,
      })

      return {
        url,
        method: "PUT" as const
      }

    }),

  saveFile: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        path: z.string(),
        type: z.string(),
        appId: z.string()
      }),
    ).mutation(async ({ ctx, input }) => {
      const { session } = ctx

      const url = new URL(input.path)

      const photo = await db.insert(files).values({
        ...input,
        path: url.pathname,
        url: url.toString(),
        userId: session.user.id,
        contentType: input.type
      }).returning() // 返回数据,数组

      return photo[0]
    }),

  listFiles: protectedProcedure
    .input(z.object({ appId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      const result = await db
        .select()
        .from(files)
        .orderBy(desc(files.createdAt))
        .where(
          and(
            eq(files.userId, session.user.id),
            eq(files.appId, input.appId)
          )
        );

      return result;
    }),

  infiniteQueryFiles: protectedProcedure
    .input(z.object({
      cursor: z.object({
        id: z.string(),
        createdAt: z.string() // 明确指定 createdAt 为 string 类型
      }).optional(),
      limit: z.number().default(10),
      orderBy: filesOrderByColumnSchema,
      appId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const { cursor, limit, orderBy = { field: 'createdAt', order: "desc" } } = input;

      const deleteFiler = isNull(files.deletedAt)
      const userFilter = eq(files.userId, ctx.session.user.id)
      const appFilter = eq(files.appId, input.appId)

      const statement = db.select().from(files).limit(limit).where(
        cursor
          ? and(sql`("files"."created_at", "files"."id") < (${new Date(cursor.createdAt).toISOString()}, ${cursor.id})`,
            deleteFiler,
            userFilter,
            appFilter
          ) : and(userFilter, deleteFiler, appFilter)
      );
      statement.orderBy(orderBy.order === 'desc' ? desc(files[orderBy.field]) : asc(files[orderBy.field]))

      const result = await statement

      return {
        items: result,
        nextCursor: result.length > 0 ? { createdAt: result[result.length - 1].createdAt!, id: result[result.length - 1].id } : null,
      }
    }),

  deleteFile: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return db.update(files).set({
      deletedAt: new Date()
    }).where(eq(files.id, input))
  })

})


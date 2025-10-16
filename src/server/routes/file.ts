import z from "zod";
import { protectedProcedure, router } from "../trip"
import { TRPCError } from "@trpc/server";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

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

    })

})
import { db } from "@/server/db/db";
import { GetObjectCommand, GetObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {

  const { id } = await context.params;

  const bucketName = process.env.BUCKET_NAME;
  const apiEndpoint = process.env.API_ENDPOINT;
  const region = process.env.REGION;
  const cosSecretId = process.env.COS_SECRET_ID;
  const cosSecretKey = process.env.COS_SECRET_KEY;

  if (!bucketName || !apiEndpoint || !region || !cosSecretId || !cosSecretKey) {
    throw new Error("Missing required environment variables for S3 configuration");
  }

  const file = await db.query.files.findFirst({
    where: (files, { eq }) => eq(files.id, id),
    with: {
      app: {
        with: {
          storage: true
        }
      }
    }
  })

  if (!file?.app.storage) {
    throw new TRPCError({
      code: 'BAD_REQUEST'
    })
  }

  const storage = file.app.storage.configuration

  if (!file || !file.contentType.startsWith('image')) {
    throw new NextResponse('', {
      status: 400
    })
  }

  // 解码路径，确保正确处理 URL 编码的字符
  const decodedPath = decodeURIComponent(file.path);

  const params: GetObjectCommandInput = {
    Bucket: bucketName,
    Key: decodedPath
  }

  const s3Client = new S3Client({
    endpoint: storage.apiEndpoint || apiEndpoint,
    region: storage.region || region,
    credentials: {
      accessKeyId: storage.assessKeyId || cosSecretId,
      secretAccessKey: storage.secretAccessKey || cosSecretKey
    }
  })

  try {
    const command = new GetObjectCommand(params)
    const response = await s3Client.send(command)

    const byteArray = await response.Body?.transformToByteArray()

    if (!byteArray) {
      return new NextResponse('', {
        status: 400
      })
    }

    const image = sharp(byteArray)

    image.resize({
      width: 250,
      height: 250
    })

    const buffer = await image.webp().toBuffer()

    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    })
  } catch (error: any) {
    // 处理 S3 错误，特别是 NoSuchKey 错误
    if (error.name === 'NoSuchKey') {
      console.error('S3 NoSuchKey error:', error);
      return new NextResponse('File not found', { status: 404 });
    }

    // 处理其他 S3 错误
    console.error('S3 error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
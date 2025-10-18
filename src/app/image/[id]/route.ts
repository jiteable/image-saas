import { db } from "@/server/db/db";
import { GetObjectCommand, GetObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp'
export async function GET(request: NextRequest, { params: { id } }: { params: { id: string } }) {

  const bucketName = process.env.BUCKET_NAME;
  const apiEndpoint = process.env.API_ENDPOINT;
  const region = process.env.REGION;
  const cosSecretId = process.env.COS_SECRET_ID;
  const cosSecretKey = process.env.COS_SECRET_KEY;

  if (!bucketName || !apiEndpoint || !region || !cosSecretId || !cosSecretKey) {
    throw new Error("Missing required environment variables for S3 configuration");
  }

  const file = await db.query.files.findFirst({
    where: (files, { eq }) => eq(files.id, id)
  })

  if (!file || !file.contentType.startsWith('image')) {
    throw new NextResponse('', {
      status: 400
    })
  }

  const params: GetObjectCommandInput = {
    Bucket: bucketName,
    Key: file.path

  }

  const s3Client = new S3Client({
    endpoint: apiEndpoint,
    region: region,
    credentials: {
      accessKeyId: cosSecretId,
      secretAccessKey: cosSecretKey
    }
  })

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

}
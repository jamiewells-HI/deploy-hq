import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.STORAGE_ENDPOINT_URL!,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(key: string, body: Buffer | Uint8Array, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET_NAME!,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`[R2 Storage] Fetch failed for ${key}:`, error);
    return false;
  }
}

export async function getFromR2(key: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME!,
      Key: key,
    });
  
    try {
      const response = await s3Client.send(command);
      return response.Body;
    } catch (error) {
      return null;
    }
}

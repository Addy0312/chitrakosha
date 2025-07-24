// Cloud storage integration (e.g., AWS S3, Cloudflare R2, or similar)
// This example uses AWS S3 SDK v3, but you can swap for R2 or GCS as needed.
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImageToCloud({
  fileBuffer,
  fileName,
  contentType,
  folder = 'uploads',
}: {
  fileBuffer: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}): Promise<string> {
  const key = `${folder}/${fileName}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );
  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
}

import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const bucket = process.env.S3_BUCKET;
const publicUrl = process.env.S3_PUBLIC_URL;

const client = new S3Client({ region: process.env.AWS_REGION });

export const createProductImageUpload = async (contentType) => {
  const key = `products/${randomUUID()}.${ALLOWED_IMAGE_TYPES[contentType]}`;

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 60 }
  );

  return { uploadUrl, key, url: `${publicUrl}/${key}` };
};

export const deleteImageByUrl = async (url) => {
  if (typeof url !== 'string' || !url.startsWith(`${publicUrl}/`)) return false;

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: url.slice(publicUrl.length + 1) }));

  return true;
};

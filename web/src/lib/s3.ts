import { S3Client } from "bun";

const s3 = new S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  bucket: process.env.S3_BUCKET,
});

export function getPresignedPutUrl(
  shareId: string,
  expiresIn: number = 3600,
  maxSize?: number,
): string {
  return s3.presign(`sessions/${shareId}.json`, {
    expiresIn,
    method: "PUT",
    type: "application/json",
    ...(maxSize && { maxSize }),
  });
}

export async function getShareData(shareId: string): Promise<unknown | null> {
  try {
    const file = s3.file(`sessions/${shareId}.json`);

    // const exists = await file.exists();

    // if (!exists) {
    //   return null;
    // }

    return await file.json();
  } catch (error) {
    console.error("[s3] Error fetching share:", error);
    return null;
  }
}

export async function deleteShareData(shareId: string): Promise<void> {
  await s3.delete(`sessions/${shareId}.json`);
}

const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL;

export function getPublicUrl(shareId: string): string {
  return `${S3_PUBLIC_URL}/sessions/${shareId}.json`;
}

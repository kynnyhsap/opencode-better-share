import { S3Client } from "bun";

// Create S3 client using environment variables
// Bun automatically reads S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_BUCKET
const s3 = new S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  bucket: process.env.S3_BUCKET,
});

/**
 * Generate a presigned URL for uploading a share
 * @param shareId - The share ID
 * @param expiresIn - URL expiry in seconds (default 1 hour)
 * @param maxSize - Maximum upload size in bytes (optional)
 */
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

/**
 * Get share data directly from S3/R2
 */
export async function getShareData(shareId: string): Promise<unknown | null> {
  try {
    const file = s3.file(`sessions/${shareId}.json`);
    const exists = await file.exists();

    if (!exists) {
      return null;
    }

    return await file.json();
  } catch (error) {
    console.error("[s3] Error fetching share:", error);
    return null;
  }
}

/**
 * Delete share data from S3/R2
 */
export async function deleteShareData(shareId: string): Promise<void> {
  await s3.delete(`sessions/${shareId}.json`);
}

/**
 * Get public URL for a share (if bucket is public)
 */
export function getPublicUrl(shareId: string): string {
  const publicUrl = process.env.S3_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/sessions/${shareId}.json`;
  }
  // Fallback to API route
  return `${process.env.BASE_URL}/api/share/${shareId}`;
}

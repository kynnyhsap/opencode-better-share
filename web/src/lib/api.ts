import { randomBytes, timingSafeEqual } from "node:crypto";
import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { createShare, deleteShare, getShare, shareExists } from "./db";
import { deleteShareData, getPresignedPutUrl, getShareData } from "./s3";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/**
 * Timing-safe secret comparison to prevent timing attacks
 */
function verifySecret(provided: string, stored: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const storedBuffer = Buffer.from(stored);

  if (providedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, storedBuffer);
}

export const app = new Elysia({ prefix: "/api" })
  .use(cors())

  // General rate limit: 100 requests per minute per IP
  // Skips /share/presign which has its own stricter limit
  .use(
    rateLimit({
      duration: 60_000, // 1 minute
      max: 100,
      skip: (request) => {
        const url = new URL(request.url);
        // Skip general limit for share creation (has stricter limit below)
        return url.pathname === "/api/share/presign";
      },
      errorResponse: new Response(
        JSON.stringify({ error: "Too many requests", code: "RATE_LIMITED" }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      ),
    }),
  )

  // Stricter rate limit for share creation: 10 shares per hour per IP
  .use(
    rateLimit({
      duration: 60 * 60 * 1000, // 1 hour
      max: 10,
      skip: (request) => {
        const url = new URL(request.url);
        // Only apply to share creation endpoint
        return url.pathname !== "/api/share/presign";
      },
      errorResponse: new Response(
        JSON.stringify({
          error: "Share creation rate limit exceeded. Try again later.",
          code: "SHARE_RATE_LIMITED",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      ),
    }),
  )

  .get("/health", () => ({ ok: true, timestamp: Date.now() }))

  // Create share - generate secret & presigned URL
  .post(
    "/share/presign",
    async ({ body, set }) => {
      const { shareId, sessionId } = body;

      // Check if share already exists
      if (await shareExists(shareId)) {
        set.status = 409;
        return {
          error: "Share already exists",
          code: "SHARE_EXISTS",
        };
      }

      // Generate secret
      const secret = randomBytes(24).toString("base64url");

      // Store in DB
      await createShare(shareId, sessionId, secret);

      // Generate presigned PUT URL (1 hour expiry)
      const presignedUrl = await getPresignedPutUrl(shareId, 3600);

      return {
        presignedUrl,
        secret,
        url: `${BASE_URL}/share/${shareId}`,
      };
    },
    {
      body: t.Object({
        shareId: t.String(),
        sessionId: t.String(),
      }),
    },
  )

  // Get presigned URL for sync (requires secret)
  .post("/share/:id/presign", async ({ params, headers, set }) => {
    const secret = headers["x-share-secret"];

    if (!secret) {
      set.status = 401;
      return { error: "Missing secret" };
    }

    const share = await getShare(params.id);

    if (!share) {
      set.status = 404;
      return { error: "Share not found" };
    }

    if (!verifySecret(secret, share.secret)) {
      set.status = 401;
      return { error: "Invalid secret" };
    }

    // Generate presigned PUT URL
    const presignedUrl = await getPresignedPutUrl(params.id, 3600);

    return { presignedUrl };
  })

  // Get share data (public)
  .get("/share/:id", async ({ params, set }) => {
    // First check if share exists in our DB
    const share = await getShare(params.id);

    if (!share) {
      set.status = 404;
      return { error: "Share not found" };
    }

    // Fetch from R2
    const data = await getShareData(params.id);

    if (!data) {
      set.status = 404;
      return { error: "Share data not found" };
    }

    return data;
  })

  // Delete share (requires secret)
  .delete("/share/:id", async ({ params, headers, set }) => {
    const secret = headers["x-share-secret"];

    if (!secret) {
      set.status = 401;
      return { error: "Missing secret" };
    }

    const share = await getShare(params.id);

    if (!share) {
      set.status = 404;
      return { error: "Share not found" };
    }

    if (!verifySecret(secret, share.secret)) {
      set.status = 401;
      return { error: "Invalid secret" };
    }

    // Delete from R2
    await deleteShareData(params.id);

    // Delete from DB
    await deleteShare(params.id);

    return { ok: true };
  });

export type App = typeof app;

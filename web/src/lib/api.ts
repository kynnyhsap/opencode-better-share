import { randomBytes, timingSafeEqual } from "node:crypto";
import { cors } from "@elysiajs/cors";
import { Value } from "@sinclair/typebox/value";
import { Elysia, t } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { createShare, deleteShare, getShare, shareExists } from "./db";
import { deleteShareData, getPresignedPutUrl, getShareData } from "./s3";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const MB = 1024 * 1024;
const MAX_UPLOAD_SIZE = 100 * MB;

// Share ID format: alphanumeric with underscores and hyphens
const SHARE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function generateSecret(): string {
  return randomBytes(24).toString("base64url");
}

/**
 * Schema for validating share data structure
 */
const ShareDataSchema = t.Object({
  shareId: t.String(),
  sessionId: t.String(),
  createdAt: t.Number(),
  updatedAt: t.Number(),
  session: t.Object({
    id: t.String(),
    title: t.String(),
    projectID: t.String(),
    directory: t.String(),
    version: t.String(),
    time: t.Object({
      created: t.Number(),
      updated: t.Number(),
    }),
    summary: t.Optional(
      t.Object({
        additions: t.Number(),
        deletions: t.Number(),
        files: t.Number(),
      }),
    ),
  }),
  messages: t.Array(
    t.Object({
      id: t.String(),
      sessionID: t.String(),
      role: t.Union([t.Literal("user"), t.Literal("assistant")]),
      model: t.Optional(
        t.Object({
          providerID: t.String(),
          modelID: t.String(),
        }),
      ),
      time: t.Object({
        created: t.Number(),
        updated: t.Number(),
      }),
      parts: t.Array(
        t.Object(
          {
            id: t.String(),
            messageID: t.String(),
            sessionID: t.String(),
            type: t.String(),
          },
          { additionalProperties: true },
        ),
      ),
    }),
  ),
});

/**
 * Validate share ID format to prevent path traversal
 */
function isValidShareId(shareId: string): boolean {
  return SHARE_ID_REGEX.test(shareId) && shareId.length > 0 && shareId.length <= 100;
}

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

      // Validate share ID format (prevent path traversal)
      if (!isValidShareId(shareId)) {
        set.status = 400;
        return {
          error: "Invalid share ID format",
          code: "INVALID_SHARE_ID",
        };
      }

      // Check if share already exists
      if (await shareExists(shareId)) {
        set.status = 409;
        return {
          error: "Share already exists",
          code: "SHARE_EXISTS",
        };
      }

      const secret = generateSecret();

      await createShare(shareId, sessionId, secret);

      // Generate presigned PUT URL (1 hour expiry, 25MB max)
      const presignedUrl = getPresignedPutUrl(shareId, 3600, MAX_UPLOAD_SIZE);

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

    // Validate share ID format
    if (!isValidShareId(params.id)) {
      set.status = 400;
      return { error: "Invalid share ID format" };
    }

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

    // Generate presigned PUT URL (1 hour expiry, 25MB max)
    const presignedUrl = getPresignedPutUrl(params.id, 3600, MAX_UPLOAD_SIZE);

    return { presignedUrl };
  })

  // Get share data (public)
  .get("/share/:id", async ({ params, set }) => {
    // Validate share ID format
    if (!isValidShareId(params.id)) {
      set.status = 400;
      return { error: "Invalid share ID format" };
    }

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

    // Validate share data structure
    if (!Value.Check(ShareDataSchema, data)) {
      const errors = [...Value.Errors(ShareDataSchema, data)];
      console.error("[api] Invalid share data structure:", errors);
      set.status = 500;
      return { error: "Invalid share data structure" };
    }

    return data;
  })

  // Delete share (requires secret)
  .delete("/share/:id", async ({ params, headers, set }) => {
    // Validate share ID format
    if (!isValidShareId(params.id)) {
      set.status = 400;
      return { error: "Invalid share ID format" };
    }

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

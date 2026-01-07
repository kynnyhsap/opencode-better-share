import { randomBytes } from "node:crypto";
import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { createShare, deleteShare, getShare, shareExists } from "./db";
import { deleteShareData, getPresignedPutUrl, getShareData } from "./s3";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export const app = new Elysia({ prefix: "/api" })
  .use(cors())

  .get("/health", () => ({ ok: true, timestamp: Date.now() }))

  // Create share - generate secret & presigned URL
  .post(
    "/share/presign",
    async ({ body, set }) => {
      const { shareId, sessionId } = body;

      // Check if share already exists
      if (shareExists(shareId)) {
        set.status = 409;
        return {
          error: "Share already exists",
          code: "SHARE_EXISTS",
        };
      }

      // Generate secret
      const secret = randomBytes(24).toString("base64url");

      // Store in DB
      createShare(shareId, sessionId, secret);

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

    const share = getShare(params.id);

    if (!share) {
      set.status = 404;
      return { error: "Share not found" };
    }

    if (share.secret !== secret) {
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
    const share = getShare(params.id);

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

    const share = getShare(params.id);

    if (!share) {
      set.status = 404;
      return { error: "Share not found" };
    }

    if (share.secret !== secret) {
      set.status = 401;
      return { error: "Invalid secret" };
    }

    // Delete from R2
    await deleteShareData(params.id);

    // Delete from DB
    deleteShare(params.id);

    return { ok: true };
  });

export type App = typeof app;

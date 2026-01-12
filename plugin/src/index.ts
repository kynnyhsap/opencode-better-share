import type { Plugin } from "@opencode-ai/plugin";
import type { Session } from "@opencode-ai/sdk";
import { sleep } from "bun";
import clipboard from "clipboardy";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { BETTER_SHARE_BASE_URL, getBetterShareUrl, getShareId } from "./common";
import { findProjectForSession, readFullSession } from "./storage";
import type { ShareData } from "./types";

const LOG_FILE = join(__dirname, "debug.log");

function log(...args: unknown[]) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(" ")}\n`;
  appendFileSync(LOG_FILE, message);
}

interface PresignResponse {
  presignedUrl: string;
  secret: string;
  url: string;
}

async function requestPresignedUrl(session: Session): Promise<PresignResponse | null> {
  const shareId = getShareId(session.id);
  const sessionId = session.id;

  log("Requesting presigned URL for", shareId);

  try {
    const response = await fetch(`${BETTER_SHARE_BASE_URL}/api/share/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareId, sessionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      log("Failed to get presigned URL:", error);
      return null;
    }

    return response.json();
  } catch (error) {
    log("Error requesting presigned URL:", error);
    return null;
  }
}

// TODO: this method is flaky, i need to make it more reliable
async function overrideClipboard(url: string) {
  sleep(100);
  // OpenCode copies its share URL to clipboard
  // We want to replace it with our Better Share URL
  const timeoutMs = 1000;
  const startedAt = Date.now();

  let currentClipboardText = await clipboard.read();

  while (currentClipboardText !== url && Date.now() - startedAt < timeoutMs) {
    await clipboard.write(url);
    currentClipboardText = await clipboard.read();
  }

  sleep(100);

  if (currentClipboardText !== url) {
    await clipboard.write(url);
  }
}

async function uploadSession(presignedUrl: string, shareData: ShareData): Promise<boolean> {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shareData),
    });

    if (!response.ok) {
      log("Failed to upload session:", response.status, response.statusText);
      return false;
    }

    log("Session uploaded successfully");
    return true;
  } catch (error) {
    log("Error uploading session:", error);
    return false;
  }
}

async function handleSessionShare(session: Session) {
  if (!session.share?.url) {
    return;
  }

  log("Session shared:", session.id);

  // Override clipboard immediately
  const betterShareUrl = getBetterShareUrl(session.id);
  log("Better share URL:", betterShareUrl);
  overrideClipboard(betterShareUrl).then(() => {
    log("Clipboard set to:", betterShareUrl);
  });

  // Request presigned URL for S3 upload
  const result = await requestPresignedUrl(session);
  if (!result) {
    log("Failed to get presigned URL, aborting upload");
    return;
  }

  log("Got presigned URL:", result.presignedUrl);
  log("Secret:", result.secret);

  // Find project ID for this session
  const projectId = await findProjectForSession(session.id);
  if (!projectId) {
    log("Could not find project for session:", session.id);
    return;
  }

  log("Found project:", projectId);

  // Read full session data
  const sessionData = await readFullSession(projectId, session.id);
  if (!sessionData) {
    log("Could not read session data");
    return;
  }

  log("Read session with", sessionData.messages.length, "messages");

  // Build share data
  const shareId = getShareId(session.id);
  const now = Date.now();
  const shareData: ShareData = {
    shareId,
    sessionId: session.id,
    createdAt: now,
    updatedAt: now,
    session: sessionData.session,
    messages: sessionData.messages,
  };

  // Upload to R2
  await uploadSession(result.presignedUrl, shareData);
}

export const BetterSharePlugin: Plugin = async () => {
  return {
    config: async (config) => {
      config.theme = "orng"; // DEBUG: remove in production
    },

    event: async ({ event }) => {
      switch (event.type) {
        case "session.updated": {
          await handleSessionShare(event.properties.info);
          break;
        }

        default: {
          break;
        }
      }
    },
  };
};

import type { Plugin, PluginInput } from "@opencode-ai/plugin";
import { ShareManager } from "./share";

/**
 * Better Share Plugin for OpenCode
 *
 * Provides custom sharing functionality with your own backend.
 * Overrides the built-in /share and /unshare commands.
 */
export const BetterSharePlugin: Plugin = async (ctx) => {
  const shareManager = new ShareManager();

  // Load persisted shares from disk
  await shareManager.initialize();

  return {
    /**
     * Event handler for all OpenCode events
     */
    event: async ({ event }) => {
      switch (event.type) {
        case "command.executed": {
          const props = event.properties;

          if (props.name === "share") {
            await handleShare(ctx, shareManager, props.sessionID);
          } else if (props.name === "unshare") {
            await handleUnshare(ctx, shareManager, props.sessionID);
          }
          break;
        }

        case "session.updated": {
          // Queue sync if this session is shared
          const sessionInfo = event.properties.info;
          if (shareManager.isShared(sessionInfo.id)) {
            shareManager.queueSync(sessionInfo.id);
          }
          break;
        }

        case "message.updated": {
          // Queue sync when messages change
          const messageInfo = event.properties.info;
          if (shareManager.isShared(messageInfo.sessionID)) {
            shareManager.queueSync(messageInfo.sessionID);
          }
          break;
        }

        case "message.part.updated": {
          // Queue sync when parts change (streaming)
          const partInfo = event.properties.part;
          if (shareManager.isShared(partInfo.sessionID)) {
            shareManager.queueSync(partInfo.sessionID);
          }
          break;
        }

        case "session.deleted": {
          // Auto-unshare when session is deleted
          const sessionInfo = event.properties.info;
          if (shareManager.isShared(sessionInfo.id)) {
            await shareManager.removeShare(sessionInfo.id);
          }
          break;
        }
      }
    },
  };
};

/**
 * Handle /share command
 */
async function handleShare(
  ctx: PluginInput,
  shareManager: ShareManager,
  sessionId: string,
): Promise<void> {
  if (!sessionId) {
    await showToast(ctx, "No active session", "error");
    return;
  }

  // Check if already shared
  const existingShare = shareManager.getShareInfo(sessionId);
  if (existingShare) {
    await showToast(ctx, `Already shared: ${existingShare.url}`, "info");
    return;
  }

  // Call OpenCode SDK to create share (gets us the share ID)
  try {
    const result = await ctx.client.session.share({
      path: { id: sessionId },
    });

    if (!result.data?.share?.url) {
      await showToast(ctx, "Failed to create share", "error");
      return;
    }

    // Extract share ID from OpenCode's URL
    // URL format: https://opncd.ai/share/SHARE_ID
    const openCodeUrl = result.data.share.url;
    const shareId = openCodeUrl.split("/").pop();

    if (!shareId) {
      await showToast(ctx, "Failed to get share ID", "error");
      return;
    }

    // Create our share
    const shareResult = await shareManager.createShare(sessionId, shareId);

    if (shareResult.error) {
      await showToast(ctx, `Share failed: ${shareResult.error}`, "error");
      return;
    }

    await showToast(ctx, shareResult.url, "success");
  } catch (err) {
    await showToast(ctx, `Share failed: ${err}`, "error");
  }
}

/**
 * Handle /unshare command
 */
async function handleUnshare(
  ctx: PluginInput,
  shareManager: ShareManager,
  sessionId: string,
): Promise<void> {
  if (!sessionId) {
    await showToast(ctx, "No active session", "error");
    return;
  }

  // Check if shared
  if (!shareManager.isShared(sessionId)) {
    await showToast(ctx, "Session is not shared", "error");
    return;
  }

  // Remove our share
  const result = await shareManager.removeShare(sessionId);

  if (result.error) {
    await showToast(ctx, `Unshare failed: ${result.error}`, "error");
    return;
  }

  // Also call OpenCode SDK to unshare
  try {
    await ctx.client.session.unshare({
      path: { id: sessionId },
    });
  } catch {
    // Ignore errors from OpenCode unshare
  }

  await showToast(ctx, "Share removed", "success");
}

/**
 * Show toast notification
 */
async function showToast(
  ctx: PluginInput,
  message: string,
  variant: "success" | "error" | "info" = "info",
): Promise<void> {
  try {
    await ctx.client.tui.showToast({
      body: { message, variant },
    });
  } catch {
    // Fallback to console
    console.log(`[better-share] ${variant}: ${message}`);
  }
}

// Default export
export default BetterSharePlugin;

export { ShareManager } from "./share";
// Named exports for types
export * from "./types";

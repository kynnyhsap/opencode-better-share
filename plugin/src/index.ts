import type { Plugin } from "@opencode-ai/plugin";

const BETTER_SHARE_BASE_URL = process.env.BETTER_SHARE_BASE_URL || "https://opncd.com";

/**
 * Returns share id from session id. OpenCode's share ID is the last 8 characters of the session ID
 */
function getShareId(sessionID: string): string {
  return sessionID.slice(-8);
}

function getShareUrl(sessionID: string): string {
  return `${BETTER_SHARE_BASE_URL}/share/${getShareId(sessionID)}`;
}

export const BetterSharePlugin: Plugin = async (ctx) => {
  /**
   * Get current clipboard text (macOS only for now)
   * TODO: Support other platforms
   */
  async function getCurrentClipboardText(): Promise<string> {
    const result = await ctx.$`pbpaste`.text();
    return result.trim();
  }

  /**
   * Set clipboard text (macOS only for now)
   * TODO: Support other platforms
   */
  async function setClipboardText(text: string): Promise<void> {
    await ctx.$`printf '%s' ${text} | pbcopy`.quiet();
  }

  return {
    event: async ({ event }) => {
      switch (event.type) {
        case "session.updated": {
          const sessionID = event.properties.info.id;
          const shareId = getShareId(sessionID);

          const betterShareUrl = getShareUrl(sessionID);

          const shareUrl = event.properties.info.share?.url;

          // TODO: use proper clipboard module to account for each platform
          if (shareUrl) {
            // opencode will copy to shareUrl to clipboard
            // but we want to set our own share url to clipboard

            // so we will check for that clipboard text and set it in the loop
            // until the clipboard text is our own share url
            let currentClipboardText = await getCurrentClipboardText();

            // add timeout to avoid infinite loop
            const timeoutMs = 1000;
            const startedAt = Date.now();

            while (currentClipboardText !== betterShareUrl && Date.now() - startedAt < timeoutMs) {
              await setClipboardText(betterShareUrl);
              currentClipboardText = await getCurrentClipboardText();
            }
          }

          break;
        }

        default: {
          break;
        }
      }
    },
  };
};

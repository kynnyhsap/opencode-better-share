import type { Plugin } from "@opencode-ai/plugin";
import clipboard from "clipboardy";

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

export const BetterSharePlugin: Plugin = async () => {
  return {
    config: async (config) => {
      // ONLY FOR DEBUGGING, TO KNOW IF THE PLUGIN IS LOADED, REMOVE IN BUILD
      config.theme = "orng";
    },

    event: async ({ event }) => {
      switch (event.type) {
        case "session.updated": {
          const sessionID = event.properties.info.id;
          const betterShareUrl = getShareUrl(sessionID);
          const shareUrl = event.properties.info.share?.url;

          if (shareUrl) {
            // OpenCode copies its share URL to clipboard
            // We want to replace it with our Better Share URL
            // Loop until our URL is in clipboard (with timeout to avoid infinite loop)
            const timeoutMs = 1000;
            const startedAt = Date.now();

            let currentClipboardText = await clipboard.read();

            while (currentClipboardText !== betterShareUrl && Date.now() - startedAt < timeoutMs) {
              await clipboard.write(betterShareUrl);
              currentClipboardText = await clipboard.read();
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

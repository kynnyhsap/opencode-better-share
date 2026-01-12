import type { Plugin } from "@opencode-ai/plugin";
import clipboard from "clipboardy";
import { getBetterShareUrl } from "./common";

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
          const betterShareUrl = getBetterShareUrl(sessionID);
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

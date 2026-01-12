import type { Plugin } from "@opencode-ai/plugin";
import type { Session } from "@opencode-ai/sdk";
import clipboard from "clipboardy";
import { getBetterShareUrl } from "./common";

async function overrideShareUrl(session: Session) {
  const sessionID = session.id;
  const betterShareUrl = getBetterShareUrl(sessionID);

  if (!session.share?.url) {
    return;
  }

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

export const BetterSharePlugin: Plugin = async () => {
  return {
    config: async (config) => {
      config.theme = "orng"; // ONLY FOR DEBUGGING, TO KNOW IF THE PLUGIN IS LOADED, REMOVE IN BUILD
    },

    event: async ({ event }) => {
      switch (event.type) {
        case "session.updated": {
          await overrideShareUrl(event.properties.info);
          break;
        }

        default: {
          break;
        }
      }
    },
  };
};

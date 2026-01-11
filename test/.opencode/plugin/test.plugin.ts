import type { Plugin } from "@opencode-ai/plugin";

import fs from 'fs';

function log(message: string, data: any) {
  const timestamp = new Date().toISOString();
  const path = './test-plugin.log';
  const content = `[${timestamp}] ${message} ${JSON.stringify(data, null, 2)}\n\n`;
  fs.appendFileSync(path, content);
}

const BETTER_SHARE_BASE_URL = process.env.BETTER_SHARE_BASE_URL || "https://opncd.com";

export const TestPlugin: Plugin = async (ctx) => {

  function getCurrentClipboardText() {
    return ctx.$`pbpaste | xargs echo`.text();
  }

  function setClipboardText(text: string) {
    return ctx.$`echo "${text}" | pbcopy`.quiet();
  }
  
  return {
    event: async ({ event }) => {
      if (event.type === "session.updated") {
        const sessionID = event.properties.info.id;
        const shareId = sessionID.slice(-8);

        const betterShareUrl = `${BETTER_SHARE_BASE_URL}/share/${shareId}`;

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

          while (currentClipboardText !== betterShareUrl && (Date.now() - startedAt) < timeoutMs) {
            await setClipboardText(betterShareUrl);
            currentClipboardText = await getCurrentClipboardText();
          }
        }
      }
    },

  };
};

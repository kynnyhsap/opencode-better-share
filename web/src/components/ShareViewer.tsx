"use client";

import { useEffect, useState } from "react";
import type { ShareData } from "@/lib/types";
import { Header } from "./Header";
import { MessageList } from "./MessageList";

export type Theme = "dark" | "light";

// Font options using CSS variables from next/font
export const FONTS = [
  { name: "Geist Mono", value: "var(--font-geist-mono), monospace" },
  { name: "JetBrains Mono", value: "var(--font-jetbrains-mono), monospace" },
  { name: "Fira Code", value: "var(--font-fira-code), monospace" },
] as const;

export type FontOption = (typeof FONTS)[number];

interface ShareViewerProps {
  data: ShareData;
}

export function ShareViewer({ data }: ShareViewerProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [font, setFont] = useState<FontOption>(FONTS[0]);

  // Update document title
  useEffect(() => {
    document.title = `${data.session.title} (${data.shareId}) | opncd.com`;
  }, [data.session.title, data.shareId]);

  // Get model info from first assistant message
  const firstAssistantMessage = data.messages.find((m) => m.info.role === "assistant");
  const model = firstAssistantMessage?.info.model;

  // Calculate total tokens and cost from all assistant messages
  const { totalTokens, totalCost } = data.messages.reduce(
    (acc, msg) => {
      if (msg.info.role === "assistant" && msg.info.tokens) {
        const tokens = msg.info.tokens;
        acc.totalTokens += tokens.input + tokens.output + tokens.reasoning;
      }
      // Cost is typically stored per message (but not always)
      return acc;
    },
    { totalTokens: 0, totalCost: 0 },
  );

  const themeStyles =
    theme === "dark"
      ? {
          bg: "#0a0a0a",
          bgSecondary: "#111",
          text: "#ededed",
          textMuted: "#888",
          border: "#333",
          userBg: "#1a1a2e",
          assistantBg: "#111",
        }
      : {
          bg: "#ffffff",
          bgSecondary: "#f5f5f5",
          text: "#1a1a1a",
          textMuted: "#666",
          border: "#e0e0e0",
          userBg: "#f0f4ff",
          assistantBg: "#fafafa",
        };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: themeStyles.bg,
        color: themeStyles.text,
        fontFamily: font.value,
      }}
    >
      <Header
        shareId={data.shareId}
        sessionId={data.sessionId}
        sessionTitle={data.session.title}
        version={data.session.version}
        model={model}
        totalTokens={totalTokens}
        totalCost={totalCost}
        theme={theme}
        onThemeChange={setTheme}
        font={font}
        onFontChange={setFont}
        themeStyles={themeStyles}
      />

      <main style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        {/* Session title like OpenCode */}
        <div
          style={{
            borderLeft: "3px solid #d97706",
            paddingLeft: "16px",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 500,
              color: themeStyles.text,
            }}
          >
            # {data.session.title}
          </h1>
        </div>

        <MessageList messages={data.messages} theme={theme} themeStyles={themeStyles} />
      </main>
    </div>
  );
}

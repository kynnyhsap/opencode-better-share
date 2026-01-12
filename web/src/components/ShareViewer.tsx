"use client";

import { useEffect, useState } from "react";
import { calculateContextPercentage, getModelInfo, type ModelInfo } from "@/lib/models";
import type { AssistantMessage, ShareData } from "@/lib/types";
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

function isAssistantMessage(info: ShareData["messages"][0]["info"]): info is AssistantMessage {
  return info.role === "assistant";
}

export function ShareViewer({ data }: ShareViewerProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [font, setFont] = useState<FontOption>(FONTS[0]);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  // Update document title
  useEffect(() => {
    document.title = `${data.session.title} (${data.shareId}) | opncd.com`;
  }, [data.session.title, data.shareId]);

  // Get first assistant message for model info
  const firstAssistantMsg = data.messages.find((m) => isAssistantMessage(m.info));
  const firstAssistant = firstAssistantMsg?.info as AssistantMessage | undefined;
  const providerID = firstAssistant?.providerID;
  const modelID = firstAssistant?.modelID;

  // Fetch model info from models.dev API
  useEffect(() => {
    if (providerID && modelID) {
      getModelInfo(providerID, modelID).then(setModelInfo);
    }
  }, [providerID, modelID]);

  const model = providerID && modelID ? { providerID, modelID } : undefined;

  // Get context tokens from last assistant message (like OpenCode does)
  const lastAssistantMsg = [...data.messages]
    .reverse()
    .find((m) => isAssistantMessage(m.info) && (m.info as AssistantMessage).tokens.output > 0);
  const lastAssistant = lastAssistantMsg?.info as AssistantMessage | undefined;

  // Calculate context tokens (input + output + reasoning + cache read + cache write)
  const contextTokens = lastAssistant
    ? lastAssistant.tokens.input +
      lastAssistant.tokens.output +
      lastAssistant.tokens.reasoning +
      lastAssistant.tokens.cache.read +
      lastAssistant.tokens.cache.write
    : 0;

  // Calculate total cost from all assistant messages
  const totalCost = data.messages.reduce((acc, msg) => {
    if (isAssistantMessage(msg.info)) {
      return acc + msg.info.cost;
    }
    return acc;
  }, 0);

  // Calculate context percentage if we have model info
  const contextPercentage = modelInfo?.limit?.context
    ? calculateContextPercentage(contextTokens, modelInfo.limit.context)
    : null;

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
        version={data.session.version}
        model={model}
        theme={theme}
        onThemeChange={setTheme}
        font={font}
        onFontChange={setFont}
        themeStyles={themeStyles}
      />

      <main style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        {/* Session title with stats - like OpenCode */}
        <div
          style={{
            borderLeft: "3px solid #d97706",
            paddingLeft: "16px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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

          {/* Stats on the right - format: "13,501  7% ($0.00)" */}
          <div
            style={{
              fontSize: "0.875rem",
              color: themeStyles.textMuted,
              display: "flex",
              gap: "8px",
            }}
          >
            <span>{contextTokens.toLocaleString()}</span>
            {contextPercentage !== null && <span>{contextPercentage}%</span>}
            <span>({totalCost > 0 ? `$${totalCost.toFixed(2)}` : "$0.00"})</span>
          </div>
        </div>

        <MessageList messages={data.messages} theme={theme} themeStyles={themeStyles} />
      </main>
    </div>
  );
}

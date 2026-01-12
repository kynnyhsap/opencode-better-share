"use client";

import { useEffect, useMemo, useState } from "react";
import { usePersistedState } from "@/lib/hooks";
import { calculateContextPercentage, getModelInfo, type ModelInfo } from "@/lib/models";
import {
  type ColorScheme,
  DEFAULT_THEME_ID,
  resolveTheme,
  themeToStyles,
  THEMES,
  type ThemeStyles,
} from "@/lib/theme";
import type { AssistantMessage, ShareData } from "@/lib/types";
import { Header } from "./Header";
import { MessageList } from "./MessageList";

// Font options using CSS variables from next/font
export const FONTS = [
  { name: "Geist Mono", value: "var(--font-geist-mono), monospace" },
  { name: "JetBrains Mono", value: "var(--font-jetbrains-mono), monospace" },
  { name: "Fira Code", value: "var(--font-fira-code), monospace" },
] as const;

export type FontOption = (typeof FONTS)[number];
export type { ThemeStyles };

interface ShareViewerProps {
  data: ShareData;
}

function isAssistantMessage(info: ShareData["messages"][0]["info"]): info is AssistantMessage {
  return info.role === "assistant";
}

export function ShareViewer({ data }: ShareViewerProps) {
  // Persisted preferences
  const [themeId, setThemeId] = usePersistedState("theme", DEFAULT_THEME_ID);
  const [colorScheme, setColorScheme] = usePersistedState<ColorScheme>("colorScheme", "dark");
  const [fontIndex, setFontIndex] = usePersistedState("fontIndex", 0);

  // Derive font from index (for serialization)
  const font = FONTS[fontIndex] || FONTS[0];
  const setFont = (f: FontOption) => {
    const idx = FONTS.findIndex((opt) => opt.value === f.value);
    setFontIndex(idx >= 0 ? idx : 0);
  };

  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  // Resolve the current theme
  const themeStyles = useMemo(() => {
    const theme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
    const resolved = resolveTheme(theme, colorScheme);
    return themeToStyles(resolved);
  }, [themeId, colorScheme]);

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
        themeId={themeId}
        onThemeChange={setThemeId}
        colorScheme={colorScheme}
        onColorSchemeChange={setColorScheme}
        font={font}
        onFontChange={setFont}
        themeStyles={themeStyles}
      />

      <main style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        {/* Session title with stats - like OpenCode TUI header */}
        <div
          style={{
            backgroundColor: themeStyles.bgSecondary,
            borderLeft: `3px solid ${themeStyles.border}`,
            paddingLeft: "16px",
            paddingTop: "12px",
            paddingBottom: "12px",
            paddingRight: "12px",
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

        <MessageList messages={data.messages} colorScheme={colorScheme} themeStyles={themeStyles} />
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FONTS, type FontOption, type Theme } from "./ShareViewer";

interface HeaderProps {
  shareId: string;
  sessionId: string;
  sessionTitle: string;
  version: string;
  model?: {
    providerID: string;
    modelID: string;
  };
  totalTokens?: number;
  totalCost?: number;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  font: FontOption;
  onFontChange: (font: FontOption) => void;
  themeStyles: {
    bg: string;
    bgSecondary: string;
    text: string;
    textMuted: string;
    border: string;
  };
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        background: "none",
        border: "none",
        color: "inherit",
        cursor: "pointer",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "0.75rem",
        opacity: 0.7,
      }}
      title={`Copy ${label}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function formatTokens(tokens: number): string {
  return tokens.toLocaleString();
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

export function Header({
  shareId,
  sessionId,
  sessionTitle,
  version,
  model,
  totalTokens,
  totalCost,
  theme,
  onThemeChange,
  font,
  onFontChange,
  themeStyles,
}: HeaderProps) {
  return (
    <header
      style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${themeStyles.border}`,
        backgroundColor: themeStyles.bgSecondary,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Left side - Session info */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            {sessionTitle}
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              fontSize: "0.75rem",
              color: themeStyles.textMuted,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span>Share:</span>
              <code
                style={{
                  backgroundColor: themeStyles.bg,
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {shareId}
              </code>
              <CopyButton text={shareId} label="share ID" />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span>Session:</span>
              <code
                style={{
                  backgroundColor: themeStyles.bg,
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {sessionId.slice(-8)}
              </code>
              <CopyButton text={sessionId} label="session ID" />
            </div>

            {model && (
              <div>
                <span>Model: </span>
                <span style={{ color: themeStyles.text }}>
                  {model.providerID}/{model.modelID}
                </span>
              </div>
            )}

            <div>
              <span>Version: </span>
              <span style={{ color: themeStyles.text }}>{version}</span>
            </div>

            {totalTokens !== undefined && (
              <div>
                <span>{formatTokens(totalTokens)} tokens</span>
                {totalCost !== undefined && totalCost > 0 && (
                  <span style={{ marginLeft: "8px" }}>({formatCost(totalCost)})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Selectors */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as Theme)}
            style={{
              backgroundColor: themeStyles.bg,
              color: themeStyles.text,
              border: `1px solid ${themeStyles.border}`,
              borderRadius: "6px",
              padding: "6px 10px",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>

          <select
            value={font.name}
            onChange={(e) => {
              const selected = FONTS.find((f) => f.name === e.target.value);
              if (selected) onFontChange(selected);
            }}
            style={{
              backgroundColor: themeStyles.bg,
              color: themeStyles.text,
              border: `1px solid ${themeStyles.border}`,
              borderRadius: "6px",
              padding: "6px 10px",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            {FONTS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

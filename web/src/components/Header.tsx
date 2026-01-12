"use client";

import { useState } from "react";
import { FONTS, type FontOption, type Theme } from "./ShareViewer";

interface HeaderProps {
  shareId: string;
  sessionId: string;
  version: string;
  model?: {
    providerID: string;
    modelID: string;
  };
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

export function Header({
  shareId,
  sessionId,
  version,
  model,
  theme,
  onThemeChange,
  font,
  onFontChange,
  themeStyles,
}: HeaderProps) {
  return (
    <header
      style={{
        padding: "20px",
        borderBottom: `1px solid ${themeStyles.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Breadcrumb navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "0.875rem" }}>
            <a
              href="/"
              style={{
                color: themeStyles.textMuted,
                textDecoration: "none",
              }}
            >
              opncd.com
            </a>
            <span style={{ color: themeStyles.border, margin: "0 8px" }}>/</span>
            <span style={{ color: themeStyles.border }}>share</span>
            <span style={{ color: themeStyles.border, margin: "0 8px" }}>/</span>
            <span style={{ color: themeStyles.text }}>{shareId}</span>
          </div>

          {/* Selectors */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as Theme)}
              style={{
                backgroundColor: themeStyles.bg,
                color: themeStyles.text,
                border: `1px solid ${themeStyles.border}`,
                borderRadius: "4px",
                padding: "4px 8px",
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
                borderRadius: "4px",
                padding: "4px 8px",
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

        {/* Session info row */}
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
            <span>Session:</span>
            <code
              style={{
                backgroundColor: themeStyles.bgSecondary,
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
        </div>
      </div>
    </header>
  );
}

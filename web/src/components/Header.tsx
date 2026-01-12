"use client";

import { useState } from "react";
import { type ColorScheme, THEME_LIST } from "@/lib/theme";
import { FONTS, type FontOption, type ThemeStyles } from "./ShareViewer";

interface HeaderProps {
  shareId: string;
  sessionId: string;
  version: string;
  model?: {
    providerID: string;
    modelID: string;
  };
  themeId: string;
  onThemeChange: (themeId: string) => void;
  colorScheme: ColorScheme;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  font: FontOption;
  onFontChange: (font: FontOption) => void;
  themeStyles: ThemeStyles;
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
  themeId,
  onThemeChange,
  colorScheme,
  onColorSchemeChange,
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
            <span style={{ color: themeStyles.borderWeak, margin: "0 8px" }}>/</span>
            <span style={{ color: themeStyles.borderWeak }}>share</span>
            <span style={{ color: themeStyles.borderWeak, margin: "0 8px" }}>/</span>
            <span style={{ color: themeStyles.text }}>{shareId}</span>
          </div>

          {/* Selectors */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Theme selector */}
            <select
              value={themeId}
              onChange={(e) => onThemeChange(e.target.value)}
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
              {THEME_LIST.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>

            {/* Color scheme selector */}
            <select
              value={colorScheme}
              onChange={(e) => onColorSchemeChange(e.target.value as ColorScheme)}
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

            {/* Font selector */}
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

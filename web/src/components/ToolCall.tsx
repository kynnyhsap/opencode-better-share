"use client";

import { useState } from "react";
import type { ToolPart } from "@/lib/types";
import type { ThemeStyles } from "./ShareViewer";

interface ToolCallProps {
  tool: ToolPart;
  themeStyles: ThemeStyles;
}

export function ToolCall({ tool, themeStyles }: ToolCallProps) {
  const [expanded, setExpanded] = useState(false);

  const { state } = tool;
  const title = "title" in state ? state.title : tool.tool;
  const isCompleted = state.status === "completed";
  const isError = state.status === "error";
  const hasOutput = "output" in state;
  const hasError = "error" in state;

  // Use theme colors for status
  const statusColor = isError
    ? themeStyles.syntaxString // error-ish color
    : isCompleted
      ? themeStyles.markdownCode // success green
      : themeStyles.markdownHeading; // warning yellow/orange

  return (
    <div
      style={{
        borderRadius: "6px",
        border: `1px solid ${themeStyles.border}`,
        overflow: "hidden",
        fontSize: "0.8125rem",
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          backgroundColor: themeStyles.bg,
          border: "none",
          color: themeStyles.text,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: statusColor,
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 500 }}>{title}</span>
        <span style={{ color: themeStyles.textMuted, marginLeft: "auto" }}>
          {expanded ? "[-]" : "[+]"}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            padding: "12px",
            backgroundColor: themeStyles.bgSecondary,
            borderTop: `1px solid ${themeStyles.border}`,
          }}
        >
          {/* Input */}
          {state.input && Object.keys(state.input).length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: themeStyles.textMuted,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                Input
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: themeStyles.bg,
                  overflow: "auto",
                  fontSize: "0.75rem",
                }}
              >
                {JSON.stringify(state.input, null, 2)}
              </pre>
            </div>
          )}

          {/* Output */}
          {hasOutput && "output" in state && (
            <div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: themeStyles.textMuted,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                Output
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: themeStyles.bg,
                  overflow: "auto",
                  fontSize: "0.75rem",
                  maxHeight: "300px",
                }}
              >
                {state.output}
              </pre>
            </div>
          )}

          {/* Error */}
          {hasError && "error" in state && (
            <div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: themeStyles.syntaxString,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                Error
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: themeStyles.bg,
                  overflow: "auto",
                  fontSize: "0.75rem",
                  color: themeStyles.syntaxString,
                }}
              >
                {state.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CodeBlock, type ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";

interface DefaultToolProps extends ThemedProps {
  tool: ToolPart;
}

/**
 * Default tool component - collapsible view for generic tools
 */
export function DefaultTool({ tool, themeStyles }: DefaultToolProps) {
  const [expanded, setExpanded] = useState(false);

  const { state } = tool;
  const title = "title" in state ? state.title : tool.tool;
  const isCompleted = state.status === "completed";
  const isError = state.status === "error";
  const hasOutput = "output" in state;
  const hasError = "error" in state;

  const statusColor = isError
    ? themeStyles.error
    : isCompleted
      ? themeStyles.success
      : themeStyles.warning;

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
          fontFamily: "inherit",
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
          {expanded ? "▼" : "▶"}
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
              <CodeBlock themeStyles={themeStyles}>
                {JSON.stringify(state.input, null, 2)}
              </CodeBlock>
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
              <CodeBlock themeStyles={themeStyles} maxHeight="300px">
                {state.output}
              </CodeBlock>
            </div>
          )}

          {/* Error */}
          {hasError && "error" in state && (
            <div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: themeStyles.error,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                Error
              </div>
              <CodeBlock themeStyles={themeStyles}>
                <span style={{ color: themeStyles.error }}>{state.error}</span>
              </CodeBlock>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

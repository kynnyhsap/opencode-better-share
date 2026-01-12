"use client";

import { useState } from "react";
import type { ToolPart } from "@/lib/types";
import { DiffView } from "./DiffView";
import type { ThemeStyles } from "./ShareViewer";

interface ToolCallProps {
  tool: ToolPart;
  themeStyles: ThemeStyles;
}

// Block tool wrapper - like TUI's BlockTool component
function BlockToolWrapper({
  children,
  themeStyles,
}: {
  children: React.ReactNode;
  themeStyles: ThemeStyles;
}) {
  return (
    <div
      style={{
        backgroundColor: themeStyles.bgSecondary,
        borderLeft: `3px solid ${themeStyles.border}`,
        padding: "12px 16px",
        fontSize: "0.8125rem",
      }}
    >
      {children}
    </div>
  );
}

// Check if this is an Edit tool with diff metadata
function isEditWithDiff(tool: ToolPart): boolean {
  return (
    tool.tool === "mcp_edit" &&
    "metadata" in tool.state &&
    tool.state.metadata !== undefined &&
    "diff" in tool.state.metadata &&
    typeof tool.state.metadata.diff === "string"
  );
}

// Check if this is a Bash tool with output
function isBashWithOutput(tool: ToolPart): boolean {
  return (
    tool.tool === "mcp_bash" &&
    "metadata" in tool.state &&
    tool.state.metadata !== undefined &&
    "output" in tool.state.metadata
  );
}

// Get input field from tool state
function getInput<T>(tool: ToolPart, field: string): T | undefined {
  if ("input" in tool.state && tool.state.input && field in tool.state.input) {
    return tool.state.input[field] as T;
  }
  return undefined;
}

// Get metadata field from tool state
function getMetadata<T>(tool: ToolPart, field: string): T | undefined {
  if (
    "metadata" in tool.state &&
    tool.state.metadata !== undefined &&
    field in tool.state.metadata
  ) {
    return tool.state.metadata[field] as T;
  }
  return undefined;
}

// Normalize path to show relative from project root
function normalizePath(path: string): string {
  // Find common project indicators and truncate before them
  const indicators = ["/src/", "/lib/", "/app/", "/components/", "/packages/"];
  for (const indicator of indicators) {
    const idx = path.indexOf(indicator);
    if (idx !== -1) {
      return ".." + path.slice(idx);
    }
  }
  // Fallback: just show last 2 segments
  const parts = path.split("/");
  if (parts.length > 2) {
    return "../" + parts.slice(-2).join("/");
  }
  return path;
}

export function ToolCall({ tool, themeStyles }: ToolCallProps) {
  const { state } = tool;
  const isCompleted = state.status === "completed";
  const isError = state.status === "error";

  // Check if this is an Edit tool with diff
  const hasDiff = isEditWithDiff(tool);
  const diffContent = hasDiff ? getMetadata<string>(tool, "diff") : null;
  const filePath = getInput<string>(tool, "filePath");

  // Check if this is a Bash tool with output
  const hasBashOutput = isBashWithOutput(tool);
  const bashCommand = getInput<string>(tool, "command");
  const bashDescription = getInput<string>(tool, "description");
  const bashOutput = hasBashOutput ? getMetadata<string>(tool, "output") : null;

  // For Edit/Bash with content, show expanded by default
  const [expanded, setExpanded] = useState(!hasDiff && !hasBashOutput);

  const title = "title" in state ? state.title : tool.tool;
  const hasOutput = "output" in state;
  const hasError = "error" in state;

  // Use theme colors for status
  const statusColor = isError
    ? themeStyles.error
    : isCompleted
      ? themeStyles.success
      : themeStyles.warning;

  // Edit tool with diff - special rendering
  if (hasDiff && diffContent) {
    return (
      <BlockToolWrapper themeStyles={themeStyles}>
        {/* Title like TUI: ←Edit ../path/to/file */}
        <div style={{ color: themeStyles.textMuted, marginBottom: "8px" }}>
          ←Edit {filePath ? normalizePath(filePath) : "file"}
        </div>

        {/* Diff view */}
        <DiffView diff={diffContent} themeStyles={themeStyles} />
      </BlockToolWrapper>
    );
  }

  // Bash tool with output - special rendering like TUI
  if (hasBashOutput && bashCommand) {
    return (
      <BlockToolWrapper themeStyles={themeStyles}>
        {/* Description as comment */}
        <div style={{ color: themeStyles.textMuted }}># {bashDescription || "Shell"}</div>

        {/* Command with $ prefix */}
        <div style={{ color: themeStyles.text, marginTop: "8px" }}>$ {bashCommand}</div>

        {/* Output */}
        {bashOutput && (
          <pre
            style={{
              margin: 0,
              marginTop: "8px",
              color: themeStyles.text,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {bashOutput.trim()}
          </pre>
        )}
      </BlockToolWrapper>
    );
  }

  // Default tool rendering (collapsible)
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
                  color: themeStyles.error,
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
                  color: themeStyles.error,
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

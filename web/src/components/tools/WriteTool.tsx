"use client";

import { useState } from "react";
import { BlockWrapper, type ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { getToolInput, normalizePath } from "@/lib/utils";

interface WriteToolProps extends ThemedProps {
  tool: ToolPart;
}

// Number of lines to show when collapsed
const COLLAPSED_LINES = 15;

/**
 * Check if this is a Write tool
 */
export function isWriteTool(tool: ToolPart): boolean {
  return tool.tool === "write";
}

/**
 * Write tool component - displays file being written with content
 * TUI style: # Wrote path/to/file
 *            1  "use client";
 *            2
 *            3  import ...
 */
export function WriteTool({ tool, themeStyles }: WriteToolProps) {
  const [expanded, setExpanded] = useState(false);
  const filePath = getToolInput<string>(tool, "filePath");
  const content = getToolInput<string>(tool, "content");
  const isError = tool.state.status === "error";
  const errorMessage = isError && "error" in tool.state ? tool.state.error : null;

  if (!filePath) {
    return null;
  }

  const lines = content?.split("\n") || [];
  const isLongContent = lines.length > COLLAPSED_LINES;
  const displayedLines = expanded ? lines : lines.slice(0, COLLAPSED_LINES);
  const lineNumberWidth = String(lines.length).length;

  return (
    <BlockWrapper themeStyles={themeStyles}>
      {/* Title: # Wrote path/to/file */}
      <div style={{ color: themeStyles.textMuted, marginBottom: "8px" }}>
        # Wrote {normalizePath(filePath)}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div style={{ color: themeStyles.error, marginBottom: "8px" }}>{errorMessage}</div>
      )}

      {/* File content with line numbers */}
      {content && (
        <pre
          style={{
            margin: 0,
            color: themeStyles.text,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {displayedLines.map((line, index) => {
            const lineNum = index + 1;
            const paddedNum = String(lineNum).padStart(lineNumberWidth, " ");
            return (
              <div key={lineNum} style={{ display: "flex" }}>
                <span
                  style={{
                    color: themeStyles.textMuted,
                    marginRight: "12px",
                    userSelect: "none",
                    minWidth: `${lineNumberWidth}ch`,
                    textAlign: "right",
                  }}
                >
                  {paddedNum}
                </span>
                <span>{line || " "}</span>
              </div>
            );
          })}
          {/* Show ellipsis when collapsed */}
          {isLongContent && !expanded && <div style={{ color: themeStyles.textMuted }}>...</div>}
        </pre>
      )}

      {/* Click to expand/collapse */}
      {isLongContent && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: "8px",
            padding: 0,
            border: "none",
            background: "none",
            color: themeStyles.textMuted,
            fontSize: "0.8125rem",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Click to {expanded ? "collapse" : "expand"}
        </button>
      )}
    </BlockWrapper>
  );
}

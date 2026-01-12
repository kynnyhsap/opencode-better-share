"use client";

import { useState } from "react";
import { BlockWrapper, type ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { getToolInput } from "@/lib/utils";

interface BashToolProps extends ThemedProps {
  tool: ToolPart;
}

// Number of lines to show when collapsed
const COLLAPSED_LINES = 10;

/**
 * Check if this is a completed Bash tool
 */
export function isBashTool(tool: ToolPart): boolean {
  return tool.tool === "bash" && tool.state.status === "completed";
}

/**
 * Bash tool component - displays shell commands with collapsible output
 * TUI style: # description
 *            $ command
 *            output (collapsible)
 *            ...
 *            Click to expand/collapse
 */
export function BashTool({ tool, themeStyles }: BashToolProps) {
  const [expanded, setExpanded] = useState(false);
  const command = getToolInput<string>(tool, "command");
  const description = getToolInput<string>(tool, "description");
  // Output is at state.output for completed tools, not metadata
  const output = tool.state.status === "completed" ? tool.state.output : undefined;

  if (!command) {
    return null;
  }

  const outputLines = output?.trim().split("\n") || [];
  const isLongOutput = outputLines.length > COLLAPSED_LINES;
  const displayedOutput = expanded
    ? outputLines.join("\n")
    : outputLines.slice(0, COLLAPSED_LINES).join("\n");

  return (
    <BlockWrapper themeStyles={themeStyles}>
      {/* Description as comment */}
      <div style={{ color: themeStyles.textMuted }}># {description || "Shell"}</div>

      {/* Command with $ prefix */}
      <div style={{ color: themeStyles.text, marginTop: "8px" }}>$ {command}</div>

      {/* Output */}
      {output && (
        <pre
          style={{
            margin: 0,
            marginTop: "8px",
            color: themeStyles.text,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {displayedOutput}
          {/* Show ellipsis when collapsed and there's more content */}
          {isLongOutput && !expanded && (
            <>
              {"\n"}
              <span style={{ color: themeStyles.textMuted }}>...</span>
            </>
          )}
        </pre>
      )}

      {/* Click to expand/collapse */}
      {isLongOutput && (
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

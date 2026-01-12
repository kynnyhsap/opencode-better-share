"use client";

import type { ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { getToolInput } from "@/lib/utils";

interface WebFetchToolProps extends ThemedProps {
  tool: ToolPart;
}

/**
 * Check if this is a WebFetch tool
 */
export function isWebFetchTool(tool: ToolPart): boolean {
  return tool.tool === "webfetch";
}

/**
 * WebFetch tool component - displays URL being fetched
 * TUI style: ⊛ WebFetch https://example.com
 *            Error: message (if error)
 */
export function WebFetchTool({ tool, themeStyles }: WebFetchToolProps) {
  const url = getToolInput<string>(tool, "url");
  const isError = tool.state.status === "error";
  const errorMessage = isError && "error" in tool.state ? tool.state.error : null;

  if (!url) {
    return null;
  }

  return (
    <div>
      <div style={{ color: themeStyles.textMuted, fontSize: "0.8125rem" }}>
        <span style={{ color: themeStyles.accent }}>⊛</span> WebFetch {url}
      </div>

      {/* Error message beneath */}
      {errorMessage && (
        <div style={{ color: themeStyles.error, fontSize: "0.8125rem" }}>{errorMessage}</div>
      )}
    </div>
  );
}

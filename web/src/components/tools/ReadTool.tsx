"use client";

import type { ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { getToolInput, normalizePath } from "@/lib/utils";

interface ReadToolProps extends ThemedProps {
  tool: ToolPart;
}

/**
 * Check if this is a Read tool
 */
export function isReadTool(tool: ToolPart): boolean {
  return tool.tool === "read";
}

/**
 * Read tool component - displays file path being read
 * TUI style: → Read path/to/file
 *            Error: message (if error)
 */
export function ReadTool({ tool, themeStyles }: ReadToolProps) {
  const filePath = getToolInput<string>(tool, "filePath");
  const isError = tool.state.status === "error";
  const errorMessage = isError && "error" in tool.state ? tool.state.error : null;

  if (!filePath) {
    return null;
  }

  return (
    <div>
      <div style={{ color: themeStyles.textMuted, fontSize: "0.8125rem" }}>
        <span style={{ color: themeStyles.primary }}>→</span> Read {normalizePath(filePath)}
      </div>

      {/* Error message beneath */}
      {errorMessage && (
        <div style={{ color: themeStyles.error, fontSize: "0.8125rem" }}>{errorMessage}</div>
      )}
    </div>
  );
}

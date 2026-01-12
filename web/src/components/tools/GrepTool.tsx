"use client";

import type { ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { getToolInput } from "@/lib/utils";

interface GrepToolProps extends ThemedProps {
  tool: ToolPart;
}

/**
 * Check if this is a Grep tool
 */
export function isGrepTool(tool: ToolPart): boolean {
  return tool.tool === "grep";
}

/**
 * Get match count from grep output
 */
function getMatchCount(tool: ToolPart): number {
  if (tool.state.status !== "completed") return 0;
  const output = tool.state.output;
  if (!output) return 0;

  // Count lines that look like file matches (contain line numbers)
  const lines = output.split("\n").filter((line) => line.trim());
  return lines.length;
}

/**
 * Grep tool component - displays search pattern with match count
 * TUI style: ✱ Grep "pattern" (N matches)
 */
export function GrepTool({ tool, themeStyles }: GrepToolProps) {
  const pattern = getToolInput<string>(tool, "pattern");
  const matchCount = getMatchCount(tool);

  if (!pattern) {
    return null;
  }

  const isCompleted = tool.state.status === "completed";
  const matchText = matchCount === 1 ? "1 match" : `${matchCount} matches`;

  return (
    <div
      style={{
        color: themeStyles.textMuted,
        fontSize: "0.8125rem",
      }}
    >
      <span style={{ color: themeStyles.accent }}>✱</span> Grep "{pattern}"{" "}
      {isCompleted && <span>({matchText})</span>}
    </div>
  );
}

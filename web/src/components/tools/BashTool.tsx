"use client";

import { BlockWrapper, type ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { getToolInput, getToolMetadata } from "@/lib/utils";

interface BashToolProps extends ThemedProps {
  tool: ToolPart;
}

/**
 * Check if this Bash tool has output metadata
 */
export function isBashWithOutput(tool: ToolPart): boolean {
  return (
    tool.tool === "mcp_bash" &&
    "metadata" in tool.state &&
    tool.state.metadata !== undefined &&
    "output" in tool.state.metadata
  );
}

/**
 * Bash tool component - displays shell commands with output
 */
export function BashTool({ tool, themeStyles }: BashToolProps) {
  const command = getToolInput<string>(tool, "command");
  const description = getToolInput<string>(tool, "description");
  const output = getToolMetadata<string>(tool, "output");

  if (!command) {
    return null;
  }

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
          {output.trim()}
        </pre>
      )}
    </BlockWrapper>
  );
}

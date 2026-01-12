"use client";

import type { ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { BashTool, isBashWithOutput } from "./BashTool";
import { DefaultTool } from "./DefaultTool";
import { EditTool, isEditWithDiff } from "./EditTool";

interface ToolCallProps extends ThemedProps {
  tool: ToolPart;
}

/**
 * Main tool call component - routes to specific tool renderers
 */
export function ToolCall({ tool, themeStyles }: ToolCallProps) {
  // Edit tool with diff
  if (isEditWithDiff(tool)) {
    return <EditTool tool={tool} themeStyles={themeStyles} />;
  }

  // Bash tool with output
  if (isBashWithOutput(tool)) {
    return <BashTool tool={tool} themeStyles={themeStyles} />;
  }

  // Default fallback for other tools
  return <DefaultTool tool={tool} themeStyles={themeStyles} />;
}

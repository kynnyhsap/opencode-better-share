"use client";

import type { ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { BashTool, isBashTool } from "./BashTool";
import { DefaultTool } from "./DefaultTool";
import { EditTool, isEditWithDiff } from "./EditTool";
import { GrepTool, isGrepTool } from "./GrepTool";
import { isReadTool, ReadTool } from "./ReadTool";
import { isWebFetchTool, WebFetchTool } from "./WebFetchTool";
import { isWriteTool, WriteTool } from "./WriteTool";

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

  // Bash tool
  if (isBashTool(tool)) {
    return <BashTool tool={tool} themeStyles={themeStyles} />;
  }

  // Grep tool
  if (isGrepTool(tool)) {
    return <GrepTool tool={tool} themeStyles={themeStyles} />;
  }

  // Read tool
  if (isReadTool(tool)) {
    return <ReadTool tool={tool} themeStyles={themeStyles} />;
  }

  // WebFetch tool
  if (isWebFetchTool(tool)) {
    return <WebFetchTool tool={tool} themeStyles={themeStyles} />;
  }

  // Write tool
  if (isWriteTool(tool)) {
    return <WriteTool tool={tool} themeStyles={themeStyles} />;
  }

  // Default fallback for other tools
  return <DefaultTool tool={tool} themeStyles={themeStyles} />;
}

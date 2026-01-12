import type { ToolPart } from "@/lib/types";

/**
 * Get input field from tool state
 */
export function getToolInput<T>(tool: ToolPart, field: string): T | undefined {
  if ("input" in tool.state && tool.state.input && field in tool.state.input) {
    return tool.state.input[field] as T;
  }
  return undefined;
}

/**
 * Get metadata field from tool state
 */
export function getToolMetadata<T>(tool: ToolPart, field: string): T | undefined {
  if (
    "metadata" in tool.state &&
    tool.state.metadata !== undefined &&
    field in tool.state.metadata
  ) {
    return tool.state.metadata[field] as T;
  }
  return undefined;
}

/**
 * Check if tool has specific metadata field
 */
export function hasToolMetadata(tool: ToolPart, field: string): boolean {
  return (
    "metadata" in tool.state && tool.state.metadata !== undefined && field in tool.state.metadata
  );
}

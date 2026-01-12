"use client";

import { BlockWrapper, type ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { getToolInput, getToolMetadata, normalizePath } from "@/lib/utils";
import { DiffView } from "./DiffView";

interface EditToolProps extends ThemedProps {
  tool: ToolPart;
}

/**
 * Check if this Edit tool has diff metadata
 */
export function isEditWithDiff(tool: ToolPart): boolean {
  return (
    tool.tool === "mcp_edit" &&
    "metadata" in tool.state &&
    tool.state.metadata !== undefined &&
    "diff" in tool.state.metadata &&
    typeof tool.state.metadata.diff === "string"
  );
}

/**
 * Edit tool component - displays file edits with diff view
 */
export function EditTool({ tool, themeStyles }: EditToolProps) {
  const diffContent = getToolMetadata<string>(tool, "diff");
  const filePath = getToolInput<string>(tool, "filePath");

  if (!diffContent) {
    return null;
  }

  return (
    <BlockWrapper themeStyles={themeStyles}>
      {/* Title like TUI: ←Edit ../path/to/file */}
      <div style={{ color: themeStyles.textMuted, marginBottom: "8px" }}>
        ←Edit {filePath ? normalizePath(filePath) : "file"}
      </div>

      {/* Diff view */}
      <DiffView diff={diffContent} themeStyles={themeStyles} />
    </BlockWrapper>
  );
}

"use client";

import type { ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { getToolInput, getToolMetadata, normalizePath } from "@/lib/utils";
import { DiffView } from "./DiffView";

interface EditToolProps extends ThemedProps {
  tool: ToolPart;
}

/**
 * Check if this is an Edit tool (with diff or error)
 */
export function isEditWithDiff(tool: ToolPart): boolean {
  if (tool.tool !== "edit") return false;

  // Has diff metadata
  if (
    "metadata" in tool.state &&
    tool.state.metadata !== undefined &&
    "diff" in tool.state.metadata &&
    typeof tool.state.metadata.diff === "string"
  ) {
    return true;
  }

  // Has error
  if (tool.state.status === "error") {
    return true;
  }

  return false;
}

/**
 * Edit tool component - displays file edits with diff view or error
 * TUI style: ←Edit path/to/file
 *            Error: message (if error)
 */
export function EditTool({ tool, themeStyles }: EditToolProps) {
  const diffContent = getToolMetadata<string>(tool, "diff");
  const filePath = getToolInput<string>(tool, "filePath");
  const isError = tool.state.status === "error";
  const errorMessage = isError && "error" in tool.state ? tool.state.error : null;

  return (
    <div>
      {/* Title like TUI: ←Edit ../path/to/file */}
      <div style={{ color: themeStyles.textMuted, fontSize: "0.8125rem" }}>
        ←Edit {filePath ? normalizePath(filePath) : "file"}
      </div>

      {/* Error message beneath */}
      {errorMessage && (
        <div style={{ color: themeStyles.error, fontSize: "0.8125rem" }}>{errorMessage}</div>
      )}

      {/* Diff view (only if we have diff content) */}
      {diffContent && (
        <div style={{ marginTop: "8px" }}>
          <DiffView diff={diffContent} filePath={filePath} themeStyles={themeStyles} />
        </div>
      )}
    </div>
  );
}

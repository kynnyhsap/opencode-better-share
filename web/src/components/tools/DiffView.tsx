"use client";

import type { ThemedProps } from "@/components/ui";

interface DiffViewProps extends ThemedProps {
  diff: string;
}

interface DiffLine {
  type: "added" | "removed" | "context" | "header";
  content: string;
  oldLine?: number;
  newLine?: number;
}

function parseDiff(diff: string): DiffLine[] {
  const lines = diff.split("\n");
  const result: DiffLine[] = [];

  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    // Parse hunk header like @@ -145,9 +145,9 @@
    const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      oldLine = Number.parseInt(hunkMatch[1], 10);
      newLine = Number.parseInt(hunkMatch[2], 10);
      continue;
    }

    // Skip diff metadata lines
    if (
      line.startsWith("diff ") ||
      line.startsWith("index ") ||
      line.startsWith("--- ") ||
      line.startsWith("+++ ")
    ) {
      continue;
    }

    if (line.startsWith("+")) {
      result.push({
        type: "added",
        content: line.slice(1),
        newLine: newLine++,
      });
    } else if (line.startsWith("-")) {
      result.push({
        type: "removed",
        content: line.slice(1),
        oldLine: oldLine++,
      });
    } else if (line.startsWith(" ") || line === "") {
      result.push({
        type: "context",
        content: line.slice(1) || "",
        oldLine: oldLine++,
        newLine: newLine++,
      });
    }
  }

  return result;
}

/**
 * Diff view component for displaying unified diffs
 */
export function DiffView({ diff, themeStyles }: DiffViewProps) {
  const lines = parseDiff(diff);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        fontFamily: "inherit",
        fontSize: "0.75rem",
        lineHeight: 1.5,
        overflow: "auto",
      }}
    >
      {lines.map((line, index) => {
        const bgColor =
          line.type === "added"
            ? themeStyles.diffAddedBg
            : line.type === "removed"
              ? themeStyles.diffRemovedBg
              : themeStyles.diffContextBg;

        const textColor =
          line.type === "added"
            ? themeStyles.diffAdded
            : line.type === "removed"
              ? themeStyles.diffRemoved
              : themeStyles.text;

        const sign = line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
        const lineNum = line.type === "removed" ? line.oldLine : line.newLine;

        const key = `${line.type}-${lineNum ?? index}-${index}`;
        return (
          <div
            key={key}
            style={{
              display: "flex",
              backgroundColor: bgColor,
            }}
          >
            {/* Line number */}
            <span
              style={{
                width: "3.5em",
                paddingRight: "0.5em",
                textAlign: "right",
                color: themeStyles.diffLineNumber,
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {lineNum}
            </span>

            {/* Sign (+/-/space) */}
            <span
              style={{
                width: "1.5em",
                color: textColor,
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {sign}
            </span>

            {/* Content */}
            <span
              style={{
                color: textColor,
                whiteSpace: "pre",
                flex: 1,
              }}
            >
              {line.content}
            </span>
          </div>
        );
      })}
    </div>
  );
}

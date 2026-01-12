"use client";

import { PatchDiff } from "@pierre/diffs/react";

interface DiffViewProps {
  diff: string;
  filePath?: string;
}

/**
 * Diff view component using @pierre/diffs
 */
export function DiffView({ diff, filePath }: DiffViewProps) {
  if (!diff) {
    return null;
  }

  // Detect language from file extension
  const lang = filePath ? getLanguageFromPath(filePath) : undefined;

  return (
    <PatchDiff
      patch={diff}
      view="stacked"
      lang={lang}
      theme="github-dark"
      changeIndicators="classic"
      showHeader={false}
      style={{
        fontSize: "0.75rem",
      }}
    />
  );
}

function getLanguageFromPath(path: string): string | undefined {
  const ext = path.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
    py: "python",
    rs: "rust",
    go: "go",
    rb: "ruby",
    sh: "bash",
    yml: "yaml",
    yaml: "yaml",
  };
  return ext ? langMap[ext] : undefined;
}

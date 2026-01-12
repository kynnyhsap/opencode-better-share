"use client";

import type { ThemedProps } from "./types";

interface CodeBlockProps extends ThemedProps {
  children: React.ReactNode;
  maxHeight?: string;
}

/**
 * Code block component for displaying pre-formatted text
 */
export function CodeBlock({ children, themeStyles, maxHeight }: CodeBlockProps) {
  return (
    <pre
      style={{
        margin: 0,
        padding: "8px",
        borderRadius: "4px",
        backgroundColor: themeStyles.bg,
        overflow: "auto",
        fontSize: "0.75rem",
        maxHeight,
      }}
    >
      {children}
    </pre>
  );
}

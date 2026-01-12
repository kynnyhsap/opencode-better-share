"use client";

import type { ThemedProps } from "./types";

interface BlockWrapperProps extends ThemedProps {
  children: React.ReactNode;
}

/**
 * Block wrapper component - like TUI's BlockTool
 * Used for tool outputs that need a panel-style background with left border
 */
export function BlockWrapper({ children, themeStyles }: BlockWrapperProps) {
  return (
    <div
      style={{
        backgroundColor: themeStyles.bgSecondary,
        borderLeft: `3px solid ${themeStyles.border}`,
        padding: "12px 16px",
        fontSize: "0.8125rem",
      }}
    >
      {children}
    </div>
  );
}

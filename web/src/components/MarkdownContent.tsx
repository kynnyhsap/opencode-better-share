"use client";

import { Streamdown } from "streamdown";
import type { ColorScheme } from "@/lib/theme";
import type { ThemeStyles } from "./ShareViewer";

interface MarkdownContentProps {
  content: string;
  colorScheme: ColorScheme;
  themeStyles: ThemeStyles;
}

export function MarkdownContent({ content, colorScheme, themeStyles }: MarkdownContentProps) {
  const isDark = colorScheme === "dark";

  return (
    <div
      className={isDark ? "dark" : ""}
      style={{
        fontSize: "0.875rem",
        lineHeight: 1.7,
        // Apply theme colors via CSS custom properties
        // @ts-expect-error - CSS custom properties
        "--md-heading": themeStyles.markdownHeading,
        "--md-link": themeStyles.markdownLink,
        "--md-code": themeStyles.markdownCode,
      }}
    >
      <Streamdown
        mode="static"
        shikiTheme={isDark ? ["github-dark", "github-light"] : ["github-light", "github-dark"]}
        controls={false}
      >
        {content}
      </Streamdown>
    </div>
  );
}

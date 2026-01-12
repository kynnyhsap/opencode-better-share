"use client";

import { Streamdown } from "streamdown";
import type { Theme } from "./ShareViewer";

interface MarkdownContentProps {
  content: string;
  theme: Theme;
}

export function MarkdownContent({ content, theme }: MarkdownContentProps) {
  return (
    <div
      className={theme === "dark" ? "dark" : ""}
      style={{
        fontSize: "0.875rem",
        lineHeight: 1.7,
      }}
    >
      <Streamdown
        mode="static"
        shikiTheme={
          theme === "dark" ? ["github-dark", "github-light"] : ["github-light", "github-dark"]
        }
        controls={false}
      >
        {content}
      </Streamdown>
    </div>
  );
}

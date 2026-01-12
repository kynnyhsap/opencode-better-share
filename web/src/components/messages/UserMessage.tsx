"use client";

import { MarkdownContent } from "@/components/markdown";
import type { ThemedProps } from "@/components/ui";
import type { ColorScheme } from "@/lib/theme";
import type { MessageWithParts, Part, TextPart } from "@/lib/types";

interface UserMessageProps extends ThemedProps {
  message: MessageWithParts;
  colorScheme: ColorScheme;
}

function isTextPart(part: Part): part is TextPart {
  return part.type === "text";
}

/**
 * User message component - displays user input with panel styling
 */
export function UserMessage({ message, colorScheme, themeStyles }: UserMessageProps) {
  const textParts = message.parts.filter(isTextPart);
  const textContent = textParts.map((p) => p.text).join("\n");

  return (
    <div
      style={{
        backgroundColor: themeStyles.bgSecondary,
        borderLeft: `3px solid ${themeStyles.primary}`,
        paddingLeft: "16px",
        paddingTop: "12px",
        paddingBottom: "12px",
        paddingRight: "12px",
        borderRadius: "0 4px 4px 0",
      }}
    >
      {textContent && (
        <MarkdownContent
          content={textContent}
          colorScheme={colorScheme}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
}

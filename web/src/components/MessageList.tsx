"use client";

import type { ColorScheme } from "@/lib/theme";
import type { MessageWithParts } from "@/lib/types";
import { Message } from "./Message";
import type { ThemeStyles } from "./ShareViewer";

interface MessageListProps {
  messages: MessageWithParts[];
  colorScheme: ColorScheme;
  themeStyles: ThemeStyles;
}

export function MessageList({ messages, colorScheme, themeStyles }: MessageListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {messages.map((message) => (
        <Message
          key={message.info.id}
          message={message}
          colorScheme={colorScheme}
          themeStyles={themeStyles}
        />
      ))}
    </div>
  );
}

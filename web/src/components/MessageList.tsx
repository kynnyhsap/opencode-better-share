"use client";

import type { MessageWithParts } from "@/lib/types";
import { Message } from "./Message";
import type { Theme } from "./ShareViewer";

interface MessageListProps {
  messages: MessageWithParts[];
  theme: Theme;
  themeStyles: {
    bg: string;
    bgSecondary: string;
    text: string;
    textMuted: string;
    border: string;
    userBg: string;
    assistantBg: string;
  };
}

export function MessageList({ messages, theme, themeStyles }: MessageListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {messages.map((message) => (
        <Message key={message.info.id} message={message} theme={theme} themeStyles={themeStyles} />
      ))}
    </div>
  );
}

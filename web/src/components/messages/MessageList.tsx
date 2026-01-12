"use client";

import type { ThemedProps } from "@/components/ui";
import type { ColorScheme } from "@/lib/theme";
import type { MessageWithParts } from "@/lib/types";
import { Message } from "./Message";

interface MessageListProps extends ThemedProps {
  messages: MessageWithParts[];
  colorScheme: ColorScheme;
}

/**
 * Message list component - renders all messages in a session
 */
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

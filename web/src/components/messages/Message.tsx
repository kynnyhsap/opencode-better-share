"use client";

import type { ThemedProps } from "@/components/ui";
import type { ColorScheme } from "@/lib/theme";
import type { MessageWithParts } from "@/lib/types";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";

interface MessageProps extends ThemedProps {
  message: MessageWithParts;
  colorScheme: ColorScheme;
}

/**
 * Message component - routes to user or assistant message
 */
export function Message({ message, colorScheme, themeStyles }: MessageProps) {
  const isUser = message.info.role === "user";

  if (isUser) {
    return <UserMessage message={message} colorScheme={colorScheme} themeStyles={themeStyles} />;
  }

  return <AssistantMessage message={message} colorScheme={colorScheme} themeStyles={themeStyles} />;
}

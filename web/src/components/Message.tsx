"use client";

import type { AssistantMessage, MessageWithParts, Part, TextPart, ToolPart } from "@/lib/types";
import { MarkdownContent } from "./MarkdownContent";
import type { Theme } from "./ShareViewer";
import { ToolCall } from "./ToolCall";

interface MessageProps {
  message: MessageWithParts;
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

function isTextPart(part: Part): part is TextPart {
  return part.type === "text";
}

function isToolPart(part: Part): part is ToolPart {
  return part.type === "tool";
}

function isAssistantMessage(msg: MessageWithParts["info"]): msg is AssistantMessage {
  return msg.role === "assistant";
}

function formatDuration(startMs: number, endMs?: number): string {
  if (!endMs) return "";
  const durationSec = (endMs - startMs) / 1000;
  return `${durationSec.toFixed(1)}s`;
}

export function Message({ message, theme, themeStyles }: MessageProps) {
  const { info, parts } = message;
  const isUser = info.role === "user";

  // Get text content from parts
  const textParts = parts.filter(isTextPart);
  const toolParts = parts.filter(isToolPart);

  const textContent = textParts.map((p) => p.text).join("\n");

  // Get assistant-specific fields
  const assistantInfo = isAssistantMessage(info) ? info : null;
  const duration = assistantInfo?.time.completed
    ? formatDuration(assistantInfo.time.created, assistantInfo.time.completed)
    : "";
  const agent = assistantInfo?.mode;
  const modelId = assistantInfo?.modelID;

  return (
    <div
      style={{
        borderLeft: isUser ? "3px solid #d97706" : "none",
        paddingLeft: isUser ? "16px" : "0",
      }}
    >
      {/* Text content */}
      {textContent && (
        <div style={{ marginBottom: toolParts.length > 0 ? "16px" : 0 }}>
          <MarkdownContent content={textContent} theme={theme} />
        </div>
      )}

      {/* Tool calls */}
      {toolParts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {toolParts.map((tool) => (
            <ToolCall key={tool.id} tool={tool} themeStyles={themeStyles} />
          ))}
        </div>
      )}

      {/* Footer for assistant messages */}
      {!isUser && (agent || modelId || duration) && (
        <div
          style={{
            marginTop: "12px",
            fontSize: "0.75rem",
            color: themeStyles.textMuted,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {agent && (
            <>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "2px",
                    backgroundColor: "#d97706",
                  }}
                />
                {agent.charAt(0).toUpperCase() + agent.slice(1)}
              </span>
              <span style={{ color: themeStyles.border }}>·</span>
            </>
          )}
          {modelId && (
            <>
              <span>{modelId}</span>
              {duration && <span style={{ color: themeStyles.border }}>·</span>}
            </>
          )}
          {duration && <span>{duration}</span>}
        </div>
      )}
    </div>
  );
}

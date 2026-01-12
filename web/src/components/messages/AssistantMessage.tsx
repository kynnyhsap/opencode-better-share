"use client";

import { MarkdownContent } from "@/components/markdown";
import { ToolCall } from "@/components/tools";
import type { ThemedProps } from "@/components/ui";
import type { ColorScheme } from "@/lib/theme";
import type {
  AssistantMessage as AssistantMessageType,
  MessageWithParts,
  Part,
  TextPart,
  ToolPart,
} from "@/lib/types";
import { formatDuration } from "@/lib/utils";

interface AssistantMessageProps extends ThemedProps {
  message: MessageWithParts;
  colorScheme: ColorScheme;
}

function isTextPart(part: Part): part is TextPart {
  return part.type === "text";
}

function isToolPart(part: Part): part is ToolPart {
  return part.type === "tool";
}

function isAssistantMessage(msg: MessageWithParts["info"]): msg is AssistantMessageType {
  return msg.role === "assistant";
}

/**
 * Assistant message component - displays AI responses with tools
 */
export function AssistantMessage({ message, colorScheme, themeStyles }: AssistantMessageProps) {
  const { info, parts } = message;

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
    <div>
      {/* Text content */}
      {textContent && (
        <div style={{ marginBottom: toolParts.length > 0 ? "16px" : 0 }}>
          <MarkdownContent
            content={textContent}
            colorScheme={colorScheme}
            themeStyles={themeStyles}
          />
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

      {/* Footer */}
      {(agent || modelId || duration) && (
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
                    backgroundColor: themeStyles.markdownLink,
                  }}
                />
                {agent.charAt(0).toUpperCase() + agent.slice(1)}
              </span>
              <span style={{ color: themeStyles.borderWeak }}>·</span>
            </>
          )}
          {modelId && (
            <>
              <span>{modelId}</span>
              {duration && <span style={{ color: themeStyles.borderWeak }}>·</span>}
            </>
          )}
          {duration && <span>{duration}</span>}
        </div>
      )}
    </div>
  );
}

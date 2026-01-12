/**
 * Types for share data
 * Re-exports from @opencode-ai/sdk and custom share types
 */

// Re-export SDK types
export type {
  AssistantMessage,
  FilePart,
  Message,
  Part,
  ReasoningPart,
  Session,
  StepFinishPart,
  StepStartPart,
  TextPart,
  ToolPart,
  ToolState,
  ToolStateCompleted,
  ToolStateError,
  ToolStatePending,
  ToolStateRunning,
  UserMessage,
} from "@opencode-ai/sdk/client";

import type { Message, Part, Session } from "@opencode-ai/sdk/client";

/**
 * Message with its parts (as returned by SDK's session.messages())
 */
export interface MessageWithParts {
  info: Message;
  parts: Part[];
}

/**
 * Share data structure stored in R2
 */
export interface ShareData {
  shareId: string;
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  session: Session;
  messages: MessageWithParts[];
}

/**
 * Types for share data
 */

export interface ShareSession {
  id: string;
  title: string;
  projectID: string;
  directory: string;
  version: string;
  time: {
    created: number;
    updated: number;
  };
  summary?: {
    additions: number;
    deletions: number;
    files: number;
  };
}

export interface TextPart {
  id: string;
  messageID: string;
  sessionID: string;
  type: "text";
  text: string;
}

export interface ToolPart {
  id: string;
  messageID: string;
  sessionID: string;
  type: "tool";
  tool: string;
  callID: string;
  state: {
    status: "pending" | "running" | "completed" | "error";
    input?: Record<string, unknown>;
    output?: string;
    title?: string;
    error?: string;
    time?: {
      start: number;
      end?: number;
    };
  };
}

export interface FilePart {
  id: string;
  messageID: string;
  sessionID: string;
  type: "file";
  mime: string;
  filename?: string;
  url: string;
}

export interface ReasoningPart {
  id: string;
  messageID: string;
  sessionID: string;
  type: "reasoning";
  text: string;
}

export type Part =
  | TextPart
  | ToolPart
  | FilePart
  | ReasoningPart
  | {
      id: string;
      messageID: string;
      sessionID: string;
      type: string;
      [key: string]: unknown;
    };

export interface MessageInfo {
  id: string;
  sessionID: string;
  role: "user" | "assistant";
  model?: {
    providerID: string;
    modelID: string;
  };
  // Assistant-specific fields
  modelID?: string;
  providerID?: string;
  agent?: string;
  mode?: string;
  tokens?: {
    input: number;
    output: number;
    reasoning: number;
    cache: {
      read: number;
      write: number;
    };
  };
  time: {
    created: number;
    updated?: number;
    completed?: number;
  };
}

export interface MessageWithParts {
  info: MessageInfo;
  parts: Part[];
}

export interface ShareData {
  shareId: string;
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  session: ShareSession;
  messages: MessageWithParts[];
}

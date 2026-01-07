/**
 * Types for the Better Share plugin
 */

export interface ShareInfo {
  shareId: string;
  secret: string;
  url: string;
  sessionId: string;
  createdAt: number;
}

export interface ShareData {
  shareId: string;
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  session: SessionInfo;
  messages: MessageWithParts[];
}

export interface SessionInfo {
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

export interface MessageInfo {
  id: string;
  sessionID: string;
  role: "user" | "assistant";
  model?: {
    providerID: string;
    modelID: string;
  };
  time: {
    created: number;
    updated: number;
  };
}

export interface MessageWithParts extends MessageInfo {
  parts: PartInfo[];
}

export interface PartInfo {
  id: string;
  messageID: string;
  sessionID: string;
  type: string;
  [key: string]: unknown;
}

export interface PresignResponse {
  presignedUrl: string;
  secret: string;
  url: string;
}

export interface SyncPresignResponse {
  presignedUrl: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

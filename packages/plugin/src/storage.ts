import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import type {
  SessionInfo,
  MessageInfo,
  PartInfo,
  MessageWithParts,
} from "./types";

/**
 * OpenCode stores session data at:
 * ~/.local/share/opencode/storage/
 *   session/{projectID}/{sessionID}.json
 *   message/{sessionID}/{messageID}.json
 *   part/{messageID}/{partID}.json
 */

const STORAGE_BASE = join(homedir(), ".local/share/opencode/storage");

/**
 * Read a session from OpenCode's local storage
 */
export async function readSession(
  projectID: string,
  sessionID: string,
): Promise<SessionInfo | null> {
  try {
    const filePath = join(
      STORAGE_BASE,
      "session",
      projectID,
      `${sessionID}.json`,
    );
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as SessionInfo;
  } catch {
    return null;
  }
}

/**
 * Read all messages for a session
 */
export async function readMessages(sessionID: string): Promise<MessageInfo[]> {
  try {
    const dir = join(STORAGE_BASE, "message", sessionID);
    const files = await readdir(dir);

    const messages: MessageInfo[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = join(dir, file);
      const content = await readFile(filePath, "utf-8");
      messages.push(JSON.parse(content) as MessageInfo);
    }

    // Sort by creation time
    messages.sort((a, b) => a.time.created - b.time.created);

    return messages;
  } catch {
    return [];
  }
}

/**
 * Read all parts for a message
 */
export async function readParts(messageID: string): Promise<PartInfo[]> {
  try {
    const dir = join(STORAGE_BASE, "part", messageID);
    const files = await readdir(dir);

    const parts: PartInfo[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = join(dir, file);
      const content = await readFile(filePath, "utf-8");
      parts.push(JSON.parse(content) as PartInfo);
    }

    return parts;
  } catch {
    return [];
  }
}

/**
 * Read full session data including messages and parts
 */
export async function readFullSession(
  projectID: string,
  sessionID: string,
): Promise<{ session: SessionInfo; messages: MessageWithParts[] } | null> {
  const session = await readSession(projectID, sessionID);

  if (!session) {
    return null;
  }

  const messages = await readMessages(sessionID);
  const messagesWithParts: MessageWithParts[] = [];

  for (const message of messages) {
    const parts = await readParts(message.id);
    messagesWithParts.push({
      ...message,
      parts,
    });
  }

  return {
    session,
    messages: messagesWithParts,
  };
}

/**
 * Find project ID for a session
 * Since sessions are stored under project directories, we need to search
 */
export async function findProjectForSession(
  sessionID: string,
): Promise<string | null> {
  try {
    const sessionDir = join(STORAGE_BASE, "session");
    const projectDirs = await readdir(sessionDir);

    for (const projectID of projectDirs) {
      const projectPath = join(sessionDir, projectID);
      const files = await readdir(projectPath).catch(() => []);

      if ((files as string[]).includes(`${sessionID}.json`)) {
        return projectID;
      }
    }

    return null;
  } catch {
    return null;
  }
}

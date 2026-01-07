import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const dbPath = process.env.DATABASE_PATH || "./data/shares.db";

// Ensure directory exists
const dir = dirname(dbPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.run("PRAGMA journal_mode = WAL");

// Initialize table
db.run(`
  CREATE TABLE IF NOT EXISTS shares (
    share_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    secret TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

export interface Share {
  share_id: string;
  session_id: string;
  secret: string;
  created_at: number;
}

const insertStmt = db.prepare(
  "INSERT INTO shares (share_id, session_id, secret, created_at) VALUES ($shareId, $sessionId, $secret, $createdAt)",
);

const getStmt = db.prepare<Share, { $shareId: string }>(
  "SELECT * FROM shares WHERE share_id = $shareId",
);

const deleteStmt = db.prepare("DELETE FROM shares WHERE share_id = $shareId");

const existsStmt = db.prepare<{ count: number }, { $shareId: string }>(
  "SELECT COUNT(*) as count FROM shares WHERE share_id = $shareId",
);

export function createShare(shareId: string, sessionId: string, secret: string): void {
  insertStmt.run({
    $shareId: shareId,
    $sessionId: sessionId,
    $secret: secret,
    $createdAt: Date.now(),
  });
}

export function getShare(shareId: string): Share | null {
  return getStmt.get({ $shareId: shareId }) ?? null;
}

export function deleteShare(shareId: string): void {
  deleteStmt.run({ $shareId: shareId });
}

export function shareExists(shareId: string): boolean {
  const result = existsStmt.get({ $shareId: shareId });
  return (result?.count ?? 0) > 0;
}

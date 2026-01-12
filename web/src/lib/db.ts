import { sql } from "bun";

export interface Share {
  id: number;

  session_id: string;
  share_id: string;

  secret: string;

  created_at: number;
}

export async function createShare(
  shareId: string,
  sessionId: string,
  secret: string,
): Promise<void> {
  await sql`
    INSERT INTO shares (share_id, session_id, secret, created_at)
    VALUES (${shareId}, ${sessionId}, ${secret}, ${Date.now()})
  `;
}

export async function getShare(shareId: string): Promise<Share | null> {
  const results = await sql`
    SELECT * FROM shares WHERE share_id = ${shareId}
  `;
  return (results[0] as Share) ?? null;
}

export async function deleteShare(shareId: string): Promise<void> {
  await sql`DELETE FROM shares WHERE share_id = ${shareId}`;
}

export async function shareExists(shareId: string): Promise<boolean> {
  const results = await sql`
    SELECT COUNT(*) as count FROM shares WHERE share_id = ${shareId}
  `;
  return Number(results[0]?.count ?? 0) > 0;
}

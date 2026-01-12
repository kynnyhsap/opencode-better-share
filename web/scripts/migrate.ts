import { sql } from "bun";

async function migrate() {
  console.log("Creating shares table...");

  await sql`
    CREATE TABLE IF NOT EXISTS shares (
      share_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      secret TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log("Creating indexes...");

  await sql`CREATE INDEX IF NOT EXISTS idx_shares_share_id ON shares (share_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_shares_session_id ON shares (session_id)`;

  console.log("Migration complete!");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });

# Better Share Architecture

A self-hosted session sharing system for OpenCode that replaces the default `opencode.ai/share` with your own infrastructure.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              OpenCode TUI                                   │
│                                                                             │
│  User runs /share command                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Better Share Plugin                               │
│                                                                             │
│  1. Intercepts session.updated event                                        │
│  2. Overrides clipboard with custom URL (opncd.com/share/...)               │
│  3. Requests presigned URL from backend                                     │
│  4. Uploads session data directly to R2                                     │
└─────────────────────────────────────────────────────────────────────────────┘
           │                                              │
           │ POST /api/share/presign                      │ PUT (presigned URL)
           │ { shareId, sessionId }                       │ session JSON
           ▼                                              ▼
┌──────────────────────────────┐              ┌───────────────────────────────┐
│        Web Backend           │              │       Cloudflare R2           │
│        (Next.js/Elysia)      │              │                               │
│                              │              │   sessions/{shareId}.json     │
│  - Generates secret          │              │                               │
│  - Stores in PostgreSQL      │              │   (public read bucket)        │
│  - Returns presigned URL     │              │                               │
└──────────────────────────────┘              └───────────────────────────────┘
                                                          │
                                                          │ GET (public URL)
                                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Web Frontend                                     │
│                                                                             │
│  opncd.com/share/{shareId}                                                  │
│                                                                             │
│  - Fetches session JSON from R2                                             │
│  - Renders conversation UI                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Flow

### 1. Share Creation

```
User: /share
         │
         ▼
┌─────────────────────────────────────────┐
│  OpenCode triggers session.updated      │
│  with session.share.url set             │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Plugin: Override clipboard             │
│                                         │
│  Wait for OpenCode's URL, then replace  │
│  with: opncd.com/share/{shareId}        │
│  (shareId = last 8 chars of sessionId)  │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Plugin: POST /api/share/presign        │
│  { shareId, sessionId }                 │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Backend:                               │
│  1. Validate shareId format             │
│  2. Check share doesn't exist (409)     │
│  3. Generate secret (24 bytes base64)   │
│  4. Store in PostgreSQL:                │
│     { shareId, sessionId, secret }      │
│  5. Generate presigned PUT URL (1hr)    │
│  6. Return { presignedUrl, secret }     │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Plugin: Get messages via SDK           │
│  client.session.messages({ id })        │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Plugin: PUT to presigned URL           │
│                                         │
│  Upload ShareData JSON directly to R2   │
│  (no data flows through backend)        │
└─────────────────────────────────────────┘
```

### 2. Share Viewing

```
Browser: GET opncd.com/share/{shareId}
         │
         ▼
┌─────────────────────────────────────────┐
│  Web Frontend:                          │
│  1. Check share exists in DB            │
│  2. Fetch JSON from R2 public URL       │
│  3. Render conversation                 │
└─────────────────────────────────────────┘
```

### 3. Share Sync (Future)

```
Event: message.updated
         │
         ▼
┌─────────────────────────────────────────┐
│  Plugin: Is session shared?             │
│  Check in-memory map                    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Plugin: POST /api/share/{id}/presign   │
│  Headers: X-Share-Secret: xxx           │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Backend:                               │
│  1. Validate secret (timing-safe)       │
│  2. Generate new presigned PUT URL      │
│  3. Return { presignedUrl }             │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Plugin: PUT updated session to R2      │
└─────────────────────────────────────────┘
```

### 4. Unshare (Future)

```
User: /unshare
         │
         ▼
┌─────────────────────────────────────────┐
│  Plugin: DELETE /api/share/{id}         │
│  Headers: X-Share-Secret: xxx           │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Backend:                               │
│  1. Validate secret                     │
│  2. Delete from R2                      │
│  3. Delete from PostgreSQL              │
│  4. Return { ok: true }                 │
└─────────────────────────────────────────┘
```

## Components

### Plugin (`plugin/`)

OpenCode plugin that intercepts share events and uploads to R2.

**Key files:**
- `src/index.ts` - Main plugin logic
- `src/common.ts` - URL helpers

**Responsibilities:**
- Listen for `session.updated` events
- Override clipboard with custom share URL
- Request presigned URLs from backend
- Upload session data directly to R2

### Web (`web/`)

Next.js app with Elysia API backend.

**Key files:**
- `src/lib/api.ts` - Elysia API routes
- `src/lib/db.ts` - PostgreSQL operations
- `src/lib/s3.ts` - R2/S3 presigned URL generation
- `src/app/share/[id]/page.tsx` - Share viewer

**API Endpoints:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/share/presign` | None | Create share, get presigned URL |
| POST | `/api/share/:id/presign` | X-Share-Secret | Get presigned URL for sync |
| GET | `/api/share/:id` | None | Get share data |
| DELETE | `/api/share/:id` | X-Share-Secret | Delete share |

## Data Model

### PostgreSQL: `shares` table

```sql
CREATE TABLE shares (
  share_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  secret TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### R2: `sessions/{shareId}.json`

```typescript
interface ShareData {
  shareId: string;
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  session: Session;
  messages: Array<{
    info: Message;
    parts: Part[];
  }>;
}
```

## Security

1. **Presigned URLs** - Plugin uploads directly to R2, no data flows through backend
2. **Secret-based auth** - Sync/delete operations require the secret returned at creation
3. **Timing-safe comparison** - Prevents timing attacks on secret validation
4. **Rate limiting** - 10 shares/hour per IP, 100 requests/minute general
5. **Input validation** - ShareId format validation prevents path traversal

## Environment Variables

### Plugin
- `BETTER_SHARE_BASE_URL` - API base URL (default: `https://opncd.com`)

### Web
```env
DATABASE_URL=postgres://user:pass@host:5432/dbname
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_BUCKET=opncd-shares
BASE_URL=https://opncd.com
```

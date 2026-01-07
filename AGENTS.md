# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working on the OpenCode Better Share project.

## Project Overview

A monorepo with two packages:

- `packages/plugin` - OpenCode plugin that overrides `/share` and `/unshare` commands
- `packages/web` - Next.js app with Elysia API, deployed to Railway

**Runtime:** Bun (not Node.js)

## Build/Lint/Test Commands

### Root Commands

```bash
bun install          # Install all dependencies
bun run dev          # Run web dev server
bun run build        # Build all packages
```

### Plugin Package (`packages/plugin`)

```bash
bun run build        # Build: bun build src/index.ts --outdir dist --target node
bun run typecheck    # Type check: tsc --noEmit
```

### Web Package (`packages/web`)

```bash
bun run dev          # Start dev server: bun --bun next dev
bun run build        # Production build: bun --bun next build
bun run start        # Start production: bun --bun next start
bun run lint         # Run ESLint: next lint
```

### No Test Suite

This project does not have automated tests. Validate changes by:

1. Running `bun run typecheck` in `packages/plugin`
2. Running `bun run build` in both packages
3. Manual testing with OpenCode

## Code Style Guidelines

```typescript
// Correct
import type { Plugin, PluginInput } from "@opencode-ai/plugin";
import { nanoid } from "nanoid";
import { readFile } from "fs/promises";
import { ShareManager } from "./share";
```

### Formatting

- **Indentation:** 2 spaces
- **Quotes:** Double quotes for strings
- **Semicolons:** Always use semicolons
- **Trailing commas:** Yes, in multi-line objects/arrays
- **Line length:** ~80-100 characters

### TypeScript Patterns

**Strict mode is enabled.** Key settings:

- `target: ES2022`
- `module: ESNext`
- `moduleResolution: bundler`
- `strict: true`

**Type definitions:**

- Use `interface` for object shapes
- Use `type` only for unions or aliases
- Never use `any` - use `unknown` if type is uncertain
- Always declare return types on exported functions

```typescript
// Interface for object shapes
export interface ShareInfo {
  shareId: string;
  secret: string;
  url: string;
  sessionId: string;
  createdAt: number;
}

// Type for unions
type ToastVariant = "success" | "error" | "info";

// Explicit return types
async function createShare(
  id: string,
): Promise<{ url: string; error?: string }> {
  // ...
}
```

### Naming Conventions

| Element             | Convention           | Example                       |
| ------------------- | -------------------- | ----------------------------- |
| Variables/functions | camelCase            | `shareManager`, `handleShare` |
| Classes             | PascalCase           | `ShareManager`                |
| Interfaces/Types    | PascalCase           | `ShareInfo`, `ApiError`       |
| Constants (env)     | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `BASE_URL`    |
| Files               | lowercase            | `storage.ts`, `share.ts`      |
| React components    | PascalCase           | `SharePage`, `Home`           |

### Error Handling

**Pattern 1: Result objects with optional error**

```typescript
async function createShare(): Promise<{ url: string; error?: string }> {
  if (!valid) {
    return { url: "", error: "Invalid input" };
  }
  return { url: result.url };
}
```

**Pattern 2: Early returns for validation**

```typescript
if (!sessionId) {
  await showToast(ctx, "No active session", "error");
  return;
}
```

**Pattern 3: Try-catch with fallback**

```typescript
try {
  const data = await fetchData();
  return data;
} catch {
  return null;
}
```

**Pattern 4: Console logging for debug**

```typescript
} catch (err) {
  console.error("[better-share] Sync failed:", err);
  return false;
}
```

### JSDoc Comments

Add JSDoc blocks for exported functions and classes:

```typescript
/**
 * ShareManager handles all share operations
 * - Creating shares
 * - Syncing updates
 * - Removing shares
 */
export class ShareManager {
  /**
   * Check if a session is currently shared
   */
  isShared(sessionID: string): boolean {
    return this.activeShares.has(sessionID);
  }
}
```

## Bun-Specific APIs

This project uses Bun's native APIs instead of npm packages:

### SQLite (packages/web)

```typescript
import { Database } from "bun:sqlite";
const db = new Database(DATABASE_PATH, { create: true });
```

### S3/R2 Client (packages/web)

```typescript
const client = new Bun.S3Client({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET,
});
```

Do NOT use `@aws-sdk/client-s3` or other AWS SDK packages.

## Project Structure

```
better-share/
├── packages/
│   ├── plugin/src/
│   │   ├── index.ts      # Plugin entry, event handlers
│   │   ├── share.ts      # ShareManager class
│   │   ├── storage.ts    # Read OpenCode local session files
│   │   └── types.ts      # TypeScript interfaces
│   └── web/src/
│       ├── app/
│       │   ├── api/[[...slugs]]/route.ts  # Elysia API catch-all
│       │   ├── share/[id]/page.tsx        # Share viewer
│       │   ├── page.tsx                   # Home page
│       │   └── layout.tsx
│       └── lib/
│           ├── api.ts    # Elysia routes
│           ├── db.ts     # SQLite database
│           └── s3.ts     # S3/R2 operations
```

## Environment Variables

### Plugin

- `BETTER_SHARE_API_URL` - API base URL (default: `https://opncd.com`)

### Web (`packages/web/.env`)

```env
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_BUCKET=opncd-shares
S3_PUBLIC_URL=https://pub-xxx.r2.dev
BASE_URL=https://opncd.com
DATABASE_PATH=./data/shares.db
```

## Key Patterns

### Elysia API Routes

```typescript
export const app = new Elysia({ prefix: "/api" })
  .use(cors())
  .get("/health", () => ({ ok: true }))
  .post(
    "/share/presign",
    async ({ body, set }) => {
      // set.status for error codes
      if (error) {
        set.status = 409;
        return { error: "Message", code: "CODE" };
      }
      return { presignedUrl, secret, url };
    },
    {
      body: t.Object({
        shareId: t.String(),
        sessionId: t.String(),
      }),
    },
  );
```

### React Server Components (Next.js App Router)

```typescript
export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getShareData(id);
  if (!data) notFound();
  return <div>...</div>;
}
```

## Common Pitfalls

1. **Don't use Node.js APIs directly** - Use Bun equivalents
2. **Don't add AWS SDK** - Use `Bun.S3Client` for S3/R2
3. **Don't forget type imports** - Use `import type` for types only
4. **Don't use `any`** - Use `unknown` or proper types
5. **Run typecheck before committing** - `bun run typecheck` in plugin package

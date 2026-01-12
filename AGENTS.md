# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working on the OpenCode Better Share project.

## Documentation Resources

When writing code or debugging issues, consult these official docs:

| Technology       | Documentation                     |
| ---------------- | --------------------------------- |
| Bun              | https://bun.sh/llms.txt           |
| Elysia           | https://elysiajs.com/llms.txt     |
| Next.js          | https://nextjs.org/docs           |
| OpenCode Plugins | https://opencode.ai/docs/plugins/ |

**Always check the relevant documentation before:**

- Using Bun-specific APIs (SQL, S3, etc.)
- Writing Elysia routes or middleware
- Implementing Next.js App Router patterns
- Working with the OpenCode plugin SDK

## Project Overview

A monorepo with two packages:

- `plugin` - OpenCode plugin that overrides session share logic
- `web` - Next.js app with Elysia API, deployed to Railway

**Runtime:** Bun (not Node.js)

## Build/Lint/Test Commands

### Root Commands

```bash
bun install          # Install all dependencies
bun run dev          # Run web dev server
bun run build        # Build all packages
bun run format       # Format all files with Biome
bun run lint         # Lint all files with Biome
```

### Plugin Package (`plugin`)

```bash
bun dev
bun typecheck    # Type check: tsc --noEmit
bun run build        # Build: bun build src/index.ts --outdir dist --target node
```

### Web Package (`web`)

```bash
bun dev          # Start dev server: bun --bun next dev
bun start        # Start production: bun --bun next start
bun run build        # Production build: bun --bun next build
```

### No Test Suite

This project does not have automated tests. Validate changes by:

1. Running `bun run typecheck` in `plugin`
2. Running `bun run build` in both packages
3. Manual testing with OpenCode

## Code Style Guidelines

This project uses **Biome** for formatting and linting. Configured in `biome.json`. Run `bun run format` before committing.




### PostgreSQL (web)

Use Bun's built-in SQL client (NOT `pg` or other packages). https://bun.com/docs/runtime/sql.md


### S3 Client (web)

Use Bun's built-in S3 client (NOT `@aws-sdk/client-s3` or other packages ) https://bun.com/docs/runtime/s3.md

## Environment Variables

### Plugin

- `BETTER_SHARE_API_URL` - API base URL (default: `https://opncd.com`)

### Web (`web/.env`)

```env
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_BUCKET=opncd-shares
S3_PUBLIC_URL=https://pub-xxx.r2.dev
BASE_URL=https://opncd.com
DATABASE_URL=postgres://user:pass@host:5432/dbname
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


## Common Pitfalls

1. **Don't use Node.js APIs directly in Bun has an alternative** - Use Bun equivalents
2. **Don't add AWS SDK** - Use `Bun.S3Client` for S3/R2
3. **Don't forget type imports** - Use `import type` for types only
4. **Don't use `any`** - Use `unknown` or proper types
5. **Run typecheck before committing** - `bun typecheck`
6. **Run format before committting** - `bun format` in 

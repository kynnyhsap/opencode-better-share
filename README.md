# OpenCode Better Share

Custom sharing for OpenCode sessions at [opncd.com](https://opncd.com).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Plugin (npm package)                         │
│  - Overrides /share and /unshare commands                       │
│  - Reads session data from OpenCode local storage               │
│  - Syncs to R2 via presigned URLs                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Web (Next.js on Railway)                     │
│  - Elysia API routes for presigned URL generation               │
│  - SQLite for secret storage                                    │
│  - Share viewer at /share/[id]                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare R2                                │
│  - Session JSON files at sessions/{shareId}.json                │
│  - Direct upload via presigned URLs                             │
└─────────────────────────────────────────────────────────────────┘
```

## Packages

- `plugin` - OpenCode plugin (`opencode-better-share` on npm)
- `web` - Next.js web app with Elysia API

## Development

### Prerequisites

- [Bun](https://bun.sh) installed
- Cloudflare account with R2 bucket

### Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Set up environment variables in `web/.env`:

   ```env
   S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
   S3_ACCESS_KEY_ID=your_access_key_id
   S3_SECRET_ACCESS_KEY=your_secret_access_key
   S3_BUCKET=opncd-shares
   S3_PUBLIC_URL=https://pub-xxx.r2.dev
   BASE_URL=http://localhost:3000
   DATABASE_PATH=./data/shares.db
   ```

3. Run development server:
   ```bash
   bun run dev
   ```

### Building

```bash
bun run build
```

## Local Testing with OpenCode

### Option 1: Link the plugin locally

1. Build the plugin:

   ```bash
   cd plugin
   bun run build
   ```

2. Create a local plugin file in your project's `.opencode/plugin/` directory:

   ```bash
   mkdir -p .opencode/plugin
   ```

3. Create `.opencode/plugin/better-share.ts`:

   ```typescript
   export { BetterSharePlugin as default } from "/absolute/path/to/better-share/plugin/dist/index.js";
   ```

   Or copy the built file:

   ```bash
   cp /path/to/better-share/plugin/dist/index.js .opencode/plugin/better-share.js
   ```

4. Set the API URL environment variable:

   ```bash
   export BETTER_SHARE_API_URL=http://localhost:3000
   ```

5. Start the web server:

   ```bash
   cd /path/to/better-share
   bun run dev
   ```

6. Start OpenCode - it will automatically load plugins from `.opencode/plugin/`

### Option 2: Use global plugin directory

1. Build the plugin:

   ```bash
   cd plugin
   bun run build
   ```

2. Copy to global plugin directory:

   ```bash
   mkdir -p ~/.config/opencode/plugin
   cp dist/index.js ~/.config/opencode/plugin/better-share.js
   ```

3. Set environment and run as above.

### Testing the flow

1. Start the web server: `bun run dev`
2. Open OpenCode in a project
3. Run `/share` - should show a URL like `http://localhost:3000/share/xxx`
4. Visit the URL to see the JSON
5. Continue the conversation - data syncs automatically
6. Run `/unshare` to remove

## Deployment

### Railway

1. Create a new project on Railway
2. Connect this repo
3. Set environment variables:
   - `S3_ENDPOINT`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `S3_BUCKET`
   - `S3_PUBLIC_URL`
   - `BASE_URL` (your Railway URL or custom domain)
   - `DATABASE_PATH=/app/data/shares.db`

4. Add a volume mounted at `/app/data` for SQLite persistence

5. Deploy:
   ```bash
   railway up
   ```

### Cloudflare R2 Setup

1. Create an R2 bucket (e.g., `opncd-shares`)
2. Create API token with read/write access
3. (Optional) Enable public access for the bucket
4. Note down:
   - Account ID (for endpoint URL)
   - Access Key ID
   - Secret Access Key
   - Public bucket URL (if enabled)

## Plugin Usage

### Installation

Add to your OpenCode config (`opencode.json`):

```json
{
  "plugin": ["opencode-better-share"]
}
```

Or install locally (see Local Testing above).

### Commands

- `/share` - Share current session (shows URL from opncd.com)
- `/unshare` - Remove share

### Environment Variables (Plugin)

- `BETTER_SHARE_API_URL` - API base URL (default: `https://opncd.com`)

## API Endpoints

| Method   | Path                     | Auth   | Description                     |
| -------- | ------------------------ | ------ | ------------------------------- |
| `GET`    | `/api/health`            | -      | Health check                    |
| `POST`   | `/api/share/presign`     | -      | Create share, get presigned URL |
| `POST`   | `/api/share/:id/presign` | Secret | Get presigned URL for sync      |
| `GET`    | `/api/share/:id`         | -      | Get share data                  |
| `DELETE` | `/api/share/:id`         | Secret | Delete share                    |

## License

MIT

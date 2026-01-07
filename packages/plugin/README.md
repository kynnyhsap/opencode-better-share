# opencode-better-share

OpenCode plugin for custom session sharing with your own backend. Share your OpenCode sessions to [opncd.com](https://opncd.com) instead of the default opncd.ai.

## Installation

Add the plugin to your `opencode.json` or `opencode.jsonc`:

```json
{
  "plugin": ["opencode-better-share@latest"]
}
```

To pin a specific version:

```json
{
  "plugin": ["opencode-better-share@0.1.0"]
}
```

Restart OpenCode. The plugin will be automatically installed and loaded.

## Usage

### Share a session

```
/share
```

This will:

1. Create a share using OpenCode's SDK (to get a share ID)
2. Upload your session data to opncd.com
3. Display your custom share URL: `https://opncd.com/share/{shareId}`

### Remove a share

```
/unshare
```

This removes the share from both opncd.com and OpenCode's default sharing.

## How it works

1. When you run `/share`, the plugin:
   - Calls OpenCode's share API to get a consistent share ID
   - Reads your session data from `~/.local/share/opencode/storage/`
   - Requests a presigned URL from the opncd.com API
   - Uploads your session directly to R2 storage

2. Real-time sync:
   - The plugin listens for `message.updated` and `message.part.updated` events
   - Changes are debounced and synced automatically
   - Your shared session updates in real-time as you work

3. When you run `/unshare`:
   - Deletes the session from opncd.com storage
   - Removes the share from OpenCode

## Configuration

Set the API URL via environment variable (optional):

```bash
export BETTER_SHARE_API_URL=https://opncd.com
```

Default: `https://opncd.com`

## Updating

OpenCode caches plugins in `~/.cache/opencode`. To get the latest version:

**Linux/macOS:**

```bash
rm -rf ~/.cache/opencode/node_modules/opencode-better-share
```

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.cache\opencode\node_modules\opencode-better-share"
```

Then restart OpenCode.

## Self-hosting

If you want to run your own instance of the share backend:

1. Clone the repository
2. Deploy the `packages/web` Next.js app to Railway or similar
3. Set up a Cloudflare R2 bucket
4. Configure environment variables
5. Set `BETTER_SHARE_API_URL` to your deployment URL

See the [main README](https://github.com/yourusername/opencode-better-share) for deployment instructions.

## License

MIT

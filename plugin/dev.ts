import { dirname, join } from "node:path";
import { $, spawn } from "bun";

const scriptDir = dirname(import.meta.path);

console.log("Building plugin...");
await $`bun run build`.cwd(scriptDir);

const pluginPath = join(scriptDir, "dist", "index.js");

const pluginFile = Bun.file(pluginPath);
if (!(await pluginFile.exists())) {
  console.error(`Error: Plugin not found at ${pluginPath}`);
  process.exit(1);
}

console.log(`Starting OpenCode with plugin: ${pluginPath}`);

const proc = spawn(["opencode"], {
  env: {
    ...process.env,
    OPENCODE_CONFIG_CONTENT: JSON.stringify({
      plugins: [`file://${pluginPath}`],
    }),
  },
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});

await proc.exited;

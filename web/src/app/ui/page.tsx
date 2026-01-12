"use client";

import { useMemo, useState } from "react";
import { MarkdownContent } from "@/components/markdown";
import { AssistantMessage, UserMessage } from "@/components/messages";
import {
  BashTool,
  DefaultTool,
  DiffView,
  EditTool,
  GrepTool,
  ReadTool,
  WebFetchTool,
  WriteTool,
} from "@/components/tools";
import { BlockWrapper, CodeBlock } from "@/components/ui";
import {
  type ColorScheme,
  DEFAULT_THEME_ID,
  resolveTheme,
  THEME_LIST,
  THEMES,
  themeToStyles,
} from "@/lib/theme";
import type { MessageWithParts, ToolPart } from "@/lib/types";

// Sample data for showcasing components
const SAMPLE_MARKDOWN = `# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold text** and \`inline code\`.

Here's a [link to OpenCode](https://opencode.ai).

> This is a blockquote with some interesting content.

- First item in a list
- Second item with more text
- Third item

1. Numbered item one
2. Numbered item two
3. Numbered item three

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

---

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
\`\`\`
`;

// Use type assertions for mock data - these are simplified versions for demo purposes
const SAMPLE_USER_MESSAGE = {
  info: {
    id: "user-1",
    sessionID: "session-1",
    role: "user",
    time: { created: Date.now() },
    agent: "code",
    model: { providerID: "anthropic", modelID: "claude-sonnet-4-20250514" },
  },
  parts: [
    {
      id: "part-1",
      sessionID: "session-1",
      messageID: "user-1",
      type: "text",
      text: "Can you help me create a function that calculates the factorial of a number?",
    },
  ],
} as MessageWithParts;

const SAMPLE_ASSISTANT_MESSAGE = {
  info: {
    id: "assistant-1",
    sessionID: "session-1",
    role: "assistant",
    parentID: "user-1",
    modelID: "claude-sonnet-4-20250514",
    providerID: "anthropic",
    mode: "code",
    path: { cwd: "/project", root: "/project" },
    cost: 0.0015,
    tokens: { input: 150, output: 200, reasoning: 0, cache: { read: 0, write: 0 } },
    time: {
      created: Date.now() - 5000,
      completed: Date.now(),
    },
  },
  parts: [
    {
      id: "part-2",
      sessionID: "session-1",
      messageID: "assistant-1",
      type: "text",
      text: "I'll help you create a factorial function. Here's a TypeScript implementation:\n\n```typescript\nfunction factorial(n: number): number {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n```\n\nThis uses recursion to calculate the factorial.",
    },
  ],
} as MessageWithParts;

const SAMPLE_BASH_TOOL = {
  id: "tool-bash-1",
  sessionID: "session-1",
  messageID: "assistant-1",
  callID: "call-1",
  type: "tool",
  tool: "bash",
  state: {
    status: "completed",
    title: "List source directory",
    input: {
      command: "ls -la src/",
      description: "List source directory contents",
    },
    metadata: {},
    output: `Generating static pages using 9 workers (3/4)
✓ Generating static pages using 9 workers (4/4) in 344.2ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/[[...slugs]]
├ ƒ /share/[id]
└ ○ /ui


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand`,
    time: { start: Date.now() - 1000, end: Date.now() },
  },
} as ToolPart;

const SAMPLE_EDIT_TOOL = {
  id: "tool-edit-1",
  sessionID: "session-1",
  messageID: "assistant-1",
  callID: "call-2",
  type: "tool",
  tool: "edit",
  state: {
    status: "completed",
    title: "Edit math.ts",
    input: {
      filePath: "/src/utils/math.ts",
      oldString: "function add(a, b) {\n  return a + b;\n}",
      newString: "function add(a: number, b: number): number {\n  return a + b;\n}",
    },
    metadata: {
      diff: `--- a/src/utils/math.ts
+++ b/src/utils/math.ts
@@ -1,3 +1,3 @@
-function add(a, b) {
+function add(a: number, b: number): number {
   return a + b;
 }`,
    },
    output: "File edited successfully",
    time: { start: Date.now() - 500, end: Date.now() },
  },
} as ToolPart;

const SAMPLE_DEFAULT_TOOL = {
  id: "tool-default-1",
  sessionID: "session-1",
  messageID: "assistant-1",
  callID: "call-3",
  type: "tool",
  tool: "search",
  state: {
    status: "completed",
    title: "Search codebase",
    input: {
      query: "factorial function",
      path: "/src",
    },
    metadata: {},
    output: `Found 3 matches:
- src/utils/math.ts:15
- src/tests/math.test.ts:42
- src/examples/demo.ts:8`,
    time: { start: Date.now() - 2000, end: Date.now() },
  },
} as ToolPart;

const SAMPLE_GREP_TOOL = {
  id: "tool-grep-1",
  sessionID: "session-1",
  messageID: "assistant-1",
  callID: "call-4",
  type: "tool",
  tool: "grep",
  state: {
    status: "completed",
    title: "Grep pattern",
    input: {
      pattern: "useState",
      include: "*.tsx",
    },
    metadata: {},
    output: `src/app/ui/page.tsx:222
src/components/tools/DefaultTool.tsx:15
src/app/share/[id]/SharePageClient.tsx:18`,
    time: { start: Date.now() - 300, end: Date.now() },
  },
} as ToolPart;

const SAMPLE_READ_TOOL = {
  id: "tool-read-1",
  sessionID: "session-1",
  messageID: "assistant-1",
  callID: "call-5",
  type: "tool",
  tool: "read",
  state: {
    status: "completed",
    title: "Read file",
    input: {
      filePath: "web/src/lib/types.ts",
    },
    metadata: {},
    output: `export type { Session, Message, Part } from "@opencode-ai/sdk/client";`,
    time: { start: Date.now() - 200, end: Date.now() },
  },
} as ToolPart;

const SAMPLE_EDIT_ERROR_TOOL = {
  id: "tool-edit-error-1",
  sessionID: "session-1",
  messageID: "assistant-1",
  callID: "call-6",
  type: "tool",
  tool: "edit",
  state: {
    status: "error",
    input: {
      filePath: "/Users/kynnyhsap/Projects/better-share/web/src/app/ui/page.tsx",
    },
    error:
      "Error: You must read the file /Users/kynnyhsap/Projects/better-share/web/src/app/ui/page.tsx before overwriting it. Use the Read tool first",
    time: { start: Date.now() - 100, end: Date.now() },
  },
} as ToolPart;

const SAMPLE_WEBFETCH_TOOL = {
  id: "tool-webfetch-1",
  sessionID: "session-1",
  messageID: "assistant-1",
  callID: "call-7",
  type: "tool",
  tool: "webfetch",
  state: {
    status: "completed",
    title: "Fetch URL",
    input: {
      url: "https://opencode.ai/docs",
      format: "markdown",
    },
    metadata: {},
    output: "# OpenCode Documentation\n\nWelcome to OpenCode...",
    time: { start: Date.now() - 500, end: Date.now() },
  },
} as ToolPart;

const SAMPLE_WEBFETCH_ERROR_TOOL = {
  id: "tool-webfetch-error-1",
  sessionID: "session-1",
  messageID: "assistant-1",
  callID: "call-8",
  type: "tool",
  tool: "webfetch",
  state: {
    status: "error",
    input: {
      url: "https://diffs.com/docs",
      format: "markdown",
    },
    error: "Error: Response too large (exceeds 5MB limit)",
    time: { start: Date.now() - 100, end: Date.now() },
  },
} as ToolPart;

const SAMPLE_WRITE_TOOL = {
  id: "tool-write-1",
  sessionID: "session-1",
  messageID: "assistant-1",
  callID: "call-9",
  type: "tool",
  tool: "write",
  state: {
    status: "completed",
    title: "Write file",
    input: {
      filePath: "web/src/components/tools/WebFetchTool.tsx",
      content: `"use client";

import type { ThemedProps } from "@/components/ui";
import type { ToolPart } from "@/lib/types";
import { getToolInput } from "@/lib/utils";

interface WebFetchToolProps extends ThemedProps {
  tool: ToolPart;
}

/**
 * Check if this is a WebFetch tool
 */
export function isWebFetchTool(tool: ToolPart): boolean {
  return tool.tool === "webfetch";
}

/**
 * WebFetch tool component - displays URL being fetched
 * TUI style: ⊛ WebFetch https://example.com
 *            Error: message (if error)
 */
export function WebFetchTool({ tool, themeStyles }: WebFetchToolProps) {
  const url = getToolInput<string>(tool, "url");
  const isError = tool.state.status === "error";
  const errorMessage = isError && "error" in tool.state ? tool.state.error : null;

  if (!url) {
    return null;
  }

  return (
    <div>
      <div style={{ color: themeStyles.textMuted, fontSize: "0.8125rem" }}>
        <span style={{ color: themeStyles.accent }}>⊛</span> WebFetch {url}
      </div>

      {/* Error message beneath */}
      {errorMessage && (
        <div style={{ color: themeStyles.error, fontSize: "0.8125rem" }}>{errorMessage}</div>
      )}
    </div>
  );
}`,
    },
    metadata: {},
    output: "File written successfully",
    time: { start: Date.now() - 300, end: Date.now() },
  },
} as ToolPart;

const SAMPLE_DIFF = `--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,10 +1,15 @@
 import React from 'react';
 
-interface ButtonProps {
+export interface ButtonProps {
   label: string;
+  variant?: 'primary' | 'secondary';
   onClick: () => void;
+  disabled?: boolean;
 }
 
-export function Button({ label, onClick }: ButtonProps) {
-  return <button onClick={onClick}>{label}</button>;
+export function Button({ label, variant = 'primary', onClick, disabled }: ButtonProps) {
+  const className = \`btn btn-\${variant}\`;
+  return (
+    <button className={className} onClick={onClick} disabled={disabled}>
+      {label}
+    </button>
+  );
 }`;

export default function ShowcasePage() {
  const [themeName, setThemeName] = useState(DEFAULT_THEME_ID);
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");

  const themeStyles = useMemo(() => {
    const theme = THEMES[themeName] || THEMES[DEFAULT_THEME_ID];
    const resolved = resolveTheme(theme, colorScheme);
    return themeToStyles(resolved);
  }, [themeName, colorScheme]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: themeStyles.bg,
        color: themeStyles.text,
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: themeStyles.bgSecondary,
          borderBottom: `1px solid ${themeStyles.border}`,
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>UI Showcase</h1>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {/* Theme selector */}
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.875rem", color: themeStyles.textMuted }}>Theme:</span>
              <select
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${themeStyles.border}`,
                  backgroundColor: themeStyles.bg,
                  color: themeStyles.text,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                {THEME_LIST.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Color scheme toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.875rem", color: themeStyles.textMuted }}>Mode:</span>
              <select
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${themeStyles.border}`,
                  backgroundColor: themeStyles.bg,
                  color: themeStyles.text,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {/* Color Palette Section */}
        <Section title="Color Palette" themeStyles={themeStyles}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "12px",
            }}
          >
            <ColorSwatch name="Primary" color={themeStyles.primary} textColor={themeStyles.bg} />
            <ColorSwatch
              name="Secondary"
              color={themeStyles.secondary}
              textColor={themeStyles.bg}
            />
            <ColorSwatch name="Accent" color={themeStyles.accent} textColor={themeStyles.bg} />
            <ColorSwatch name="Success" color={themeStyles.success} textColor={themeStyles.bg} />
            <ColorSwatch name="Warning" color={themeStyles.warning} textColor={themeStyles.bg} />
            <ColorSwatch name="Error" color={themeStyles.error} textColor={themeStyles.bg} />
            <ColorSwatch name="Info" color={themeStyles.info} textColor={themeStyles.bg} />
            <ColorSwatch name="Text" color={themeStyles.text} textColor={themeStyles.bg} />
            <ColorSwatch
              name="Text Muted"
              color={themeStyles.textMuted}
              textColor={themeStyles.bg}
            />
            <ColorSwatch
              name="Background"
              color={themeStyles.bg}
              textColor={themeStyles.text}
              border
            />
            <ColorSwatch
              name="Bg Secondary"
              color={themeStyles.bgSecondary}
              textColor={themeStyles.text}
              border
            />
            <ColorSwatch name="Border" color={themeStyles.border} textColor={themeStyles.text} />
          </div>
        </Section>

        {/* Messages Section */}
        <Section title="Messages" themeStyles={themeStyles}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <SectionLabel themeStyles={themeStyles}>User Message</SectionLabel>
              <UserMessage
                message={SAMPLE_USER_MESSAGE}
                colorScheme={colorScheme}
                themeStyles={themeStyles}
              />
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>Assistant Message</SectionLabel>
              <AssistantMessage
                message={SAMPLE_ASSISTANT_MESSAGE}
                colorScheme={colorScheme}
                themeStyles={themeStyles}
              />
            </div>
          </div>
        </Section>

        {/* Tool Calls Section */}
        <Section title="Tool Calls" themeStyles={themeStyles}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <SectionLabel themeStyles={themeStyles}>Grep Tool</SectionLabel>
              <GrepTool tool={SAMPLE_GREP_TOOL} themeStyles={themeStyles} />
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>Read Tool</SectionLabel>
              <ReadTool tool={SAMPLE_READ_TOOL} themeStyles={themeStyles} />
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>Bash Tool</SectionLabel>
              <BashTool tool={SAMPLE_BASH_TOOL} themeStyles={themeStyles} />
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>Edit Tool (with Diff)</SectionLabel>
              <EditTool tool={SAMPLE_EDIT_TOOL} themeStyles={themeStyles} />
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>Edit Tool (with Error)</SectionLabel>
              <EditTool tool={SAMPLE_EDIT_ERROR_TOOL} themeStyles={themeStyles} />
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>WebFetch Tool</SectionLabel>
              <WebFetchTool tool={SAMPLE_WEBFETCH_TOOL} themeStyles={themeStyles} />
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>WebFetch Tool (with Error)</SectionLabel>
              <WebFetchTool tool={SAMPLE_WEBFETCH_ERROR_TOOL} themeStyles={themeStyles} />
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>Write Tool</SectionLabel>
              <WriteTool tool={SAMPLE_WRITE_TOOL} themeStyles={themeStyles} />
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>Default Tool (Collapsed)</SectionLabel>
              <DefaultTool tool={SAMPLE_DEFAULT_TOOL} themeStyles={themeStyles} />
            </div>
          </div>
        </Section>

        {/* Diff View Section */}
        <Section title="Diff View" themeStyles={themeStyles}>
          <DiffView
            diff={SAMPLE_DIFF}
            filePath="src/components/Button.tsx"
            themeStyles={themeStyles}
          />
        </Section>

        {/* Markdown Section */}
        <Section title="Markdown Rendering" themeStyles={themeStyles}>
          <MarkdownContent
            content={SAMPLE_MARKDOWN}
            colorScheme={colorScheme}
            themeStyles={themeStyles}
          />
        </Section>

        {/* UI Components Section */}
        <Section title="UI Components" themeStyles={themeStyles}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <SectionLabel themeStyles={themeStyles}>Block Wrapper</SectionLabel>
              <BlockWrapper themeStyles={themeStyles}>
                <div>This is content inside a BlockWrapper component.</div>
                <div style={{ marginTop: "8px", color: themeStyles.textMuted }}>
                  Used for tool outputs and panels.
                </div>
              </BlockWrapper>
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>Code Block</SectionLabel>
              <CodeBlock themeStyles={themeStyles}>
                {`const greeting = "Hello, World!";
console.log(greeting);`}
              </CodeBlock>
            </div>

            <div>
              <SectionLabel themeStyles={themeStyles}>Code Block (with max height)</SectionLabel>
              <CodeBlock themeStyles={themeStyles} maxHeight="150px">
                {`// This is a longer code block that will scroll
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// This is more content to demonstrate scrolling
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const doubled = numbers.map(n => n * 2);
console.log(doubled);`}
              </CodeBlock>
            </div>
          </div>
        </Section>

        {/* Typography Section */}
        <Section title="Typography" themeStyles={themeStyles}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{ fontSize: "1.5rem", fontWeight: 600, color: themeStyles.markdownHeading }}
            >
              Heading 1 (1.5rem)
            </div>
            <div
              style={{ fontSize: "1.25rem", fontWeight: 600, color: themeStyles.markdownHeading }}
            >
              Heading 2 (1.25rem)
            </div>
            <div
              style={{ fontSize: "1.1rem", fontWeight: 600, color: themeStyles.markdownHeading }}
            >
              Heading 3 (1.1rem)
            </div>
            <div style={{ fontSize: "1rem", color: themeStyles.text }}>
              Body text (1rem) - The quick brown fox jumps over the lazy dog.
            </div>
            <div style={{ fontSize: "0.875rem", color: themeStyles.text }}>
              Small text (0.875rem) - Used for message content and general UI.
            </div>
            <div style={{ fontSize: "0.8125rem", color: themeStyles.textMuted }}>
              Muted text (0.8125rem) - Used for tool outputs and secondary info.
            </div>
            <div style={{ fontSize: "0.75rem", color: themeStyles.textMuted }}>
              Extra small (0.75rem) - Used for metadata and timestamps.
            </div>
          </div>
        </Section>

        {/* Status Indicators Section */}
        <Section title="Status Indicators" themeStyles={themeStyles}>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <StatusIndicator color={themeStyles.success} label="Completed" />
            <StatusIndicator color={themeStyles.warning} label="Pending" />
            <StatusIndicator color={themeStyles.error} label="Error" />
            <StatusIndicator color={themeStyles.info} label="Info" />
            <StatusIndicator color={themeStyles.primary} label="Primary" />
          </div>
        </Section>
      </main>
    </div>
  );
}

// Helper components

function Section({
  title,
  children,
  themeStyles,
}: {
  title: string;
  children: React.ReactNode;
  themeStyles: ReturnType<typeof themeToStyles>;
}) {
  return (
    <section style={{ marginBottom: "48px" }}>
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: themeStyles.markdownHeading,
          marginBottom: "16px",
          paddingBottom: "8px",
          borderBottom: `1px solid ${themeStyles.border}`,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SectionLabel({
  children,
  themeStyles,
}: {
  children: React.ReactNode;
  themeStyles: ReturnType<typeof themeToStyles>;
}) {
  return (
    <div
      style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: themeStyles.textMuted,
        marginBottom: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </div>
  );
}

function ColorSwatch({
  name,
  color,
  textColor,
  border,
}: {
  name: string;
  color: string;
  textColor: string;
  border?: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: color,
        color: textColor,
        padding: "12px",
        borderRadius: "6px",
        fontSize: "0.75rem",
        border: border ? `1px solid ${textColor}33` : "none",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{name}</div>
      <div style={{ opacity: 0.8, fontFamily: "monospace" }}>{color}</div>
    </div>
  );
}

function StatusIndicator({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
      <span style={{ fontSize: "0.875rem" }}>{label}</span>
    </div>
  );
}

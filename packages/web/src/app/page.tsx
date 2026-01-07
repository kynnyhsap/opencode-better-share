export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: "60px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            background: "linear-gradient(135deg, #fff 0%, #888 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          opncd.com
        </h1>
        <p style={{ color: "#888", fontSize: "1.125rem" }}>
          Better sharing for OpenCode sessions
        </p>
      </header>

      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#ccc",
          }}
        >
          Installation
        </h2>
        <p style={{ color: "#888", marginBottom: "16px", lineHeight: 1.6 }}>
          Add the plugin to your{" "}
          <code style={codeInlineStyle}>opencode.json</code>:
        </p>
        <pre style={codeBlockStyle}>
          {`{
  "plugin": ["opencode-better-share"]
}`}
        </pre>
        <p style={{ color: "#666", fontSize: "0.875rem", marginTop: "12px" }}>
          Restart OpenCode after adding the plugin.
        </p>
      </section>

      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#ccc",
          }}
        >
          Usage
        </h2>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "1rem", color: "#aaa", marginBottom: "8px" }}>
            Share a session
          </h3>
          <pre style={codeBlockStyle}>/share</pre>
          <p style={{ color: "#888", marginTop: "8px", lineHeight: 1.6 }}>
            Creates a shareable link to your current session. The link updates
            in real-time as you continue working.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: "1rem", color: "#aaa", marginBottom: "8px" }}>
            Remove a share
          </h3>
          <pre style={codeBlockStyle}>/unshare</pre>
          <p style={{ color: "#888", marginTop: "8px", lineHeight: 1.6 }}>
            Removes the share and deletes all shared data.
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#ccc",
          }}
        >
          How it works
        </h2>
        <ul
          style={{
            color: "#888",
            lineHeight: 1.8,
            paddingLeft: "20px",
          }}
        >
          <li>
            When you run <code style={codeInlineStyle}>/share</code>, your
            session data is uploaded to our servers
          </li>
          <li>
            You get a unique URL like{" "}
            <code style={codeInlineStyle}>opncd.com/share/abc123</code>
          </li>
          <li>Changes sync automatically as you continue your conversation</li>
          <li>
            <code style={codeInlineStyle}>/unshare</code> completely removes all
            shared data
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#ccc",
          }}
        >
          Updating the plugin
        </h2>
        <p style={{ color: "#888", marginBottom: "16px", lineHeight: 1.6 }}>
          OpenCode caches plugins. To get the latest version, clear the cache:
        </p>
        <pre style={codeBlockStyle}>
          {`# macOS / Linux
rm -rf ~/.cache/opencode/node_modules/opencode-better-share

# Windows (PowerShell)
Remove-Item -Recurse -Force "$env:USERPROFILE\\.cache\\opencode\\node_modules\\opencode-better-share"`}
        </pre>
        <p style={{ color: "#666", fontSize: "0.875rem", marginTop: "12px" }}>
          Then restart OpenCode.
        </p>
      </section>

      <footer
        style={{
          marginTop: "80px",
          paddingTop: "24px",
          borderTop: "1px solid #222",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#555", fontSize: "0.875rem" }}>
          <a
            href="https://github.com/yourusername/opencode-better-share"
            style={{ color: "#666", textDecoration: "underline" }}
          >
            GitHub
          </a>
          <span style={{ margin: "0 12px" }}>·</span>
          <a
            href="https://www.npmjs.com/package/opencode-better-share"
            style={{ color: "#666", textDecoration: "underline" }}
          >
            npm
          </a>
        </p>
      </footer>
    </main>
  );
}

const codeBlockStyle: React.CSSProperties = {
  backgroundColor: "#111",
  padding: "16px",
  borderRadius: "8px",
  overflow: "auto",
  fontSize: "0.875rem",
  lineHeight: 1.5,
  border: "1px solid #222",
};

const codeInlineStyle: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  padding: "2px 6px",
  borderRadius: "4px",
  fontSize: "0.875rem",
};

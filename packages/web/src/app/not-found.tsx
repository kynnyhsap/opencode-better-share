export default function NotFound() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "4rem", marginBottom: "1rem", color: "#333" }}>404</h1>
      <p style={{ color: "#888" }}>Share not found</p>
      <a
        href="/"
        style={{
          marginTop: "2rem",
          color: "#666",
          textDecoration: "underline",
        }}
      >
        Go home
      </a>
    </main>
  );
}

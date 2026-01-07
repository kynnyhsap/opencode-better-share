import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenCode Share",
  description: "Share your OpenCode sessions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#0a0a0a",
          color: "#ededed",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        {children}
      </body>
    </html>
  );
}

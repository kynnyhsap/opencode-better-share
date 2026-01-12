"use client";

import { useEffect, useState } from "react";
import { ShareViewer } from "@/components";
import type { ShareData } from "@/lib/types";

interface SharePageClientProps {
  shareId: string;
  publicUrl: string;
}

export function SharePageClient({ shareId, publicUrl }: SharePageClientProps) {
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("fetching data from", publicUrl);
        const response = await fetch(publicUrl);
        console.log("response", response);

        if (!response.ok) {
          throw new Error("Share not found");
        }

        const shareData = await response.json();
        setData(shareData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load share");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [publicUrl]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#888",
        }}
      >
        Loading share...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#ededed",
          gap: "16px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Share not found</h1>
        <p style={{ margin: 0, color: "#888" }}>
          The share "{shareId}" does not exist or has been deleted.
        </p>
        <a
          href="/"
          style={{
            color: "#888",
            textDecoration: "underline",
            marginTop: "16px",
          }}
        >
          Go home
        </a>
      </div>
    );
  }

  return <ShareViewer data={data} />;
}

import { getShareData } from "@/lib/s3";
import { getShare } from "@/lib/db";
import { notFound } from "next/navigation";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;

  // Check if share exists in DB
  const share = getShare(id);

  if (!share) {
    notFound();
  }

  // Fetch data from R2
  const data = await getShareData(id);

  if (!data) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <header
        style={{
          marginBottom: "20px",
          paddingBottom: "20px",
          borderBottom: "1px solid #333",
        }}
      >
        <a
          href="/"
          style={{
            color: "#888",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          opncd.com
        </a>
        <span style={{ color: "#444", margin: "0 8px" }}>/</span>
        <span style={{ color: "#ccc" }}>{id}</span>
      </header>

      <pre
        style={{
          backgroundColor: "#111",
          padding: "20px",
          borderRadius: "8px",
          overflow: "auto",
          fontSize: "0.875rem",
          lineHeight: 1.5,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}

export async function generateMetadata({ params }: SharePageProps) {
  const { id } = await params;
  return {
    title: `Share ${id} | opncd.com`,
  };
}

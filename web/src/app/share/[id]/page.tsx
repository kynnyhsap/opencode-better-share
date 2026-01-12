import { notFound } from "next/navigation";
import { getShare } from "@/lib/db";
import { getPublicUrl } from "@/lib/s3";
import { SharePageClient } from "./SharePageClient";

// Force dynamic rendering (no prerendering at build time)
export const dynamic = "force-dynamic";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;

  // Check if share exists in DB (quick check, no data fetch)
  const share = await getShare(id);

  if (!share) {
    notFound();
  }

  // Get public URL for client-side fetching
  const publicUrl = getPublicUrl(id);

  console.log("publicUrl", publicUrl);

  return <SharePageClient shareId={id} publicUrl={publicUrl} />;
}

export async function generateMetadata({ params }: SharePageProps) {
  const { id } = await params;
  return {
    title: `Share ${id} | opncd.com`,
  };
}

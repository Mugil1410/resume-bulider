import { notFound } from "next/navigation";
import { getResume } from "@/lib/resume-service";
import { PrintView } from "@/components/PrintView";

export const dynamic = "force-dynamic";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resume = await getResume(id);
  if (!resume) notFound();
  return <PrintView id={resume.id} data={resume.data} />;
}

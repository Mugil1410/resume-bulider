import { notFound } from "next/navigation";
import { getResume } from "@/lib/resume-service";
import { Editor } from "@/components/editor/Editor";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ view?: string }> }) {
  const { id } = await params;
  const { view } = await searchParams;
  const resume = await getResume(id);
  if (!resume) notFound();
  return <Editor initial={resume} initialView={view === "preview" ? "preview" : "edit"} />;
}

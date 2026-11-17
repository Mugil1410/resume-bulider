import { sampleResume } from "@/lib/sample";
import { PaperPreview } from "@/components/resume/PaperPreview";
import { CreateActions } from "@/components/ResumeList";
import { TEMPLATE_NAME } from "@/lib/prompt";

export default function Templates() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Template</h1>
        <p className="text-zinc-600">{TEMPLATE_NAME}. Shown with the content from your uploaded resume.</p>
      </div>
      <CreateActions />
      <div className="rounded-2xl bg-zinc-200 p-3">
        <PaperPreview data={sampleResume()} />
      </div>
    </div>
  );
}

import { listResumes } from "@/lib/resume-service";
import { CreateActions, ResumeList } from "@/components/ResumeList";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const resumes = await listResumes();
  const recent = resumes.slice(0, 3);
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-black md:text-3xl">Your resumes</h1>
        <p className="mt-1 text-zinc-600">Build, edit and download your resume as an A4 PDF.</p>
      </section>
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-zinc-200">
          <div className="text-3xl font-black text-[var(--accent)]">{resumes.length}</div>
          <div className="text-sm text-zinc-600">Total resumes</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-zinc-200">
          <div className="truncate text-base font-bold">{resumes[0] ? formatDate(resumes[0].updatedAt) : "—"}</div>
          <div className="text-sm text-zinc-600">Last edited</div>
        </div>
      </section>
      <CreateActions />
      <section>
        <h2 className="mb-3 text-lg font-bold">Recently edited</h2>
        <ResumeList items={recent} searchable={false} />
      </section>
    </div>
  );
}

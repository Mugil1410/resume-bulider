import { listResumes } from "@/lib/resume-service";
import { CreateActions, ResumeList } from "@/components/ResumeList";

export const dynamic = "force-dynamic";

export default async function MyResumes() {
  const resumes = await listResumes();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black">My Resumes</h1>
      <CreateActions />
      <ResumeList items={resumes} />
    </div>
  );
}

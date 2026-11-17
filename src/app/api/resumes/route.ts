import { NextRequest } from "next/server";
import { createResumeSchema } from "@/lib/validation";
import { createResume, listResumes } from "@/lib/resume-service";
import { emptyResume } from "@/lib/types";
import { sampleResume } from "@/lib/sample";
import { handleError, isSameOrigin, json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return json({ resumes: await listResumes() });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  try {
    const body = createResumeSchema.parse(await req.json());
    const data = body.data ?? (body.useSample ? sampleResume() : emptyResume());
    return json({ resume: await createResume(body.name, data) }, 201);
  } catch (e) {
    return handleError(e);
  }
}

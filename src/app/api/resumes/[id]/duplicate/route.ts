import { NextRequest } from "next/server";
import { duplicateResume } from "@/lib/resume-service";
import { handleError, isSameOrigin, json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  try {
    const { id } = await ctx.params;
    const r = await duplicateResume(id);
    return r ? json({ resume: { id: r.id, name: r.name } }, 201) : json({ error: "Not found" }, 404);
  } catch (e) {
    return handleError(e);
  }
}

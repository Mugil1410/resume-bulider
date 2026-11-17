import { NextRequest } from "next/server";
import { updateResumeSchema } from "@/lib/validation";
import { deleteResume, getResume, saveResume } from "@/lib/resume-service";
import { handleError, isSameOrigin, json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const r = await getResume(id);
    return r ? json({ resume: r }) : json({ error: "Not found" }, 404);
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  try {
    const { id } = await ctx.params;
    const body = updateResumeSchema.parse(await req.json());
    const r = await saveResume(id, body);
    return r ? json({ resume: { id: r.id, name: r.name, updatedAt: r.updatedAt } }) : json({ error: "Not found" }, 404);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  try {
    const { id } = await ctx.params;
    return (await deleteResume(id)) ? json({ ok: true }) : json({ error: "Not found" }, 404);
  } catch (e) {
    return handleError(e);
  }
}

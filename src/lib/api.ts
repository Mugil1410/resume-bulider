import { NextRequest } from "next/server";
import { ZodError } from "zod";

export const json = (body: unknown, status = 200) => Response.json(body, { status });

// No login in this app, so block cross-site browser requests to mutating endpoints.
export function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser / same-origin GET-style fetches
  return origin === req.nextUrl.origin;
}

export function handleError(e: unknown) {
  if (e instanceof ZodError) {
    return json({ error: "Invalid input", issues: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, 400);
  }
  if (e instanceof SyntaxError) return json({ error: "Invalid JSON" }, 400);
  console.error(e);
  return json({ error: "Server error" }, 500);
}

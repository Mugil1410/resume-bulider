/** Makes a string safe to use as a file name. */
export const fileSafe = (s: string) =>
  s
    .trim()
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "resume";

export function formatDate(iso: string) {
  try {
    // Fixed locale + UTC so server and browser render identical text (avoids hydration mismatch).
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  } catch {
    return iso;
  }
}

/** fetch wrapper that throws a readable Error for non-2xx responses. */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
  return body as T;
}

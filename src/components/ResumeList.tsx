"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Copy, Download, Eye, FilePlus2, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { ResumeListItem } from "@/lib/types";
import { api, formatDate } from "@/lib/utils";
import { TEMPLATE_NAME } from "@/lib/prompt";
import { Btn } from "./ui";

export function CreateActions() {
  const router = useRouter();
  const [busy, setBusy] = useState<"blank" | "sample" | null>(null);
  const [err, setErr] = useState("");

  async function create(kind: "blank" | "sample") {
    setBusy(kind);
    setErr("");
    try {
      const r = await api<{ resume: { id: string } }>("/api/resumes", {
        method: "POST",
        body: JSON.stringify({ name: kind === "sample" ? "Sample Resume" : "Untitled Resume", useSample: kind === "sample" }),
      });
      router.push(`/resumes/${r.resume.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create resume");
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Btn variant="primary" className="min-h-12 text-base" disabled={!!busy} onClick={() => create("blank")}>
          {busy === "blank" ? <Loader2 className="animate-spin" size={18} /> : <FilePlus2 size={18} />} Create New Resume
        </Btn>
        <Btn className="min-h-12 text-base" disabled={!!busy} onClick={() => create("sample")}>
          {busy === "sample" ? <Loader2 className="animate-spin" size={18} /> : <Copy size={18} />} Start from sample
        </Btn>
        <Link href="/import" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-base font-semibold hover:bg-zinc-50">
          Upload Existing Resume
        </Link>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}

function Card({ r, onChanged }: { r: ResumeListItem; onChanged: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(kind: "dup" | "del") {
    if (kind === "del" && !window.confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    setBusy(kind);
    try {
      if (kind === "dup") await api(`/api/resumes/${r.id}/duplicate`, { method: "POST" });
      else await api(`/api/resumes/${r.id}`, { method: "DELETE" });
      onChanged();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const link = "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white text-sm font-semibold hover:bg-zinc-50 active:bg-zinc-100";
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <h3 className="truncate text-base font-bold">{r.name}</h3>
        <p className="truncate text-sm text-zinc-600">{[r.fullName, r.title].filter(Boolean).join(" · ") || "No details yet"}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {TEMPLATE_NAME.split(" (")[0]} · Edited {formatDate(r.updatedAt)}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Link href={`/resumes/${r.id}`} className={`${link} bg-[var(--accent)] text-white hover:bg-[var(--accent)]`} style={{ background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }}>
          <Pencil size={16} /> Edit
        </Link>
        <Link href={`/resumes/${r.id}?view=preview`} className={link}><Eye size={16} /> Preview</Link>
        <button className={link} disabled={!!busy} onClick={() => act("dup")}>
          {busy === "dup" ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />} Duplicate
        </button>
        <button className={link} onClick={() => router.push(`/resumes/${r.id}/print`)}><Download size={16} /> PDF</button>
        <button className={`${link} col-span-2 text-red-600 sm:col-span-1`} disabled={!!busy} onClick={() => act("del")}>
          {busy === "del" ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
        </button>
      </div>
    </li>
  );
}

export function ResumeList({ items, searchable = true }: { items: ResumeListItem[]; searchable?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"recent" | "oldest" | "name">("recent");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const f = items.filter((r) => !needle || `${r.name} ${r.fullName} ${r.title}`.toLowerCase().includes(needle));
    return [...f].sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : sort === "oldest" ? +new Date(a.updatedAt) - +new Date(b.updatedAt) : +new Date(b.updatedAt) - +new Date(a.updatedAt),
    );
  }, [items, q, sort]);

  return (
    <div>
      {searchable && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search resumes</span>
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search resumes"
              className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-3"
            />
          </label>
          <label>
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 sm:w-auto">
              <option value="recent">Recently edited</option>
              <option value="oldest">Oldest edited</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </label>
        </div>
      )}
      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
          {items.length === 0 ? "No resumes yet. Create one above." : "No resumes match your search."}
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => (
            <Card key={r.id} r={r} onChanged={() => router.refresh()} />
          ))}
        </ul>
      )}
    </div>
  );
}

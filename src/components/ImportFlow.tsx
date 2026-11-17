"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileUp, Loader2 } from "lucide-react";
import { ResumeData } from "@/lib/types";
import { extractPdfLines, parseResumeLines, validatePdfFile } from "@/lib/pdf-parse";
import { api } from "@/lib/utils";
import { ResumeForm } from "./editor/ResumeForm";
import { PaperPreview } from "./resume/PaperPreview";
import { Btn, Field } from "./ui";

function readWithProgress(file: File, onPct: (n: number) => void): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onprogress = (e) => e.lengthComputable && onPct(Math.round((e.loaded / e.total) * 50));
    fr.onload = () => resolve(fr.result as ArrayBuffer);
    fr.onerror = () => reject(new Error("Could not read that file."));
    fr.readAsArrayBuffer(file);
  });
}

export function ImportFlow() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [data, setData] = useState<ResumeData | null>(null);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [name, setName] = useState("Imported Resume");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  async function onFile(file: File) {
    setErr("");
    const problem = validatePdfFile(file);
    if (problem) return setErr(problem);
    try {
      setPct(0);
      const buf = await readWithProgress(file, setPct);
      const lines = await extractPdfLines(buf, (n) => setPct(50 + Math.round(n / 2)));
      if (lines.length < 3) throw new Error("No readable text found. Scanned/image-only PDFs are not supported.");
      const r = parseResumeLines(lines);
      setData(r.data);
      setUnmatched(r.unmatched);
      setName(r.data.personal.fullName ? `${r.data.personal.fullName} – Imported` : "Imported Resume");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not read this PDF.");
    } finally {
      setPct(null);
    }
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    setErr("");
    try {
      const r = await api<{ resume: { id: string } }>("/api/resumes", { method: "POST", body: JSON.stringify({ name: name.trim() || "Imported Resume", data }) });
      router.push(`/resumes/${r.resume.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black">Upload existing resume</h1>
        <p className="text-zinc-600">Choose a text-based PDF (max 5 MB). It is read on your device, then you review everything before saving.</p>
        <input
          ref={input}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void onFile(f);
          }}
        />
        <button
          type="button"
          disabled={pct !== null}
          onClick={() => input.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--accent)]/50 bg-white p-10 text-center active:bg-zinc-50 disabled:opacity-60"
        >
          {pct === null ? <FileUp size={36} className="text-[var(--accent)]" /> : <Loader2 size={36} className="animate-spin text-[var(--accent)]" />}
          <span className="text-base font-bold">{pct === null ? "Choose PDF" : `Reading… ${pct}%`}</span>
          <span className="text-sm text-zinc-500">From your phone storage, Files app or computer</span>
        </button>
        {pct !== null && (
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}
        {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <h1 className="text-2xl font-black">Review imported resume</h1>
      <p className="text-zinc-600">Check each section, fix anything that is wrong, then save.</p>

      {unmatched.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2 font-bold text-amber-900"><AlertTriangle size={18} /> Could not place this content</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
            {unmatched.map((u, i) => <li key={i}>{u}</li>)}
          </ul>
          <p className="mt-2 text-xs text-amber-800">Add it manually to the right section below if you want to keep it.</p>
        </div>
      )}

      <Field label="Resume name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />

      <div className="grid grid-cols-2 gap-1 lg:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button key={v} onClick={() => setTab(v)} aria-pressed={tab === v} className={`min-h-11 rounded-xl text-sm font-semibold ${tab === v ? "bg-[var(--accent)] text-white" : "bg-zinc-100"}`}>
            {v === "edit" ? "Review fields" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={tab === "edit" ? "block" : "hidden lg:block"}>
          <ResumeForm data={data} update={(fn) => setData((d) => (d ? fn(d) : d))} />
        </div>
        <div className={`${tab === "preview" ? "block" : "hidden lg:block"} rounded-xl bg-zinc-200 p-3`}>
          <PaperPreview data={data} />
        </div>
      </div>

      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}

      <div className="safe-bottom fixed inset-x-0 bottom-16 z-30 border-t border-zinc-200 bg-white p-3 md:bottom-0">
        <div className="mx-auto flex max-w-5xl gap-2">
          <Btn className="flex-1" onClick={() => { setData(null); setUnmatched([]); }}>Cancel</Btn>
          <Btn variant="primary" className="flex-[2]" disabled={saving} onClick={save}>
            {saving && <Loader2 size={16} className="animate-spin" />} Save resume
          </Btn>
        </div>
      </div>
    </div>
  );
}

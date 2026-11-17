"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Check, Copy, Download, Eye, Loader2, Maximize2, Minus, Pencil, Plus, Sparkles, X } from "lucide-react";
import { ResumeData, ResumeRecord } from "@/lib/types";
import { api } from "@/lib/utils";
import { PaperPreview } from "../resume/PaperPreview";
import { PromptSheet } from "../PromptSheet";
import { Btn, IconBtn } from "../ui";
import { ResumeForm } from "./ResumeForm";

type SaveState = "saved" | "dirty" | "saving" | "error";

export function Editor({ initial, initialView = "edit" }: { initial: ResumeRecord; initialView?: "edit" | "preview" }) {
  const router = useRouter();
  const [data, setData] = useState<ResumeData>(initial.data);
  const [name, setName] = useState(initial.name);
  const [view, setView] = useState<"edit" | "preview">(initialView);
  const [full, setFull] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [prompt, setPrompt] = useState(false);
  const [save, setSave] = useState<SaveState>("saved");
  const [err, setErr] = useState("");

  const latest = useRef({ data, name });
  const dirty = useRef(false);
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async (): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    if (inFlight.current) {
      // another save is running; it will re-run itself if more changes arrived
      return new Promise((resolve) => {
        const t = setInterval(() => {
          if (!inFlight.current) {
            clearInterval(t);
            resolve(!dirty.current);
          }
        }, 100);
      });
    }
    if (!dirty.current) return true;
    inFlight.current = true;
    setSave("saving");
    let ok = true;
    while (dirty.current) {
      dirty.current = false;
      const snap = latest.current;
      try {
        await api(`/api/resumes/${initial.id}`, { method: "PUT", body: JSON.stringify({ name: snap.name.trim() || "Untitled", data: snap.data }) });
        setErr("");
      } catch (e) {
        dirty.current = true;
        ok = false;
        setErr(e instanceof Error ? e.message : "Could not save");
        break;
      }
    }
    inFlight.current = false;
    setSave(ok ? (dirty.current ? "dirty" : "saved") : "error");
    return ok;
  }, [initial.id]);

  const schedule = useCallback(() => {
    dirty.current = true;
    setSave("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 900);
  }, [flush]);

  const update = useCallback(
    (fn: (d: ResumeData) => ResumeData) => {
      setData((d) => {
        const next = fn(d);
        latest.current = { ...latest.current, data: next };
        return next;
      });
      schedule();
    },
    [schedule],
  );

  // Save when the tab is hidden / page is left so nothing is lost on mobile.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && dirty.current) void flush();
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        void flush();
        e.preventDefault();
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [flush]);

  async function download() {
    if (await flush()) router.push(`/resumes/${initial.id}/print`);
    else window.alert("Could not save your latest changes. Fix the connection and try again.");
  }

  async function duplicate() {
    if (!(await flush())) return;
    try {
      const r = await api<{ resume: { id: string } }>(`/api/resumes/${initial.id}/duplicate`, { method: "POST" });
      router.push(`/resumes/${r.resume.id}`);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not duplicate");
    }
  }

  const status =
    save === "saving" ? (
      <span className="flex items-center gap-1 text-zinc-500"><Loader2 size={14} className="animate-spin" /> Saving…</span>
    ) : save === "dirty" ? (
      <span className="text-zinc-500">Unsaved changes…</span>
    ) : save === "error" ? (
      <button onClick={() => void flush()} className="flex items-center gap-1 font-semibold text-red-600" title={err}>
        <AlertCircle size={14} /> Save failed – tap to retry
      </button>
    ) : (
      <span className="flex items-center gap-1 text-emerald-600"><Check size={14} /> Saved</span>
    );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 px-2 py-2">
          <Link href="/resumes" aria-label="Back to my resumes" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-zinc-100" onClick={() => void flush()}>
            <ArrowLeft size={22} />
          </Link>
          <div className="min-w-0 flex-1">
            <input
              aria-label="Resume name"
              value={name}
              maxLength={120}
              onChange={(e) => {
                setName(e.target.value);
                latest.current = { ...latest.current, name: e.target.value };
                schedule();
              }}
              className="w-full truncate rounded-lg bg-transparent px-1 text-base font-bold outline-none focus:bg-zinc-100"
            />
            <div className="px-1 text-xs" aria-live="polite">{status}</div>
          </div>
          <IconBtn label="AI improvement prompt" onClick={() => setPrompt(true)}><Sparkles size={20} className="text-[var(--accent)]" /></IconBtn>
          <IconBtn label="Duplicate resume" onClick={duplicate}><Copy size={20} /></IconBtn>
          <Btn variant="primary" onClick={download} className="px-3"><Download size={18} /><span className="hidden sm:inline">Download PDF</span></Btn>
        </div>
        {/* Editor / Preview toggle: mobile + tablet only */}
        <div className="mx-auto grid max-w-md grid-cols-2 gap-1 px-3 pb-2 lg:hidden">
          {(["edit", "preview"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${view === v ? "bg-[var(--accent)] text-white" : "bg-zinc-100 text-zinc-700"}`}
            >
              {v === "edit" ? <Pencil size={16} /> : <Eye size={16} />}
              {v === "edit" ? "Editor" : "Preview"}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1500px] flex-1 gap-4 p-3 lg:grid-cols-[minmax(380px,520px)_1fr]">
        <div className={view === "edit" ? "block" : "hidden lg:block"}>
          <div className="mb-3">
            <Btn variant="secondary" className="w-full border-[var(--accent)] text-[var(--accent)]" onClick={() => setPrompt(true)}>
            <Sparkles size={18} /> Generate AI Improvement Prompt
          </Btn>
          </div>
          <ResumeForm data={data} update={update} />
          <div className="h-8" />
        </div>
        <div className={`${view === "preview" ? "block" : "hidden lg:block"} min-w-0`}>
          <div className="lg:sticky lg:top-[72px]">
            <div className="mb-2 flex justify-end gap-2">
              <Btn variant="secondary" onClick={() => setPrompt(true)}><Sparkles size={16} /> Get AI Prompt</Btn>
              <Btn variant="secondary" onClick={() => setFull(true)}><Maximize2 size={16} /> Full screen</Btn>
            </div>
            <div className="lg:max-h-[calc(100dvh-140px)] lg:overflow-auto lg:rounded-xl lg:bg-zinc-200 lg:p-3">
              <PaperPreview data={data} />
            </div>
          </div>
        </div>
      </main>

      {full && (
        <div role="dialog" aria-modal="true" aria-label="Full screen preview" className="fixed inset-0 z-50 flex flex-col bg-zinc-200">
          <div className="flex items-center gap-2 bg-white p-2">
            <div className="flex-1 truncate px-2 font-bold">{name}</div>
            <IconBtn label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}><Minus size={20} /></IconBtn>
            <span className="w-12 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
            <IconBtn label="Zoom in" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}><Plus size={20} /></IconBtn>
            <IconBtn label="Close preview" onClick={() => { setFull(false); setZoom(1); }}><X size={22} /></IconBtn>
          </div>
          {/* pinch-zoom stays enabled on this surface */}
          <div className="flex-1 overflow-auto p-3" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
            <div style={{ width: `${zoom * 100}%`, minWidth: "100%" }}>
              <PaperPreview data={data} zoom={1} />
            </div>
          </div>
        </div>
      )}

      {prompt && <PromptSheet data={data} onClose={() => setPrompt(false)} />}
    </div>
  );
}

"use client";
import { useMemo, useState } from "react";
import { Check, Copy, Download, Sparkles, X } from "lucide-react";
import { ResumeData } from "@/lib/types";
import { buildAiPrompt, TEMPLATE_NAME } from "@/lib/prompt";
import { Btn } from "./ui";
import { fileSafe } from "@/lib/utils";

/** Full-screen prompt viewer: view, copy and download the AI improvement prompt. */
export function PromptSheet({ data, onClose }: { data: ResumeData; onClose: () => void }) {
  const prompt = useMemo(() => buildAiPrompt(data), [data]);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied("ok");
    } catch {
      // Fallback for browsers/contexts without the async clipboard API (older iOS, http)
      const ta = document.createElement("textarea");
      ta.value = prompt;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      setCopied(ok ? "ok" : "fail");
    }
    setTimeout(() => setCopied(null), 2500);
  }

  function download() {
    const blob = new Blob([prompt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileSafe(data.personal.fullName || "resume")}-ai-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="AI improvement prompt" className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2">
        <Sparkles size={20} className="text-[var(--accent)]" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">AI improvement prompt</div>
          <div className="truncate text-xs text-zinc-500">{TEMPLATE_NAME}</div>
        </div>
        <button aria-label="Close" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-100">
          <X size={22} />
        </button>
      </div>
      <textarea
        readOnly
        value={prompt}
        aria-label="Full prompt"
        className="min-h-0 flex-1 resize-none p-4 font-mono text-[13px] leading-relaxed outline-none"
      />
      <div className="safe-bottom border-t border-zinc-200 bg-white p-3">
        {copied === "fail" && <p className="mb-2 text-sm text-red-600">Copy was blocked. Select the text above and copy it manually.</p>}
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="primary" onClick={copy} className="min-h-12 text-base">
            {copied === "ok" ? <Check size={18} /> : <Copy size={18} />}
            {copied === "ok" ? "Copied!" : "Copy Prompt"}
          </Btn>
          <Btn onClick={download} className="min-h-12 text-base">
            <Download size={18} /> Download TXT
          </Btn>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-500">Paste into Claude, ChatGPT or any AI tool. Add your target job role where marked.</p>
      </div>
    </div>
  );
}

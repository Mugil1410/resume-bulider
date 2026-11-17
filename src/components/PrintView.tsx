"use client";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { ResumeData } from "@/lib/types";
import { fileSafe } from "@/lib/utils";
import { PaperPreview } from "./resume/PaperPreview";
import { ResumeTemplate } from "./resume/ResumeTemplate";
import { useFitZoom } from "./resume/useFitZoom";
import { Btn } from "./ui";

/** A4 print view. "Save as PDF" in the print dialog produces the downloadable file. */
export function PrintView({ id, data }: { id: string; data: ResumeData }) {
  const { zoom, measure } = useFitZoom(data);
  const filename = `${fileSafe(data.personal.fullName || "resume")}_Resume`;

  useEffect(() => {
    const prev = document.title;
    document.title = filename; // browsers use the page title as the default PDF file name
    // Desktop: open the print dialog right away. On phones the user taps the button.
    let t: ReturnType<typeof setTimeout> | undefined;
    if (window.matchMedia("(pointer: fine)").matches) {
      t = setTimeout(() => void document.fonts.ready.then(() => window.print()), 600);
    }
    return () => {
      document.title = prev;
      if (t) clearTimeout(t);
    };
  }, [filename]);

  return (
    <div className="min-h-dvh bg-zinc-200 print:bg-white">
      {measure}
      <div className="no-print sticky top-0 z-10 border-b border-zinc-200 bg-white p-2">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <Link href={`/resumes/${id}`} aria-label="Back to editor" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-100">
            <ArrowLeft size={22} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{filename}.pdf</div>
            <div className="text-xs text-zinc-500">Choose “Save as PDF” in the print dialog. Headers and footers are left out.</div>
          </div>
          <Btn variant="primary" onClick={() => window.print()}><Download size={18} /> Download PDF</Btn>
        </div>
      </div>
      <div className="no-print mx-auto max-w-[900px] p-3">
        <PaperPreview data={data} />
      </div>
      {/* Print-only copy. @page margin is 0 so the browser prints no header/footer;
          the repeating thead/tfoot spacers give every page its 10mm top/bottom margin. */}
      <table className="hidden w-full print:table" style={{ borderCollapse: "collapse" }}>
        <thead><tr><td style={{ height: "10mm", padding: 0 }} /></tr></thead>
        <tbody>
          <tr><td style={{ padding: "0 14mm", verticalAlign: "top" }}><div style={{ zoom }}><ResumeTemplate data={data} /></div></td></tr>
        </tbody>
        <tfoot><tr><td style={{ height: "10mm", padding: 0 }} /></tr></tfoot>
      </table>
    </div>
  );
}

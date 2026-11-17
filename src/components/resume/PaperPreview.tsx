"use client";
import { useEffect, useRef, useState } from "react";
import { ResumeData } from "@/lib/types";
import { ResumeTemplate } from "./ResumeTemplate";
import { A4_H, A4_W, MX, MY, PAGE_CONTENT, useFitZoom } from "./useFitZoom";


/** A4 paper that scales to fit its container width, with page-break guides. */
export function PaperPreview({ data, zoom = 1 }: { data: ResumeData; zoom?: number }) {
  const { zoom: fit, measure } = useFitZoom(data);
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const [height, setHeight] = useState(A4_H);

  useEffect(() => {
    const w = wrap.current;
    const i = inner.current;
    if (!w || !i) return;
    const measure = () => {
      setScale(Math.max(0.2, (w.clientWidth / A4_W) * zoom));
      setHeight(i.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(w);
    ro.observe(i);
    return () => ro.disconnect();
  }, [zoom]);

  const pages = Math.max(1, Math.ceil((height - MY * 2) / PAGE_CONTENT));
  const paperH = MY * 2 + pages * PAGE_CONTENT;

  return (
    <div ref={wrap} className="relative w-full">
      {measure}
      <div style={{ width: A4_W * scale, height: Math.max(paperH, height) * scale }} className="print-wrap relative mx-auto">
        <div
          ref={inner}
          className="print-paper absolute left-0 top-0 origin-top-left bg-white shadow-[0_2px_16px_rgba(0,0,0,0.15)]"
          style={{ width: A4_W, minHeight: paperH, padding: `${MY}px ${MX}px`, transform: `scale(${scale})` }}
        >
          <div style={{ zoom: fit }}><ResumeTemplate data={data} /></div>
          {Array.from({ length: pages - 1 }, (_, k) => (
            <div
              key={k}
              aria-hidden
              className="no-print pointer-events-none absolute left-0 right-0 border-t border-dashed border-zinc-300"
              style={{ top: MY + PAGE_CONTENT * (k + 1) }}
            >
              <span className="absolute right-2 top-1 text-[11px] text-zinc-400">Page {k + 2}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

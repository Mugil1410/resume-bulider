"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { ResumeData } from "@/lib/types";
import { ResumeTemplate } from "./ResumeTemplate";

export const A4_W = 794; // 210mm @ 96dpi
export const A4_H = 1123; // 297mm @ 96dpi
export const MX = 53; // 14mm side margin
export const MY = 38; // 10mm top/bottom margin
export const PAGE_CONTENT = A4_H - MY * 2;
const MIN_FIT = 0.8;

/**
 * If the content is only slightly taller than one page, returns a zoom (<1) that makes it fit on one page.
 * Content that needs more than the minimum shrink flows onto extra pages instead.
 * The unzoomed content is measured in a hidden node (returned as `measure`), so there is no feedback loop.
 */
export function useFitZoom(data: ResumeData) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = () => {
      const h = el.offsetHeight;
      const z = h > PAGE_CONTENT ? Math.max(MIN_FIT, Math.floor((PAGE_CONTENT / h) * 0.97 * 100) / 100) : 1;
      setZoom(z);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    void document.fonts?.ready.then(calc);
    return () => ro.disconnect();
  }, [data]);

  const measure = (
    <div
      ref={ref}
      aria-hidden
      style={{ position: "absolute", left: -99999, top: 0, visibility: "hidden", pointerEvents: "none", width: A4_W - MX * 2 }}
    >
      <ResumeTemplate data={data} />
    </div>
  );
  return { zoom, measure };
}

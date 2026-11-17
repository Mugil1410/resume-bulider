import { readFileSync } from "node:fs";
import { extractPdfLines, parseResumeLines } from "../src/lib/pdf-parse.ts";
const buf = readFileSync(process.argv[2]);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
const lines = await extractPdfLines(ab, undefined, async () => (await import("pdfjs-dist/legacy/build/pdf.mjs")) as any);
if (process.argv[3] === "lines") for (const l of lines) console.log(JSON.stringify(l.chunks));
const r = parseResumeLines(lines);
const d = r.data;
console.log(JSON.stringify({ personal: d.personal, summaryLen: d.summary.length,
  exp: d.experiences.map(e => ({ t: e.jobTitle, c: e.company, loc: e.location, s: e.startDate, e: e.endDate, cur: e.isCurrent, n: e.responsibilities.length })),
  edu: d.education.map(e => [e.degree, e.institution, e.startDate, e.endDate]),
  skills: d.skills.length, cats: [...new Set(d.skills.map(s => s.category))],
  certs: d.certifications.map(c => [c.name, c.issuer]), additional: d.additional.length, unmatched: r.unmatched }, null, 1));

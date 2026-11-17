import { ResumeData, emptyResume, uid } from "./types";

export interface PdfLine {
  /** text pieces separated by a visible horizontal gap (columns, right-aligned dates) */
  chunks: string[];
  text: string;
}

export interface ParseResult {
  data: ResumeData;
  /** Content we could not confidently map. Shown to the user for manual review. */
  unmatched: string[];
}

const MAX_BYTES = 5 * 1024 * 1024;

export function validatePdfFile(file: File): string | null {
  if (file.type && file.type !== "application/pdf") return "Please choose a PDF file.";
  if (!/\.pdf$/i.test(file.name)) return "The file name must end in .pdf.";
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_BYTES) return "PDF is larger than 5 MB.";
  return null;
}

/** Extracts positioned text from a PDF (runs in the browser or Node). */
export async function extractPdfLines(
  buffer: ArrayBuffer,
  onProgress?: (pct: number) => void,
  loadPdfjs?: () => Promise<typeof import("pdfjs-dist")>,
): Promise<PdfLine[]> {
  const head = new TextDecoder().decode(new Uint8Array(buffer.slice(0, 5)));
  if (head !== "%PDF-") throw new Error("This file is not a valid PDF.");

  const pdfjs = loadPdfjs ? await loadPdfjs() : await loadBrowserPdfjs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const lines: PdfLine[] = [];

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    type Item = { str: string; x: number; y: number; w: number };
    const items: Item[] = [];
    for (const it of content.items) {
      if (!("str" in it) || !it.str.trim()) continue;
      items.push({ str: it.str, x: it.transform[4], y: it.transform[5], w: it.width });
    }
    // group by baseline (3pt tolerance), top to bottom
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    const rows: Item[][] = [];
    for (const it of items) {
      const row = rows.find((r) => Math.abs(r[0].y - it.y) < 3);
      if (row) row.push(it);
      else rows.push([it]);
    }
    for (const row of rows) {
      row.sort((a, b) => a.x - b.x);
      const chunks: string[] = [];
      let prevEnd = -Infinity;
      for (const it of row) {
        const gap = it.x - prevEnd;
        if (chunks.length && gap < 20) chunks[chunks.length - 1] += (gap > 1.5 ? " " : "") + it.str;
        else chunks.push(it.str);
        prevEnd = it.x + it.w;
      }
      const clean = chunks.map((c) => c.replace(/\s+/g, " ").trim()).filter(Boolean);
      if (clean.length) lines.push({ chunks: clean, text: clean.join(" ") });
    }
    onProgress?.(Math.round((n / doc.numPages) * 100));
  }
  return lines;
}

async function loadBrowserPdfjs() {
  // legacy build keeps older Safari / iOS versions working
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs as unknown as typeof import("pdfjs-dist");
}

// ---------------------------------------------------------------- parsing

type SectionKey = "summary" | "skills" | "experience" | "education" | "projects" | "certifications" | "other";

const SECTION_NAMES: Record<string, SectionKey> = {
  "professional summary": "summary",
  summary: "summary",
  profile: "summary",
  "professional profile": "summary",
  objective: "summary",
  "career objective": "summary",
  about: "summary",
  "about me": "summary",
  skills: "skills",
  "technical skills": "skills",
  "key skills": "skills",
  "core skills": "skills",
  "professional experience": "experience",
  experience: "experience",
  "work experience": "experience",
  "work history": "experience",
  employment: "experience",
  "employment history": "experience",
  education: "education",
  "academic background": "education",
  qualifications: "education",
  projects: "projects",
  "personal projects": "projects",
  "academic projects": "projects",
  certifications: "certifications",
  certificates: "certifications",
  licenses: "certifications",
  "licenses and certifications": "certifications",
};

const OTHER_HEADINGS =
  /^(achievements?|awards?|honou?rs|languages?|volunteer(ing)?( experience)?|publications?|hobbies|interests|references|declaration|extracurricular.*|activities)$/i;

const BULLET = /^[•●▪■◦‣∙·▸►•-]\s*/;
const MONTH = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?";
const DATE = `(?:${MONTH}\\s+\\d{4}|\\d{1,2}/\\d{4}|\\d{4})`;
const DATE_RANGE = new RegExp(`(${DATE})\\s*(?:[–—-]|to)\\s*(${DATE}|Present|Current|Now|Ongoing)\\s*$`, "i");
const SINGLE_DATE = new RegExp(`(${DATE})\\s*$`, "i");

function headingKey(l: PdfLine): SectionKey | null {
  if (l.chunks.length > 1) return null;
  const t = l.text.replace(/[:\s]+$/, "").toLowerCase();
  if (t.length > 40) return null;
  return SECTION_NAMES[t] ?? (OTHER_HEADINGS.test(t) ? "other" : null);
}

function splitDates(l: PdfLine): { left: string; start: string; end: string; current: boolean } {
  // Prefer a right-aligned chunk, else a date range at the end of the text.
  const last = l.chunks[l.chunks.length - 1];
  const target = l.chunks.length > 1 && DATE_RANGE.test(last) ? last : l.text;
  const m = DATE_RANGE.exec(target);
  if (m) {
    const left = (target === last && l.chunks.length > 1 ? l.chunks.slice(0, -1).join(" ") : l.text.slice(0, m.index)).trim();
    return { left, start: m[1], end: /present|current|now|ongoing/i.test(m[2]) ? "" : m[2], current: /present|current|now|ongoing/i.test(m[2]) };
  }
  const s = SINGLE_DATE.exec(target);
  if (s && l.chunks.length > 1) return { left: l.chunks.slice(0, -1).join(" ").trim(), start: s[1], end: "", current: false };
  return { left: l.text, start: "", end: "", current: false };
}

const hasDate = (l: PdfLine) => DATE_RANGE.test(l.text);

export function parseResumeLines(lines: PdfLine[]): ParseResult {
  const data = emptyResume();
  const unmatched: string[] = [];

  // 1. split into sections
  const head: PdfLine[] = [];
  const sections: { key: SectionKey; title: string; lines: PdfLine[] }[] = [];
  for (const l of lines) {
    const k = headingKey(l);
    if (k) sections.push({ key: k, title: l.text.replace(/[:\s]+$/, ""), lines: [] });
    else if (sections.length) sections[sections.length - 1].lines.push(l);
    else head.push(l);
  }

  // 2. header: name, title (2nd line), contacts
  const p = data.personal;
  if (head[0]) p.fullName = head[0].text;
  const second = head[1];
  const secondIsContact = second && /@|linkedin\.com|github\.com|^\+?[\d\s().-]{8,}$/i.test(second.text);
  if (second && !secondIsContact) p.title = second.text;
  const rest = head.slice(secondIsContact ? 1 : 2).flatMap((l) => l.chunks.flatMap((c) => c.split(/\s*\|\s*/)));
  for (const tok of rest.map((t) => t.trim()).filter(Boolean)) {
    if (/@/.test(tok) && !p.email) p.email = tok.match(/[^\s|]+@[^\s|]+/)?.[0] ?? tok;
    else if (/linkedin\.com/i.test(tok) && !p.linkedin) p.linkedin = tok;
    else if (/github\.com/i.test(tok) && !p.github) p.github = tok;
    else if (/^\+?[\d\s().-]{8,}$/.test(tok) && !p.phone) p.phone = tok;
    else if (/^(https?:\/\/|www\.)/i.test(tok) && !p.portfolio) p.portfolio = tok;
    else if (!p.location && /^[A-Za-z .,'-]{2,60}$/.test(tok)) p.location = tok;
    else unmatched.push(`Header: ${tok}`);
  }

  // 3. sections
  for (const s of sections) {
    switch (s.key) {
      case "summary":
        data.summary = [data.summary, ...s.lines.map((l) => l.text)].filter(Boolean).join(" ");
        break;
      case "skills":
        parseSkills(s.lines, data, unmatched);
        break;
      case "experience":
        parseExperience(s.lines, data, unmatched);
        break;
      case "education":
        parseEducation(s.lines, data, unmatched);
        break;
      case "projects":
        parseProjects(s.lines, data);
        break;
      case "certifications":
        parseCerts(s.lines, data);
        break;
      default: {
        const items = joinBullets(s.lines);
        if (items.length) {
          const kind = /achiev/i.test(s.title) ? "achievements" : /award|honou?r/i.test(s.title) ? "awards" : /language/i.test(s.title) ? "languages" : /volunteer/i.test(s.title) ? "volunteer" : /publication/i.test(s.title) ? "publications" : /hobb|interest/i.test(s.title) ? "hobbies" : "custom";
          data.additional.push({ id: uid(), kind, title: s.title, items });
        }
      }
    }
  }
  return { data, unmatched };
}

/** Joins wrapped bullet lines into whole bullet strings. Non-bullet text becomes its own item. */
function joinBullets(lines: PdfLine[]): string[] {
  const items: string[] = [];
  let open = false;
  for (const l of lines) {
    if (BULLET.test(l.text)) {
      items.push(l.text.replace(BULLET, "").trim());
      open = true;
    } else if (open && items.length) {
      items[items.length - 1] += " " + l.text;
    } else {
      items.push(l.text);
    }
  }
  return items.filter(Boolean);
}

function parseSkills(lines: PdfLine[], data: ResumeData, unmatched: string[]) {
  for (const t of joinBullets(lines)) {
    const m = /^([^:]{2,40}):\s*(.+)$/.exec(t);
    const category = m ? m[1].trim() : "";
    const names = (m ? m[2] : t).split(/\s*[,;|]\s*/).map((x) => x.trim()).filter(Boolean);
    if (!names.length) unmatched.push(`Skills: ${t}`);
    for (const name of names) data.skills.push({ id: uid(), name, category, proficiency: "" });
  }
}

function parseExperience(lines: PdfLine[], data: ResumeData, unmatched: string[]) {
  let cur: ResumeData["experiences"][number] | null = null;
  let stage = 0; // 0 = expect job line, 1 = expect company line, 2 = bullets
  let pending: string[] = [];
  const flush = () => {
    if (cur) cur.responsibilities = joinBullets(pending.map((t) => ({ chunks: [t], text: t })));
    pending = [];
  };
  for (const l of lines) {
    const isBullet = BULLET.test(l.text);
    if (!isBullet && (hasDate(l) || SINGLE_DATE.test(l.chunks[l.chunks.length - 1]) && l.chunks.length > 1) && stage !== 1) {
      flush();
      const d = splitDates(l);
      cur = {
        id: uid(), company: "", jobTitle: d.left, employmentType: "", location: "",
        startDate: d.start, endDate: d.end, isCurrent: d.current, responsibilities: [], achievements: [],
      };
      data.experiences.push(cur);
      stage = 1;
    } else if (cur && stage === 1 && !isBullet) {
      const [company, ...loc] = l.text.split(/,\s*/);
      cur.company = company;
      cur.location = loc.join(", ");
      stage = 2;
    } else if (cur) {
      pending.push(l.text);
      stage = 2;
    } else {
      unmatched.push(`Experience: ${l.text}`);
    }
  }
  flush();
  // Lines that are not bullets inside an entry are kept as-is by joinBullets (nothing is dropped).
}

function parseEducation(lines: PdfLine[], data: ResumeData, unmatched: string[]) {
  let cur: ResumeData["education"][number] | null = null;
  for (const l of lines) {
    if (hasDate(l) || (l.chunks.length > 1 && SINGLE_DATE.test(l.chunks[l.chunks.length - 1]))) {
      const d = splitDates(l);
      cur = { id: uid(), degree: d.left, institution: "", location: "", startDate: d.start, endDate: d.current ? "" : d.end, description: "" };
      data.education.push(cur);
    } else if (cur && !cur.institution) {
      const [inst, ...loc] = l.text.split(/\s*[|]\s*/);
      cur.institution = inst;
      cur.location = loc.join(", ");
    } else if (cur) {
      cur.description = [cur.description, l.text.replace(BULLET, "")].filter(Boolean).join(" ");
    } else {
      unmatched.push(`Education: ${l.text}`);
    }
  }
}

function parseProjects(lines: PdfLine[], data: ResumeData) {
  let cur: ResumeData["projects"][number] | null = null;
  for (const l of lines) {
    if (!BULLET.test(l.text) && (!cur || l.chunks.length > 1 || /^[A-Z]/.test(l.text) && cur.description)) {
      cur = { id: uid(), name: l.chunks[0], technologies: "", description: "", url: /https?:|www\./.test(l.chunks[1] ?? "") ? l.chunks[1] : "", githubUrl: "" };
      data.projects.push(cur);
    } else if (cur) {
      cur.description = [cur.description, l.text.replace(BULLET, "")].filter(Boolean).join(" ");
    }
  }
}

function parseCerts(lines: PdfLine[], data: ResumeData) {
  const entries: string[] = [];
  for (const l of lines) {
    // two-column layouts put several bullets on one visual line
    const parts = l.text.split(/\s*[•●▪•]\s*/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1 || BULLET.test(l.text)) entries.push(...parts);
    else if (l.chunks.length > 1) entries.push(...l.chunks);
    else entries.push(l.text);
  }
  for (const e of entries) {
    const [name, ...issuer] = e.split(/\s+[–—-]\s+/);
    data.certifications.push({ id: uid(), name: name.trim(), issuer: issuer.join(" – ").trim(), date: "", url: "" });
  }
}

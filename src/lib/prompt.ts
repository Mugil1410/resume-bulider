import { ResumeData } from "./types";

export const TEMPLATE_NAME = "Professional Purple (ATS-friendly, single column)";

const INSTRUCTIONS = `You are a senior resume editor and ATS (Applicant Tracking System) specialist. Below is my complete resume, formatted with the "${TEMPLATE_NAME}" template: a single-column layout with these sections in order: Professional Summary, Skills (grouped by category), Professional Experience (reverse-chronological, bullet points), Projects, Education, Certifications, then any additional sections.

Please do the following:
1. Review the complete resume from top to bottom.
2. Improve the professional wording, keeping each bullet concise and starting with a strong action verb.
3. Improve ATS compatibility: use standard section names, keep plain text with no tables or graphics, and make sure relevant keywords for my target role appear naturally.
4. Identify missing information (for example dates, locations, metrics, links, or sections) and list the questions you need me to answer.
5. Suggest stronger achievement statements. Where a bullet has no result, ask me for the number or outcome instead of making one up.
6. Improve the technical descriptions so tools, frameworks and methods are named precisely and consistently.
7. Identify grammatical, spelling, punctuation and tense mistakes, and tell me where they are.
8. Recommend improvements for my target job role. My target role is: [WRITE YOUR TARGET JOB TITLE / PASTE THE JOB DESCRIPTION HERE]
9. Maintain factual accuracy. Keep every date, company, title, number and credential exactly as I wrote it unless you are fixing a clear typo, and flag any such fix.
10. Never invent experience, skills, companies, projects, metrics or qualifications. If something is missing, ask me.

Output format:
A. A short list of the most important problems found, in priority order.
B. The improved resume, section by section, in the same structure and order as the original.
C. A table of every change you made with the reason (original text, new text, why).
D. The questions you need me to answer, and suggested keywords I could add if they are true for me.`;

const line = (label: string, v: string) => (v.trim() ? `${label}: ${v.trim()}\n` : "");
const bullets = (items: string[]) =>
  items
    .filter((i) => i.trim())
    .map((i) => `  - ${i.trim()}`)
    .join("\n");

/** Builds the complete, paste-ready prompt from the current resume content. No external AI is called. */
export function buildAiPrompt(d: ResumeData): string {
  const out: string[] = [INSTRUCTIONS, "", "=".repeat(60), "MY RESUME", "=".repeat(60), ""];
  out.push(`Template: ${TEMPLATE_NAME}`, "");

  const p = d.personal;
  out.push("PERSONAL INFORMATION");
  out.push(
    (
      line("Name", p.fullName) +
      line("Professional title", p.title) +
      line("Email", p.email) +
      line("Phone", p.phone) +
      line("Location", p.location) +
      line("LinkedIn", p.linkedin) +
      line("GitHub", p.github) +
      line("Portfolio", p.portfolio)
    ).trimEnd() || "(none provided)",
  );
  out.push("", "PROFESSIONAL SUMMARY", d.summary.trim() || "(none provided)", "");

  out.push("PROFESSIONAL EXPERIENCE");
  if (!d.experiences.length) out.push("(none provided)");
  d.experiences.forEach((e, i) => {
    out.push(
      `${i + 1}. ${e.jobTitle || "(no title)"} at ${e.company || "(no company)"}` +
        `${e.employmentType ? ` (${e.employmentType})` : ""}`,
    );
    out.push(
      `   Dates: ${e.startDate || "?"} – ${e.isCurrent ? "Present" : e.endDate || "?"}` +
        `${e.location ? ` | Location: ${e.location}` : ""}`,
    );
    if (e.responsibilities.some((x) => x.trim())) out.push("   Responsibilities:", bullets(e.responsibilities));
    if (e.achievements.some((x) => x.trim())) out.push("   Achievements:", bullets(e.achievements));
  });

  out.push("", "EDUCATION");
  if (!d.education.length) out.push("(none provided)");
  d.education.forEach((e, i) => {
    out.push(
      `${i + 1}. ${e.degree} – ${e.institution}${e.location ? `, ${e.location}` : ""} (${e.startDate || "?"} – ${e.endDate || "?"})`,
    );
    if (e.description.trim()) out.push(`   ${e.description.trim()}`);
  });

  out.push("", "TECHNICAL SKILLS");
  if (!d.skills.length) out.push("(none provided)");
  const cats = new Map<string, string[]>();
  d.skills.forEach((s) => {
    const k = s.category.trim() || "General";
    cats.set(k, [...(cats.get(k) ?? []), s.proficiency ? `${s.name} (${s.proficiency})` : s.name]);
  });
  cats.forEach((names, k) => out.push(`- ${k}: ${names.join(", ")}`));

  out.push("", "PROJECTS");
  if (!d.projects.length) out.push("(none provided)");
  d.projects.forEach((x, i) => {
    out.push(`${i + 1}. ${x.name}`);
    if (x.technologies.trim()) out.push(`   Technologies: ${x.technologies}`);
    if (x.description.trim()) out.push(`   Description: ${x.description}`);
    if (x.url.trim()) out.push(`   URL: ${x.url}`);
    if (x.githubUrl.trim()) out.push(`   GitHub: ${x.githubUrl}`);
  });

  out.push("", "CERTIFICATIONS");
  if (!d.certifications.length) out.push("(none provided)");
  d.certifications.forEach((c) =>
    out.push(`- ${c.name}${c.issuer ? ` – ${c.issuer}` : ""}${c.date ? ` (${c.date})` : ""}${c.url ? ` ${c.url}` : ""}`),
  );

  d.additional.forEach((a) => {
    out.push("", (a.title || a.kind).toUpperCase());
    out.push(bullets(a.items) || "(none provided)");
  });

  out.push("", "=".repeat(60), "END OF RESUME", "=".repeat(60));
  return out.join("\n");
}

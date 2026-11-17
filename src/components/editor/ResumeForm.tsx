"use client";
import { Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  AdditionalKind, AdditionalSection, Certification, Education, Experience, Project, ResumeData, Skill, uid,
} from "@/lib/types";
import { AddButton, Btn, BulletList, Field, Section, SortableCards, TextArea } from "../ui";

type Update = (fn: (d: ResumeData) => ResumeData) => void;

const KINDS: { kind: AdditionalKind; label: string }[] = [
  { kind: "achievements", label: "Achievements" },
  { kind: "languages", label: "Languages" },
  { kind: "awards", label: "Awards" },
  { kind: "volunteer", label: "Volunteer Experience" },
  { kind: "publications", label: "Publications" },
  { kind: "hobbies", label: "Hobbies" },
  { kind: "custom", label: "Custom Section" },
];

const MAX_PHOTO = 150 * 1024;

async function toSmallDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 240;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const s = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, (bitmap.width - s) / 2, (bitmap.height - s) / 2, s, s, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.8);
}

export function ResumeForm({ data, update }: { data: ResumeData; update: Update }) {
  const p = data.personal;
  const setP = (patch: Partial<typeof p>) => update((d) => ({ ...d, personal: { ...d.personal, ...patch } }));
  const [photoErr, setPhotoErr] = useState("");
  const [newSkill, setNewSkill] = useState({ name: "", category: "" });
  const skillName = useRef<HTMLInputElement>(null);

  const categories = Array.from(new Set(data.skills.map((s) => s.category).filter(Boolean)));

  return (
    <div className="space-y-3">
      <Section title="Personal Details" defaultOpen>
        <Field label="Full name" value={p.fullName} autoComplete="name" onChange={(e) => setP({ fullName: e.target.value })} />
        <Field label="Professional title" value={p.title} onChange={(e) => setP({ title: e.target.value })} />
        <Field label="Email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={p.email} onChange={(e) => setP({ email: e.target.value })} />
        <Field label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={p.phone} onChange={(e) => setP({ phone: e.target.value })} />
        <Field label="Location" value={p.location} autoComplete="address-level2" onChange={(e) => setP({ location: e.target.value })} />
        <Field label="LinkedIn" type="url" inputMode="url" autoCapitalize="none" value={p.linkedin} onChange={(e) => setP({ linkedin: e.target.value })} />
        <Field label="GitHub" type="url" inputMode="url" autoCapitalize="none" value={p.github} onChange={(e) => setP({ github: e.target.value })} />
        <Field label="Portfolio" type="url" inputMode="url" autoCapitalize="none" value={p.portfolio} onChange={(e) => setP({ portfolio: e.target.value })} />
        <div>
          <div className="mb-1 text-xs font-semibold text-zinc-600">Profile photo (optional)</div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.photoUrl && <img src={p.photoUrl} alt="Profile" className="h-14 w-14 rounded-full object-cover" />}
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold">
              {p.photoUrl ? "Change photo" : "Add photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  setPhotoErr("");
                  try {
                    if (f.size > 8 * 1024 * 1024) throw new Error("Image is larger than 8 MB.");
                    const url = await toSmallDataUrl(f);
                    if (url.length > MAX_PHOTO * 1.4) throw new Error("Image is too large after resizing.");
                    setP({ photoUrl: url });
                  } catch (err) {
                    setPhotoErr(err instanceof Error ? err.message : "Could not read that image.");
                  }
                }}
              />
            </label>
            {p.photoUrl && (
              <Btn variant="ghost" onClick={() => setP({ photoUrl: null })}>
                <X size={16} /> Remove
              </Btn>
            )}
          </div>
          {photoErr && <p className="mt-1 text-sm text-red-600">{photoErr}</p>}
        </div>
      </Section>

      <Section title="Professional Summary">
        <TextArea label="Summary" rows={7} value={data.summary} onChange={(e) => update((d) => ({ ...d, summary: e.target.value }))} />
        {data.summary && (
          <Btn variant="danger" onClick={() => update((d) => ({ ...d, summary: "" }))}>
            <Trash2 size={16} /> Clear summary
          </Btn>
        )}
      </Section>

      <Section title="Work Experience" count={data.experiences.length}>
        <AddButton
          onClick={() =>
            update((d) => ({
              ...d,
              experiences: [
                { id: uid(), company: "", jobTitle: "", employmentType: "", location: "", startDate: "", endDate: "", isCurrent: false, responsibilities: [""], achievements: [] },
                ...d.experiences,
              ],
            }))
          }
        >
          Add Experience
        </AddButton>
        <SortableCards<Experience>
          items={data.experiences}
          onChange={(experiences) => update((d) => ({ ...d, experiences }))}
          title={(e) => [e.jobTitle, e.company].filter(Boolean).join(" · ")}
          onDuplicate={(e) => ({ ...e, id: uid(), responsibilities: [...e.responsibilities], achievements: [...e.achievements] })}
          render={(e, patch) => (
            <>
              <Field label="Job title" value={e.jobTitle} onChange={(ev) => patch({ jobTitle: ev.target.value })} />
              <Field label="Company" value={e.company} onChange={(ev) => patch({ company: ev.target.value })} />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-zinc-600">Employment type</span>
                <select
                  value={e.employmentType}
                  onChange={(ev) => patch({ employmentType: ev.target.value })}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-3"
                >
                  <option value="">Not specified</option>
                  {["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Temporary"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <Field label="Location" value={e.location} onChange={(ev) => patch({ location: ev.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date" placeholder="Jan 2024" value={e.startDate} onChange={(ev) => patch({ startDate: ev.target.value })} />
                <Field label="End date" placeholder="Dec 2025" disabled={e.isCurrent} value={e.isCurrent ? "" : e.endDate} onChange={(ev) => patch({ endDate: ev.target.value })} />
              </div>
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                <input type="checkbox" className="h-5 w-5 accent-[var(--accent)]" checked={e.isCurrent} onChange={(ev) => patch({ isCurrent: ev.target.checked })} />
                I currently work here
              </label>
              <BulletList label="Responsibilities" items={e.responsibilities} onChange={(responsibilities) => patch({ responsibilities })} />
              <BulletList label="Achievements" items={e.achievements} addLabel="Add achievement" onChange={(achievements) => patch({ achievements })} />
            </>
          )}
        />
      </Section>

      <Section title="Education" count={data.education.length}>
        <AddButton
          onClick={() =>
            update((d) => ({
              ...d,
              education: [{ id: uid(), degree: "", institution: "", location: "", startDate: "", endDate: "", description: "" }, ...d.education],
            }))
          }
        >
          Add Education
        </AddButton>
        <SortableCards<Education>
          items={data.education}
          onChange={(education) => update((d) => ({ ...d, education }))}
          title={(e) => [e.degree, e.institution].filter(Boolean).join(" · ")}
          onDuplicate={(e) => ({ ...e, id: uid() })}
          render={(e, patch) => (
            <>
              <Field label="Degree" value={e.degree} onChange={(ev) => patch({ degree: ev.target.value })} />
              <Field label="Institution" value={e.institution} onChange={(ev) => patch({ institution: ev.target.value })} />
              <Field label="Location" value={e.location} onChange={(ev) => patch({ location: ev.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date" placeholder="Aug 2019" value={e.startDate} onChange={(ev) => patch({ startDate: ev.target.value })} />
                <Field label="End date" placeholder="May 2023" value={e.endDate} onChange={(ev) => patch({ endDate: ev.target.value })} />
              </div>
              <TextArea label="Description" rows={3} value={e.description} onChange={(ev) => patch({ description: ev.target.value })} />
            </>
          )}
        />
      </Section>

      <Section title="Technical Skills" count={data.skills.length}>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 space-y-3">
          <Field label="Skill name" value={newSkill.name} ref={skillName} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} />
          <Field label="Category" list="skill-cats" placeholder="e.g. Programming" value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })} />
          <datalist id="skill-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          <AddButton
            disabled={!newSkill.name.trim()}
            onClick={() => {
              update((d) => ({ ...d, skills: [...d.skills, { id: uid(), name: newSkill.name.trim(), category: newSkill.category.trim(), proficiency: "" }] }));
              setNewSkill({ ...newSkill, name: "" });
              skillName.current?.focus();
            }}
          >
            Add Skill
          </AddButton>
        </div>
        {[...new Set(data.skills.map((s) => s.category))].map((cat) => (
          <div key={cat || "_"}>
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-500">{cat || "Uncategorised"}</div>
            <div className="space-y-2">
              {data.skills.filter((s) => s.category === cat).map((s) => (
                <SkillRow key={s.id} s={s} update={update} />
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Projects" count={data.projects.length}>
        <AddButton
          onClick={() =>
            update((d) => ({ ...d, projects: [{ id: uid(), name: "", technologies: "", description: "", url: "", githubUrl: "" }, ...d.projects] }))
          }
        >
          Add Project
        </AddButton>
        <SortableCards<Project>
          items={data.projects}
          onChange={(projects) => update((d) => ({ ...d, projects }))}
          title={(x) => x.name}
          onDuplicate={(x) => ({ ...x, id: uid() })}
          render={(x, patch) => (
            <>
              <Field label="Project name" value={x.name} onChange={(e) => patch({ name: e.target.value })} />
              <Field label="Technologies" value={x.technologies} onChange={(e) => patch({ technologies: e.target.value })} />
              <TextArea label="Description" rows={4} value={x.description} onChange={(e) => patch({ description: e.target.value })} />
              <Field label="Project URL" type="url" inputMode="url" autoCapitalize="none" value={x.url} onChange={(e) => patch({ url: e.target.value })} />
              <Field label="GitHub URL" type="url" inputMode="url" autoCapitalize="none" value={x.githubUrl} onChange={(e) => patch({ githubUrl: e.target.value })} />
            </>
          )}
        />
      </Section>

      <Section title="Certifications" count={data.certifications.length}>
        <AddButton
          onClick={() =>
            update((d) => ({ ...d, certifications: [...d.certifications, { id: uid(), name: "", issuer: "", date: "", url: "" }] }))
          }
        >
          Add Certification
        </AddButton>
        <SortableCards<Certification>
          items={data.certifications}
          onChange={(certifications) => update((d) => ({ ...d, certifications }))}
          title={(c) => [c.name, c.issuer].filter(Boolean).join(" – ")}
          onDuplicate={(c) => ({ ...c, id: uid() })}
          render={(c, patch) => (
            <>
              <Field label="Name" value={c.name} onChange={(e) => patch({ name: e.target.value })} />
              <Field label="Issuer" value={c.issuer} onChange={(e) => patch({ issuer: e.target.value })} />
              <Field label="Date" placeholder="2024" value={c.date} onChange={(e) => patch({ date: e.target.value })} />
              <Field label="URL" type="url" inputMode="url" autoCapitalize="none" value={c.url} onChange={(e) => patch({ url: e.target.value })} />
            </>
          )}
        />
      </Section>

      <Section title="Additional Sections" count={data.additional.length}>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <Btn
              key={k.kind}
              variant="secondary"
              onClick={() =>
                update((d) => ({
                  ...d,
                  additional: [...d.additional, { id: uid(), kind: k.kind, title: k.kind === "custom" ? "" : k.label, items: [""] }],
                }))
              }
            >
              + {k.label}
            </Btn>
          ))}
        </div>
        <SortableCards<AdditionalSection>
          items={data.additional}
          onChange={(additional) => update((d) => ({ ...d, additional }))}
          title={(a) => a.title || a.kind}
          onDuplicate={(a) => ({ ...a, id: uid(), items: [...a.items] })}
          render={(a, patch) => (
            <>
              <Field label="Section title" value={a.title} onChange={(e) => patch({ title: e.target.value })} />
              <BulletList label="Items" items={a.items} addLabel="Add item" onChange={(items) => patch({ items })} />
            </>
          )}
        />
      </Section>
    </div>
  );
}

function SkillRow({ s, update }: { s: Skill; update: Update }) {
  const patch = (p: Partial<Skill>) => update((d) => ({ ...d, skills: d.skills.map((x) => (x.id === s.id ? { ...x, ...p } : x)) }));
  return (
    <div className="flex items-center gap-2">
      <input aria-label="Skill name" value={s.name} onChange={(e) => patch({ name: e.target.value })} className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2.5" />
      <input aria-label="Category" value={s.category} onChange={(e) => patch({ category: e.target.value })} className="w-28 rounded-xl border border-zinc-300 bg-white px-3 py-2.5" />
      <button
        type="button"
        aria-label={`Delete ${s.name}`}
        onClick={() => update((d) => ({ ...d, skills: d.skills.filter((x) => x.id !== s.id) }))}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

import { ResumeData } from "@/lib/types";

const ACCENT = "#5b3a9a";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-[12px] mb-[5px] pb-[1px] text-[14.5px] font-bold uppercase tracking-[0.01em] break-after-avoid"
      style={{ color: ACCENT, borderBottom: `1px solid ${ACCENT}` }}
    >
      {children}
    </h2>
  );
}

const Bullets = ({ items }: { items: string[] }) => {
  const list = items.filter((i) => i.trim());
  if (!list.length) return null;
  return (
    <ul className="mt-[2px] list-disc pl-[20px] space-y-[2px]">
      {list.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
};

const range = (start: string, end: string, current = false) =>
  [start, current ? "Present" : end].filter(Boolean).join(" – ");

/** Single resume template, modelled on the uploaded PDF. Pure and print-safe. */
export function ResumeTemplate({ data }: { data: ResumeData }) {
  const { personal: p } = data;
  const contact1 = [p.location, p.phone, p.email].filter(Boolean);
  const contact2 = [p.linkedin, p.github, p.portfolio].filter(Boolean);

  const groups: { category: string; names: string[] }[] = [];
  for (const s of data.skills) {
    if (!s.name.trim()) continue;
    const label = s.proficiency ? `${s.name} (${s.proficiency})` : s.name;
    let g = groups.find((x) => x.category === s.category);
    if (!g) groups.push((g = { category: s.category, names: [] }));
    g.names.push(label);
  }

  return (
    <div
      className="bg-white text-[#1a1a1a] text-[12.5px] leading-[1.3]"
      style={{ fontFamily: "var(--font-lato), Calibri, 'Segoe UI', Arial, sans-serif" }}
    >
      <header className="text-center">
        {p.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photoUrl} alt="" className="mx-auto mb-2 h-[84px] w-[84px] rounded-full object-cover" />
        )}
        <h1 className="text-[26px] font-extrabold uppercase leading-[1.15]" style={{ color: ACCENT }}>
          {p.fullName || "Your Name"}
        </h1>
        {p.title && <div className="text-[13.5px] font-bold">{p.title}</div>}
        {contact1.length > 0 && <div className="text-[11.5px] text-[#555]">{contact1.join(" | ")}</div>}
        {contact2.length > 0 && <div className="text-[11.5px] text-[#555]">{contact2.join(" | ")}</div>}
      </header>

      {data.summary.trim() && (
        <section>
          <Heading>Professional Summary</Heading>
          <p>{data.summary}</p>
        </section>
      )}

      {groups.length > 0 && (
        <section>
          <Heading>Skills</Heading>
          <ul className="list-disc pl-[20px] space-y-[2px]">
            {groups.map((g) => (
              <li key={g.category || "_"}>
                {g.category && <b>{g.category}: </b>}
                {g.names.join(", ")}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.experiences.length > 0 && (
        <section>
          <Heading>Professional Experience</Heading>
          {data.experiences.map((e) => (
            <div key={e.id} className="mb-[7px] break-inside-avoid-page">
              <div className="flex justify-between gap-3">
                <b className="text-[13.5px]">{e.jobTitle}</b>
                <span className="shrink-0 whitespace-nowrap">{range(e.startDate, e.endDate, e.isCurrent)}</span>
              </div>
              <div className="italic text-[#555]">
                {[e.company, e.location].filter(Boolean).join(", ")}
                {e.employmentType && ` · ${e.employmentType}`}
              </div>
              <Bullets items={[...e.responsibilities, ...e.achievements]} />
            </div>
          ))}
        </section>
      )}

      {data.projects.length > 0 && (
        <section>
          <Heading>Projects</Heading>
          {data.projects.map((x) => (
            <div key={x.id} className="mb-[5px] break-inside-avoid-page">
              <div className="flex justify-between gap-3">
                <b className="text-[13.5px]">{x.name}</b>
                <span className="text-[12px] text-[#555] break-all text-right">
                  {[x.url, x.githubUrl].filter(Boolean).join(" | ")}
                </span>
              </div>
              {x.technologies && <div className="italic text-[#555]">{x.technologies}</div>}
              {x.description && <p>{x.description}</p>}
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section>
          <Heading>Education</Heading>
          {data.education.map((e) => (
            <div key={e.id} className="mb-[5px] break-inside-avoid-page">
              <div className="flex justify-between gap-3">
                <b className="text-[13.5px]">{e.degree}</b>
                <span className="shrink-0 whitespace-nowrap">{range(e.startDate, e.endDate)}</span>
              </div>
              <div className="italic text-[#555]">{[e.institution, e.location].filter(Boolean).join(", ")}</div>
              {e.description && <p>{e.description}</p>}
            </div>
          ))}
        </section>
      )}

      {data.certifications.length > 0 && (
        <section>
          <Heading>Certifications</Heading>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-[3px] list-disc pl-[18px]">
            {data.certifications.map((c) => (
              <li key={c.id}>
                {c.name}
                {c.issuer && ` – ${c.issuer}`}
                {c.date && ` (${c.date})`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.additional.map((a) => (
        <section key={a.id}>
          <Heading>{a.title || a.kind}</Heading>
          <Bullets items={a.items} />
        </section>
      ))}
    </div>
  );
}

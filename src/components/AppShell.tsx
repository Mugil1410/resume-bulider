"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, LayoutTemplate, Upload } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/resumes", label: "My Resumes", icon: FileText },
  { href: "/templates", label: "Template", icon: LayoutTemplate },
  { href: "/import", label: "Upload", icon: Upload },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
      <header className="sticky top-0 z-30 hidden border-b border-zinc-200 bg-white/95 backdrop-blur md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-lg font-black text-[var(--accent)]">Resume Builder</Link>
          <nav className="flex gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={active(href) ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${active(href) ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-zinc-600 hover:bg-zinc-100"}`}
              >
                <Icon size={18} /> {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 md:px-6">{children}</div>

      <nav aria-label="Primary" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white md:hidden">
        <ul className="grid grid-cols-4">
          {NAV.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={active(href) ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active(href) ? "text-[var(--accent)]" : "text-zinc-500"}`}
              >
                <Icon size={22} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

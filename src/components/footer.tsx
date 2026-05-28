"use client";

import { navigateToSection } from "@/lib/nav-scroll";

const NAV = ["Skills", "Work", "Experience", "Contact"];

const SOCIALS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/farshadmomo" },
  { label: "LinkedIn", href: "https://linkedin.com/in/farshadmomtaz" },
  { label: "Email", href: "mailto:momtazfarshad@gmail.com" },
];

// Site footer — liquid-glass bar matching the contact/work panels. Lives at the
// bottom of the contact viewport; the keyboard sinks behind it (blurred through
// the glass). Nav buttons drive ScrollControls via navigateToSection.
export function Footer() {
  return (
    <footer className="pointer-events-auto border border-border bg-bg-elev/70 backdrop-blur-md">
      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => navigateToSection("intro")}
            className="text-left font-archivo text-[15px] tracking-wide text-accent transition-colors hover:text-fg"
          >
            /FARSHAD MOMTAZ
          </button>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-accent motion-safe:animate-pulse"
            />
            available for freelance
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {NAV.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => navigateToSection(item.toLowerCase())}
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-muted transition-colors hover:text-fg"
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigateToSection("intro")}
            className="group flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent transition-colors hover:text-fg"
          >
            Back to top
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5"
            >
              <path
                d="M6 9.5V2.5M2.5 6 6 2.5 9.5 6"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
          © 2026 Farshad Momtaz — Built with Next.js + React Three Fiber
        </p>
        <ul className="flex items-center gap-5">
          {SOCIALS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-muted transition-colors hover:text-accent"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

"use client";

import { navigateToSection } from "@/lib/nav-scroll";
import { MobileMenu } from "@/components/mobile-menu";

export function Nav() {
  return (
    <nav className="site-nav fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border px-8 py-6">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigateToSection("intro");
        }}
        className="font-archivo text-[15px] tracking-wide text-accent"
      >
        /FARSHAD MOMTAZ
      </a>

      <div className="flex items-center gap-8">
        {/* Links overflow a phone width; on mobile the footer carries nav and
            users scroll. Show the link row from md up. */}
        <ul className="hidden items-center gap-7 md:flex">
          {["Skills", "Work", "Experience", "Contact"].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateToSection(item.toLowerCase());
                }}
                className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg transition-colors hover:text-accent"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <span className="hidden size-1.5 rounded-full bg-accent md:block" aria-hidden />
      </div>

      <MobileMenu />
    </nav>
  );
}

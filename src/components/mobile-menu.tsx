"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Mobile uses native document scroll, so the menu scrolls straight to the
// section element (id below) — no registry indirection, which is what was
// silently no-op'ing the taps. `null` means scroll to top (intro).
const ITEMS: { n: string; label: string; el: string | null }[] = [
  { n: "01", label: "Intro", el: null },
  { n: "02", label: "Skills", el: "mskills" },
  { n: "03", label: "Work", el: "mwork" },
  { n: "04", label: "Experience", el: "mexperience" },
  { n: "05", label: "Certificates", el: "mcertificates" },
  { n: "06", label: "Contact", el: "mcontact" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

// Mobile-only nav menu. The toggle is a keycap that physically depresses on tap
// (matches the site's keyboard motif); its cream legend bars morph into an
// orange X. The overlay is a machined-plate panel with a warm rim glow; section
// links reveal staggered and smooth-scroll via navigateToSection.
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (el: string | null) => {
    // Free the scroll lock first so the smooth scroll actually runs, then close
    // the overlay (it fades out to reveal the scrolling page).
    document.body.style.overflow = "";
    setOpen(false);
    if (el === null) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(el)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const y = (v: number) => (reduce ? 0 : v);

  return (
    <>
      {/* MENU wordmark (the site's mono-label signature) + a recognizable
          3-line → X morph, so it reads unmistakably as a menu while staying
          on-theme. No box; orange glyph, cream label. */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="fixed right-5 top-3 z-[70] grid size-11 place-items-center transition-transform duration-150 ease-out active:scale-90 md:hidden"
      >
        <span className="relative block h-[14px] w-[18px]">
          <motion.span
            className="absolute left-0 top-0 h-[2px] w-full rounded-full bg-accent"
            initial={false}
            animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
          {/* Middle bar is a shorter, blinking segment — a terminal-cursor nod
              that keeps the glyph reading as a menu while echoing the zsh block.
              Blink is a CSS animation (compositor) so it stays smooth under the
              R3F render loop; fades out when the X forms. */}
          <span
            className={`absolute left-0 top-1/2 h-[2px] w-[11px] -translate-y-1/2 rounded-full bg-accent transition-opacity duration-200 ${
              open ? "opacity-0" : "cursor-blink"
            }`}
          />
          <motion.span
            className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-accent"
            initial={false}
            animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="menu-overlay absolute inset-0 h-full w-full cursor-default"
            />

            <div className="relative flex h-full flex-col">
              <div className="flex items-center px-8 py-6">
                <span className="font-archivo text-[15px] tracking-wide text-accent">
                  /FARSHAD MOMTAZ
                </span>
              </div>

              <motion.nav
                className="flex flex-1 flex-col justify-center gap-1 px-8"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
                }}
              >
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: y(12) },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="mb-7 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-dim"
                >
                  <span className="text-accent">&gt;</span> navigate
                </motion.p>

                {ITEMS.map((it) => (
                  <motion.button
                    key={it.label}
                    type="button"
                    onClick={() => go(it.el)}
                    variants={{
                      hidden: { opacity: 0, y: y(26) },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="group flex items-baseline gap-4 py-2 text-left"
                  >
                    <span className="font-mono text-[12px] text-accent">{it.n}</span>
                    <span className="font-sans text-[38px] font-medium leading-none tracking-[-0.02em] text-fg transition-colors duration-200 group-hover:text-accent">
                      {it.label}
                    </span>
                  </motion.button>
                ))}
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LostKeyboard } from "@/components/three/lost-keyboard";
import { SectionLabel } from "@/components/ui/section-label";

// 404 — reuses the site's 3D keyboard as a slowly rotating backdrop (see
// lost-keyboard.tsx). The thematic hook: the glowing ESC key is the way out, so
// pressing the physical Esc key routes home, matching the on-screen hint.
export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Rotating keyboard backdrop (fixed, pointer-events-none, z-0). */}
      <LostKeyboard />

      {/* Brand mark, top-left — a real link home (nav anchors don't apply off
          the single-page route). */}
      <a
        href="/"
        className="absolute left-8 top-6 z-20 font-archivo text-[15px] tracking-wide text-accent"
      >
        /FARSHAD MOMTAZ
      </a>

      {/* Soft radial scrim behind the copy so it stays legible over the live
          keyboard without hiding the model. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 42%, rgba(10,12,17,0.78), rgba(10,12,17,0) 72%)",
        }}
      />

      {/* pointer-events-none so hover/clicks fall through to the keyboard behind
          (it's interactive); the button re-enables them for itself. */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1280px] flex-col items-center justify-center gap-7 px-8 text-center">
        <SectionLabel index="ERR" label="Page not found" className="justify-center" />

        <h1 className="font-archivo text-[clamp(5rem,22vw,14rem)] leading-[0.82] tracking-[-0.04em] text-fg">
          4<span className="text-accent">0</span>4
        </h1>

        <p className="font-archivo text-[clamp(1.5rem,4vw,2.75rem)] leading-[0.95] tracking-[-0.03em] text-fg">
          This key doesn&rsquo;t <span className="text-accent">exist</span>
        </p>

        {/* Terminal echo of the dead path — mirrors the contact section's shell
            aesthetic. */}
        <div className="w-full max-w-[440px] border border-border bg-bg-elev/70 px-4 py-3 text-left font-mono text-[12px] leading-relaxed backdrop-blur-md">
          <p className="flex items-center gap-2">
            <span className="text-accent">&gt;</span>
            <span className="text-fg">cd ~{pathname}</span>
          </p>
          <p className="pl-4 text-fg-muted">no such file or directory</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <a
            href="/"
            className="btn-liquid-orange group pointer-events-auto inline-flex items-center gap-2 rounded-md px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.1em]"
          >
            Back to home
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M3 7h8M7.5 3.5 11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-dim">
            or hit{" "}
            <kbd className="border border-accent/50 px-1.5 py-0.5 text-accent">
              Esc
            </kbd>
          </p>
        </div>
      </div>
    </main>
  );
}

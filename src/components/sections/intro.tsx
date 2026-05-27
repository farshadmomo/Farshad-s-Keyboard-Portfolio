"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";

export function Intro() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".intro-reveal", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.1,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative h-full w-full overflow-hidden">
      {/* Available For Projects card */}
      <div className="intro-reveal absolute right-8 top-24 z-20 max-w-[220px] border border-border bg-bg-elev/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg">
            Available For Projects
          </span>
        </div>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-fg-muted">
          Currently open for select freelance partnerships.
        </p>
      </div>

      <div className="mx-auto flex h-full max-w-[1280px] items-center px-8">
        <div className="flex max-w-[46%] flex-col items-start gap-7">
          <div className="intro-reveal">
            <SectionLabel index="01" label="Intro" />
          </div>

          <h1 className="intro-reveal font-sans text-[40px] font-normal leading-[0.95] tracking-[-0.02em] text-fg sm:text-[64px] lg:text-[88px]">
            Designing thoughtful digital systems
          </h1>

          <p className="intro-reveal font-mono text-[13px] tracking-wide text-fg-muted">
            Automation developer / front-end engineer
          </p>

          <div className="intro-reveal pointer-events-auto">
            <Button href="#skills">View Work</Button>
          </div>
        </div>
      </div>

      {/* Vertical section indicator */}
      <div className="absolute bottom-8 left-8 z-20 flex flex-col gap-1 font-mono text-[10px] tracking-[0.2em]">
        {["01", "02", "03", "04"].map((n) => (
          <span key={n} className={n === "01" ? "text-accent" : "text-fg-dim"}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

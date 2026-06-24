import { SectionLabel } from "@/components/ui/section-label";
import { Footer } from "@/components/footer";

type Social = { label: string; handle: string; href: string };

const SOCIALS: Social[] = [
  { label: "Email", handle: "momtazfarshad@gmail.com", href: "mailto:momtazfarshad@gmail.com" },
  { label: "GitHub", handle: "@farshadmomo", href: "https://github.com/farshadmomo" },
  { label: "LinkedIn", handle: "in/farshadmomtaz", href: "https://linkedin.com/in/farshadmomtaz" },
  { label: "Phone", handle: "+98 930 214 3477", href: "tel:+989302143477" },
];

const LINES: { cmd: string; out: string }[] = [
  { cmd: "whoami", out: "farshad momtaz" },
  { cmd: "role", out: "automation developer · front-end engineer" },
  { cmd: "location", out: "tehran, iran · gmt+3:30" },
  { cmd: "status", out: "open for select freelance partnerships" },
];

function Arrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="shrink-0 text-fg-dim transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
    >
      <path
        d="M3 7h8M7.5 3.5 11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Section 04 — Contact. Pure DOM, no 3D: the keyboard sinks out of frame across
// this page (see shared-keyboard CONTACT pose) so the terminal block reads clean.
export function Contact() {
  return (
    <div id="contact" className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center gap-10 px-8 pt-24">
        <div className="flex flex-col gap-4">
          <SectionLabel index="06" label="Contact" />
          <h2 className="text-balance font-archivo text-[clamp(1.9rem,4.5vw,3.25rem)] leading-[0.95] tracking-[-0.03em] text-fg">
            Let&rsquo;s build something <span className="text-accent">good</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Terminal window */}
          <div className="border border-border bg-bg-elev/70 backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="size-2 rounded-full bg-fg-dim/50" aria-hidden />
              <span className="size-2 rounded-full bg-fg-dim/50" aria-hidden />
              <span className="size-2 rounded-full bg-accent/70" aria-hidden />
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
                contact — zsh
              </span>
            </div>

            <div className="flex flex-col gap-3 p-5 font-mono text-[13px] leading-relaxed">
              {LINES.map(({ cmd, out }) => (
                <div key={cmd} className="flex flex-col gap-0.5">
                  <p className="flex items-center gap-2">
                    <span className="text-accent">&gt;</span>
                    <span className="text-fg">{cmd}</span>
                  </p>
                  <p className="pl-4 text-fg-muted">{out}</p>
                </div>
              ))}
              <p className="flex items-center gap-2 pt-1">
                <span className="text-accent">&gt;</span>
                <span className="inline-block h-[15px] w-[8px] bg-accent motion-safe:animate-pulse" aria-hidden />
              </p>
            </div>
          </div>

          {/* Social links — glass panel matching the terminal/work cards */}
          <div className="flex flex-col border border-border bg-bg-elev/70 p-5 backdrop-blur-md">
            <span className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-fg-dim">
              Elsewhere
            </span>
            <ul className="flex flex-col">
              {SOCIALS.map(({ label, handle, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="group pointer-events-auto flex items-center justify-between gap-4 border-b border-border py-3.5 transition-colors hover:border-accent/50"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-muted transition-colors group-hover:text-fg">
                      {label}
                    </span>
                    <span className="flex items-center gap-2.5">
                      <span className="font-sans text-[14px] text-fg-muted transition-colors group-hover:text-fg">
                        {handle}
                      </span>
                      <Arrow />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-8 pb-6">
        <Footer />
      </div>
    </div>
  );
}

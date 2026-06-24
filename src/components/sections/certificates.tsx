import { SectionLabel } from "@/components/ui/section-label";

type Certificate = { title: string; img: string; pdf: string };

// Anthropic's official Claude training certificates. The PNGs are page-1 renders
// of the source PDFs (see scripts/convert-certs.mjs); the card links to the PDF.
const BASE = "/certificates";
export const CERTIFICATES: Certificate[] = [
  {
    title: "Claude 101",
    img: `${BASE}/img/certificate-nam3toq3uo73-1782023696.png`,
    pdf: `${BASE}/certificate-nam3toq3uo73-1782023696.pdf`,
  },
  {
    title: "Claude Platform 101",
    img: `${BASE}/img/certificate-fxttc3iitmuz-1781963975.png`,
    pdf: `${BASE}/certificate-fxttc3iitmuz-1781963975.pdf`,
  },
  {
    title: "Claude Code 101",
    img: `${BASE}/img/certificate-hz7e6hb3xo8e-1781967252.png`,
    pdf: `${BASE}/certificate-hz7e6hb3xo8e-1781967252.pdf`,
  },
  {
    title: "Claude Code in Action",
    img: `${BASE}/img/certificate-8zkd8htqcghw-1782027878.png`,
    pdf: `${BASE}/certificate-8zkd8htqcghw-1782027878.pdf`,
  },
  {
    title: "Introduction to Agent Skills",
    img: `${BASE}/img/certificate-dqdfvh75q4bd-1782201933.png`,
    pdf: `${BASE}/certificate-dqdfvh75q4bd-1782201933.pdf`,
  },
  {
    title: "Introduction to Subagents",
    img: `${BASE}/img/certificate-vahmauqfhai8-1782201239.png`,
    pdf: `${BASE}/certificate-vahmauqfhai8-1782201239.pdf`,
  },
  {
    title: "AI Fluency: Framework & Foundations",
    img: `${BASE}/img/certificate-ps94ccfsgkis-1782121546.png`,
    pdf: `${BASE}/certificate-ps94ccfsgkis-1782121546.pdf`,
  },
];

function PdfArrow() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="shrink-0 text-fg-dim transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
    >
      <path
        d="M4 10 10 4M5 4h5v5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CertificateCard({ title, img, pdf }: Certificate) {
  return (
    <a
      href={pdf}
      target="_blank"
      rel="noreferrer"
      className="group pointer-events-auto flex flex-col overflow-hidden border border-border bg-bg-elev transition-colors duration-200 hover:border-accent/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={`${title} — Anthropic certificate of completion`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5">
        <span className="font-sans text-[12.5px] font-medium leading-tight text-fg">
          {title}
        </span>
        <PdfArrow />
      </div>
    </a>
  );
}

// Section 05 — Certificates. DOM-only grid of Anthropic Claude certificates
// composited over the keyboard's faint backdrop pose (shared with Work /
// Experience). Lives inside <Scroll html>.
export function Certificates() {
  return (
    <div id="certificates" className="relative h-full w-full overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-center gap-6 px-8 py-24">
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <SectionLabel index="05" label="Certificates" />
            <h2 className="text-balance font-archivo text-[clamp(1.7rem,4vw,2.9rem)] leading-[0.95] tracking-[-0.03em] text-fg">
              Certified by <span className="text-accent">Anthropic</span>
            </h2>
          </div>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.15em] text-fg-dim md:block">
            Claude training · 7 completions
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {CERTIFICATES.map((c) => (
            <CertificateCard key={c.title} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
}

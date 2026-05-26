import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "group inline-flex items-center gap-2 border border-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-accent transition-colors hover:bg-accent/10";

function Arrow() {
  return (
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
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Button({ children, href, className, ...props }: ButtonProps) {
  if (href) {
    return (
      <a href={href} className={cn(base, className)}>
        {children}
        <Arrow />
      </a>
    );
  }

  return (
    <button className={cn(base, className)} {...props}>
      {children}
      <Arrow />
    </button>
  );
}

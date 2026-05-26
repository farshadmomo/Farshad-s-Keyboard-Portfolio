export function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-8 py-6">
      <a
        href="#"
        className="font-mono text-[13px] tracking-wide text-fg"
      >
        /ALEX PARKER
      </a>

      <div className="flex items-center gap-8">
        <ul className="flex items-center gap-7">
          {["Work", "About", "Notes"].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-muted transition-colors hover:text-fg"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <span className="size-1.5 rounded-full bg-accent" aria-hidden />
      </div>
    </nav>
  );
}

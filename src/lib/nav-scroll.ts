// Bridge between the DOM <Nav> (rendered outside the R3F Canvas) and drei's
// <ScrollControls>, which owns scroll on its own internal element (scroll.el)
// rather than the window — so plain #anchor links can't reach it. A component
// inside ScrollControls registers a handler here; the Nav calls navigateToSection.
type NavHandler = (id: string) => void;

let handler: NavHandler | null = null;

export function registerNavScroll(fn: NavHandler | null) {
  handler = fn;
}

export function navigateToSection(id: string) {
  handler?.(id);
}

"use client";

import { useState } from "react";
import { Mark } from "@/components/Mark";
import { HOME_URL, QUICKSTART_URL, TOP_LINKS } from "@/lib/site";

// In-page links for this demo. They sit in a quieter strip under the shared top bar.
const SECTION_LINKS = [
  { label: "Search", href: "#search" },
  { label: "Bible × UB", href: "#bible-search" },
  { label: "Lookup", href: "#lookup" },
  { label: "Entities", href: "#entities" },
  { label: "More demos", href: "#more-demos" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur">
      {/* Shared top bar: the same on urantia.dev and the demo. */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href={HOME_URL} className="flex shrink-0 items-center gap-2 text-[15px] font-semibold tracking-tight text-ink">
            <Mark />
            urantia.dev
          </a>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {TOP_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={link.current ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  link.current ? "bg-surface text-ink" : "text-ink-soft hover:bg-surface hover:text-ink"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-surface hover:text-ink md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
            >
              Menu
            </button>
            <a href={QUICKSTART_URL} className="btn-amber inline-flex px-4 py-2 text-sm">
              Quickstart
            </a>
          </div>
        </div>

        {menuOpen && (
          <nav id="site-menu" aria-label="Main" className="border-t border-line px-4 pb-3 md:hidden">
            <div className="flex flex-col gap-1 pt-2">
              {TOP_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={link.current ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium ${
                    link.current ? "bg-surface text-ink" : "text-ink-soft hover:bg-surface hover:text-ink"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* Demo sections. Scrolls sideways on a phone instead of wrapping. */}
      <nav aria-label="Demos" className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-1.5 sm:px-6 [scrollbar-width:none]">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full px-3 py-1 text-[13px] text-ink-faint transition-colors hover:bg-surface hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

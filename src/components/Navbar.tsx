"use client";

import { useState } from "react";

// Five top-level items. Every other demo is in the "More demos" index on the page.
const NAV_LINKS = [
  { label: "Search", href: "#search" },
  { label: "Bible × UB", href: "#bible-search" },
  { label: "Lookup", href: "#lookup" },
  { label: "Entities", href: "#entities" },
  { label: "More demos", href: "#more-demos" },
];

const DOCS_URL = "https://docs.urantia.dev";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="https://urantia.dev" className="text-[15px] font-semibold tracking-tight text-ink">
          urantia.dev <span className="font-normal text-ink-faint">demo</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a href={DOCS_URL} className="btn-amber hidden px-4 py-2 text-sm md:inline-flex">
          View docs
        </a>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-2 text-ink-soft hover:bg-surface hover:text-ink md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a href={DOCS_URL} className="btn-amber mt-2 px-4 py-2.5 text-center text-sm">
              View docs
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

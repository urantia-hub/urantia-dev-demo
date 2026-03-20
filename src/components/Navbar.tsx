"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "Search", href: "#search" },
  { label: "Quote", href: "#quote" },
  { label: "Audio", href: "#audio" },
  { label: "Entities", href: "#entities" },
  { label: "Lookup", href: "#lookup" },
  { label: "Plans", href: "#reading-plan" },
  { label: "Account", href: "#account" },
  { label: "Roadmap", href: "#roadmap" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/10 dark:border-gray-300/15 bg-white/95 dark:bg-[#0a0b0f]/95 backdrop-blur-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <a href="https://urantia.dev" className="flex items-center gap-2">
          <img src="/logo.svg" alt="urantia.dev" className="h-7 w-auto" />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-[#3b82f61a] hover:text-gray-900 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://urantia.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-glow ml-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
          >
            View Docs &rarr;
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3b82f61a] hover:text-gray-900 dark:hover:text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-gray-100 dark:border-gray-300/15 bg-white dark:bg-[#0a0b0f] px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-[#3b82f61a] hover:text-gray-900 dark:hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://urantia.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-glow mt-2 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
            >
              View Docs &rarr;
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

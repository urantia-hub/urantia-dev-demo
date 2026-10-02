const FOOTER_LINKS = [
  { label: "Documentation", href: "https://docs.urantia.dev" },
  { label: "API playground", href: "https://api.urantia.dev/docs" },
  { label: "System status", href: "https://status.urantia.dev" },
  { label: "UrantiaHub, built with the API", href: "https://www.urantiahub.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-amber-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p className="text-sm text-ink-faint">
          Part of <a href="https://urantia.dev" className="hover:text-ink">urantia.dev</a>
        </p>
      </div>
    </footer>
  );
}

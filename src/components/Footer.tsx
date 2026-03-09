const FOOTER_LINKS = [
  { label: "Documentation", href: "https://urantia.dev", description: "urantia.dev" },
  { label: "Reading Platform", href: "https://urantiahub.com", description: "urantiahub.com" },
  { label: "API Playground", href: "https://api.urantia.dev/docs", description: "api.urantia.dev/docs" },
  { label: "System Status", href: "https://status.urantia.dev", description: "status.urantia.dev" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FOOTER_LINKS.map((link) => (
            <div key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 transition-colors hover:text-primary"
              >
                {link.label}
              </a>
              <p className="mt-1 text-xs text-gray-400">{link.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          Built for the Urantia community
        </div>
      </div>
    </footer>
  );
}

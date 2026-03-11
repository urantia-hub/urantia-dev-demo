const FOOTER_LINKS = [
  {
    label: "Documentation",
    href: "https://urantia.dev",
    description: "urantia.dev",
  },
  {
    label: "Reading Platform",
    href: "https://urantiahub.com",
    description: "urantiahub.com",
  },
  {
    label: "API Playground",
    href: "https://api.urantia.dev/docs",
    description: "api.urantia.dev/docs",
  },
  {
    label: "System Status",
    href: "https://status.urantia.dev",
    description: "status.urantia.dev",
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-gray-800/50 bg-gray-950">
      {/* Ambient glow from top */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-12 sm:px-6">
        {/* Logo + tagline */}
        <div className="mb-12 text-center">
          <a
            href="https://urantia.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src="/logo.svg"
              alt="urantia.dev"
              className="mx-auto h-8 w-auto opacity-80 transition-opacity hover:opacity-100"
            />
          </a>
          <p className="mt-3 text-sm text-gray-500">
            A free, open API for the Urantia Papers
          </p>
        </div>

        {/* Links as cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card-glow group rounded-lg border border-gray-800/60 bg-white/[0.02] px-5 py-4 transition-all hover:border-gray-700/80 hover:bg-white/[0.04]"
            >
              <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                {link.label}
              </span>
              <p className="mt-1 text-xs text-gray-500 transition-colors group-hover:text-gray-400">
                {link.description}
              </p>
            </a>
          ))}
        </div>

        {/* Glowing divider */}
        <div className="relative mt-14">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800/60" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 pt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500">
            Built for the Urantia community
          </p>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <a
              href="https://status.urantia.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 transition-colors hover:text-gray-400"
            >
              All systems operational
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

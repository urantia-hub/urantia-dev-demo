export function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-gray-950 via-gray-900 to-transparent">
      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Primary radial glow — large ambient bloom that extends past the hero */}
      <div className="animate-glow-shift pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/15 blur-[150px]" />
      {/* Secondary glow for depth */}
      <div className="animate-glow-pulse pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 h-[200px] w-[400px] rounded-full bg-blue-400/10 blur-[100px]" />

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 md:py-28">
        <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-blue-300 backdrop-blur-sm shadow-[0_0_15px_rgba(37,99,235,0.15)]">
          Free &amp; Open API
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          See the Urantia Papers API{" "}
          <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(96,165,250,0.3)]">
            in Action
          </span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-400 sm:text-xl">
          Interactive demos powered by the free, open API at urantia.dev.
          <br className="hidden sm:inline" />
          No API key required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="https://urantia.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-glow inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-light hover:shadow-xl hover:shadow-primary/30"
          >
            Read the Docs
          </a>
          <a
            href="https://urantiahub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/25 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            Try UrantiaHub
          </a>
        </div>
      </div>
    </section>
  );
}

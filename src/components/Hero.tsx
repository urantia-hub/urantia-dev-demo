export function Hero() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-gradient-to-b from-blue-50/60 to-white">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          See the Urantia Papers API in Action
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-500 sm:text-xl">
          Interactive demos powered by the free, open API at urantia.dev.
          <br className="hidden sm:inline" />
          No API key required.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="https://urantia.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            Read the Docs
          </a>
          <a
            href="https://urantiahub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-primary px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Try UrantiaHub
          </a>
        </div>
      </div>
    </section>
  );
}

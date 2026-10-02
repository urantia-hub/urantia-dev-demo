export function Hero() {
  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-[56px] lg:leading-[1.08]">
          See the Urantia Papers API in action
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">
          Interactive demos powered by the free, open API at urantia.dev.
          <br className="hidden sm:inline" /> No API key required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="https://docs.urantia.dev" className="btn-amber inline-flex px-6 py-3 text-sm">
            Read the docs
          </a>
          <a href="https://api.urantia.dev/docs" className="btn-quiet inline-flex px-6 py-3 text-sm">
            API playground
          </a>
        </div>
      </div>
    </section>
  );
}

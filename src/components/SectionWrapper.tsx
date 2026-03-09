interface SectionWrapperProps {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function SectionWrapper({ id, title, subtitle, children }: SectionWrapperProps) {
  return (
    <section id={id} className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-base text-gray-500">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

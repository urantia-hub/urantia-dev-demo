interface SectionWrapperProps {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  variant?: "default" | "alt";
}

export function SectionWrapper({ id, title, subtitle, children, variant = "default" }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 py-16 md:py-24 ${
        variant === "alt" ? "bg-gray-50/60" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-base text-gray-500">{subtitle}</p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

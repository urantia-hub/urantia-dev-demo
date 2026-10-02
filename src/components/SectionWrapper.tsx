interface SectionWrapperProps {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  variant?: "default" | "alt";
}

const VARIANT_CLASSES = {
  default: "bg-white",
  alt: "bg-surface",
};

export function SectionWrapper({ id, title, subtitle, children, variant = "default" }: SectionWrapperProps) {
  return (
    <section id={id} className={`scroll-mt-28 border-b border-line py-16 md:py-20 ${VARIANT_CLASSES[variant]}`}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{title}</h2>
          <p className="mt-2 text-base text-ink-soft">{subtitle}</p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

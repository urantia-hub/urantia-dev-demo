interface SectionWrapperProps {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  variant?: "default" | "alt" | "transparent";
}

const VARIANT_CLASSES = {
  default: "bg-white dark:bg-[var(--background)]",
  alt: "bg-gray-50/60 dark:bg-[#3b82f61a]",
  transparent: "bg-transparent",
};

export function SectionWrapper({ id, title, subtitle, children, variant = "default" }: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 py-16 md:py-24 ${VARIANT_CLASSES[variant]}`}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8">
          <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${variant === "transparent" ? "text-white" : "text-gray-900 dark:text-white"}`}>
            {title}
          </h2>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

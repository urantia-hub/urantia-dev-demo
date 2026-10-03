import { Mark } from "@/components/Mark";
import { DISCLAIMER, FOOTER_COLUMNS, HOME_URL, PRODUCT_LINE } from "@/lib/site";

// Shared footer: the same on urantia.dev and the demo.
export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-1">
            <a href={HOME_URL} className="inline-flex items-center gap-2 text-[16px] font-semibold leading-6 tracking-[-0.01em] text-ink">
              <Mark className="h-[22px] w-[22px]" />
              urantia.dev
            </a>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-ink-soft">{PRODUCT_LINE}</p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold text-ink">{column.title}</h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">{DISCLAIMER}</p>
      </div>
    </footer>
  );
}

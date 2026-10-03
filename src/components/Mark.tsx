// The urantia.dev mark: a lowercase u and the amber colon of every reference (2:5.1). Same as the favicon.
export function Mark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0f2a2e" />
      <path d="M17 21v13a9.5 9.5 0 0 0 19 0V21" fill="none" stroke="#fbf8f3" strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="47" cy="25" r="4.5" fill="#f2b441" />
      <circle cx="47" cy="41" r="4.5" fill="#f2b441" />
    </svg>
  );
}

// The urantia.dev mark: teal rounded square, amber U, light dot. Same as the favicon.
export function Mark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="12" fill="#0f2a2e" />
      <path d="M22 18v18a10 10 0 0 0 20 0V18" fill="none" stroke="#f2b441" strokeWidth="6" strokeLinecap="round" />
      <circle cx="46" cy="47" r="3.5" fill="#ddebe6" />
    </svg>
  );
}

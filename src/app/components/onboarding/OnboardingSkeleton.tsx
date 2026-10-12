const shimmer =
  "animate-shimmer bg-[linear-gradient(90deg,var(--color-surface-sunken),var(--color-surface-muted),var(--color-surface-sunken))] bg-size-[200%_100%]";

/** Server-rendered placeholder while the client restores a saved draft. */
export function OnboardingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Onboarding wird geladen"
      className="mx-auto grid w-full max-w-6xl gap-6 px-4 pt-5 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12 lg:pt-12"
    >
      <div className="hidden space-y-4 lg:block">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className={`h-9 rounded-xl ${shimmer}`} />
        ))}
      </div>
      <div className="rounded-panel border border-line bg-surface p-6 shadow-panel sm:p-10">
        <div className={`h-3 w-24 rounded-full ${shimmer}`} />
        <div className={`mt-4 h-9 w-2/3 rounded-xl ${shimmer}`} />
        <div className={`mt-3 h-4 w-1/2 rounded-lg ${shimmer}`} />
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={`h-28 rounded-card ${shimmer}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

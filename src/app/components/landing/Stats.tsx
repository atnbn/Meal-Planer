const STATS = [
  { value: "7", unit: "Tage", label: "komplett durchgeplant" },
  { value: "21", unit: "Mahlzeiten", label: "mit Kalorien & Makros" },
  { value: "6", unit: "Schritte", label: "vom Ziel zum Plan" },
  { value: "1", unit: "Liste", label: "für den ganzen Einkauf" },
];

/** Product facts as a lightweight proof bar between hero and features. */
export function Stats() {
  return (
    <section aria-label="Meal Planner in Zahlen" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <dl className="reveal grid grid-cols-2 overflow-hidden rounded-panel border border-line bg-surface shadow-card md:grid-cols-4">
        {STATS.map((stat, index) => (
          <div
            key={stat.unit}
            className={[
              "flex flex-col-reverse gap-1 p-6 sm:p-8",
              index % 2 === 1 ? "border-l border-line" : "",
              index >= 2 ? "border-t border-line md:border-t-0" : "",
              index === 2 ? "md:border-l" : "",
            ].join(" ")}
          >
            <dt className="text-sm text-fg-muted">{stat.label}</dt>
            <dd className="flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tabular-nums tracking-tight text-fg sm:text-5xl">{stat.value}</span>
              <span className="text-base font-medium text-brand-700">{stat.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

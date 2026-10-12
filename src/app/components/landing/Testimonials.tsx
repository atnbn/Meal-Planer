import { CheckIcon } from "@/app/components/ui/icons";

import { SectionHeading } from "./SectionHeading";

const SCENARIOS = [
  {
    title: "Krafttraining",
    description: "Proteinziele treffen, ohne jeden Tag dieselben Basisgerichte zu essen.",
    details: ["hohes Protein", "Meal Prep", "Gerichte tauschen"],
  },
  {
    title: "Stressige Woche",
    description: "Kurze Kochzeiten, planbare Reste und eine Einkaufsliste, die wirklich zur Woche passt.",
    details: ["schnelle Rezepte", "Batch-Kochen", "sortierte Liste"],
  },
  {
    title: "Viele Einschränkungen",
    description: "Vegan, glutenfrei oder bestimmte Lebensmittel ausgeschlossen – das Onboarding gibt Kontrolle.",
    details: ["Allergien", "Budget", "Ernährungsweise"],
  },
];

export function Testimonials() {
  return (
    <section aria-labelledby="scenarios-title" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <SectionHeading
        id="scenarios-title"
        eyebrow="Für deinen Alltag"
        title="Flexibel genug für echte Wochen."
        description="Der Planer bleibt präzise bei Kalorien und Makros, aber lässt genug Spielraum für Alltag, Geschmack und Routinen."
      />

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {SCENARIOS.map((scenario) => (
          <li key={scenario.title} className="reveal flex h-full flex-col rounded-panel border border-line bg-surface p-6 shadow-card sm:p-7">
            <h3 className="text-lg font-semibold text-fg">{scenario.title}</h3>
            <p className="mt-3 flex-1 text-pretty leading-relaxed text-fg-muted">{scenario.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {scenario.details.map((detail) => (
                <li
                  key={detail}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                >
                  <CheckIcon size={11} strokeWidth={3} />
                  {detail}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { ChefHatIcon, HeartPulseIcon, SparklesIcon } from "@/app/components/ui/icons";

import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    icon: HeartPulseIcon,
    title: "Ziel & Körperdaten",
    description: "Abnehmen, halten oder aufbauen? Aus deinen Angaben berechnen wir deinen Tagesbedarf live.",
  },
  {
    icon: ChefHatIcon,
    title: "Vorlieben festlegen",
    description: "Ernährungsweise, Allergien, Kochzeit und Budget – alles optional, alles jederzeit änderbar.",
  },
  {
    icon: SparklesIcon,
    title: "Plan erhalten",
    description: "Sieben Tage mit Rezepten, Meal Prep und Einkaufsliste. Einzelne Gerichte tauschst du mit einem Klick.",
  },
];

export function HowItWorks() {
  return (
    <section id="so-gehts" aria-labelledby="how-title" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <SectionHeading
        id="how-title"
        eyebrow="So geht’s"
        title="In drei Schritten zum fertigen Plan."
        description="Das Onboarding dauert rund eine Minute. Dein Fortschritt wird automatisch gespeichert."
      />

      <ol className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
        <span
          aria-hidden="true"
          className="absolute left-[16.5%] right-[16.5%] top-7 hidden h-px bg-linear-to-r from-transparent via-line-strong to-transparent md:block"
        />
        {STEPS.map(({ icon: Icon, title, description }, index) => (
          <li key={title} className="reveal relative flex flex-col items-center text-center">
            <span className="relative flex size-14 items-center justify-center rounded-2xl border border-line bg-surface text-brand-700 shadow-card">
              <Icon size={24} />
              <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-brand-solid text-xs font-semibold tabular-nums text-on-brand shadow-brand">
                {index + 1}
              </span>
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-fg">{title}</h3>
            <p className="mt-2 max-w-xs text-pretty text-sm leading-relaxed text-fg-muted">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

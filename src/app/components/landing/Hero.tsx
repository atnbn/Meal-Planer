import { ButtonLink } from "@/app/components/ui/Button";
import { ArrowRightIcon, CheckIcon, SparklesIcon } from "@/app/components/ui/icons";

import { HeroPreview } from "./HeroPreview";

const TRUST = ["Kostenlos", "Ohne Anmeldung", "Daten bleiben in deinem Browser"];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96 bg-linear-to-b from-brand-100/70 via-accent-100/45 to-transparent dark:from-brand-100/35 dark:via-accent-100/20" />
        <div className="bg-dots absolute inset-0 mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-canvas" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10 lg:pb-28 lg:pt-24">
        <div>
          <a
            href="#funktionen"
            className="group inline-flex animate-fade-up items-center gap-2 rounded-full border border-line bg-surface/80 py-1 pl-1 pr-3 text-sm text-fg-muted shadow-xs backdrop-blur transition-colors hover:border-brand-300 hover:text-fg"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-solid px-2 py-0.5 text-xs font-semibold text-on-brand">
              <SparklesIcon size={12} />
              Neu
            </span>
            Gerichte mit einem Klick tauschen
            <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
          </a>

          <h1
            id="hero-title"
            className="mt-6 animate-fade-up text-balance text-[clamp(2.5rem,1.5rem+4vw,4.5rem)] font-semibold leading-[1.02] text-fg [animation-delay:60ms]"
          >
            Dein Wochenplan. <span className="text-gradient-brand">Makrogenau.</span> In einer Minute.
          </h1>

          <p className="mt-6 max-w-xl animate-fade-up text-pretty text-lg leading-relaxed text-fg-muted [animation-delay:120ms]">
            Sag uns dein Ziel, deine Ernährungsweise und dein Budget – Meal Planner erstellt dir sieben
            Tage voller Mahlzeiten, die zu deinen Kalorien und Makros passen. Mit Meal Prep und fertiger
            Einkaufsliste.
          </p>

          <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:180ms] sm:flex-row">
            <ButtonLink href="/onboarding" size="lg" trailingIcon={<ArrowRightIcon size={18} />}>
              Jetzt Plan erstellen
            </ButtonLink>
            <ButtonLink href="/plan/demo" size="lg" variant="secondary">
              Beispielplan ansehen
            </ButtonLink>
          </div>

          <ul className="mt-8 flex animate-fade-up flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted [animation-delay:240ms]">
            {TRUST.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-full bg-success-soft text-success">
                  <CheckIcon size={11} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

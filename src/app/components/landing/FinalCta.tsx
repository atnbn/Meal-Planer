import { ButtonLink } from "@/app/components/ui/Button";
import { ArrowRightIcon } from "@/app/components/ui/icons";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="reveal relative isolate overflow-hidden rounded-panel bg-brand-solid px-6 py-16 text-center text-on-brand shadow-brand sm:px-12 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-[oklch(1_0_0/0.16)] via-transparent to-accent-500/35" />
          <div className="absolute inset-0 bg-[radial-gradient(oklch(1_0_0/0.14)_1px,transparent_1px)] bg-size-[22px_22px] mask-[radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)]" />
        </div>

        <h2
          id="cta-title"
          className="mx-auto max-w-2xl text-balance text-[clamp(1.875rem,1.3rem+2.4vw,3.25rem)] font-semibold leading-[1.05]"
        >
          Dein nächster Wochenplan ist eine Minute entfernt.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-lg text-on-brand/85">
          Kostenlos, ohne Anmeldung – und jederzeit anpassbar.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink
            href="/onboarding"
            size="lg"
            variant="secondary"
            className="border-transparent"
            trailingIcon={<ArrowRightIcon size={18} />}
          >
            Jetzt Plan erstellen
          </ButtonLink>
          <ButtonLink
            href="/plan/demo"
            size="lg"
            variant="ghost"
            className="text-on-brand ring-1 ring-on-brand/30 hover:bg-on-brand/10 hover:text-on-brand"
          >
            Beispielplan ansehen
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

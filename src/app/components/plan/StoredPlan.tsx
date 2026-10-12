"use client";

import { useState } from "react";

import { SiteHeader } from "@/app/components/layout/SiteHeader";
import { ButtonLink } from "@/app/components/ui/Button";
import { ArrowRightIcon, CalendarIcon } from "@/app/components/ui/icons";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { loadStoredPlan } from "@/lib/plan";

import { PlanView } from "./PlanView";

const shimmer =
  "animate-shimmer bg-[linear-gradient(90deg,var(--color-surface-sunken),var(--color-surface-muted),var(--color-surface-sunken))] bg-size-[200%_100%]";

/** Renders the plan stored by the onboarding (sessionStorage is client-only). */
export function StoredPlan() {
  const isClient = useIsClient();
  return isClient ? <StoredPlanContent /> : <PlanSkeleton />;
}

function StoredPlanContent() {
  const [plan] = useState(loadStoredPlan);
  return plan ? <PlanView initialPlan={plan} mode="live" /> : <EmptyPlan />;
}

function EmptyPlan() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="relative isolate w-full max-w-lg animate-fade-up overflow-hidden rounded-panel border border-line bg-surface p-8 text-center shadow-panel sm:p-12">
          <div aria-hidden="true" className="absolute -top-24 left-1/2 -z-10 size-72 -translate-x-1/2 rounded-full bg-brand-200/50 blur-3xl" />
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <CalendarIcon size={26} />
          </span>
          <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Noch kein Plan vorhanden
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-pretty text-fg-muted">
            Beantworte ein paar kurze Fragen – danach steht dein persönlicher Wochenplan mit Einkaufsliste.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/onboarding" size="lg" trailingIcon={<ArrowRightIcon size={18} />}>
              Plan erstellen
            </ButtonLink>
            <ButtonLink href="/plan/demo" size="lg" variant="secondary">
              Beispiel ansehen
            </ButtonLink>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div
        aria-busy="true"
        aria-label="Plan wird geladen"
        className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10"
      >
        <div className={`h-72 rounded-panel ${shimmer}`} />
        <div className={`mt-8 h-14 rounded-card ${shimmer}`} />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={`h-96 rounded-card ${shimmer}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

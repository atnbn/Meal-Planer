"use client";

import { useState } from "react";

import { SiteHeader } from "@/app/components/layout/SiteHeader";
import { ButtonLink } from "@/app/components/ui/Button";
import { AlertCircleIcon, ArrowRightIcon, PencilIcon, SparklesIcon, XIcon } from "@/app/components/ui/icons";
import { replaceMealAt, storePlan } from "@/lib/plan";
import { mealPlanSchema, type MealPlan } from "@/lib/schema";

import { DayNav } from "./DayNav";
import { DaySection } from "./DaySection";
import { MealPrepPanel } from "./MealPrepPanel";
import { PlanHero } from "./PlanHero";
import { ShoppingList } from "./ShoppingList";

const mealSchema = mealPlanSchema.shape.days.element.shape.meals.element;

type PlanViewProps = {
  initialPlan: MealPlan;
  /** `demo` shows the sample plan read-only and never touches storage. */
  mode: "live" | "demo";
};

export function PlanView({ initialPlan, mode }: PlanViewProps) {
  const isDemo = mode === "demo";
  const [plan, setPlan] = useState(initialPlan);
  const [replacingKey, setReplacingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const replaceMeal = async (dayIndex: number, mealIndex: number) => {
    const day = plan.days[dayIndex];
    const meal = day?.meals[mealIndex];
    if (!day || !meal || replacingKey) return;

    setReplacingKey(`${dayIndex}-${mealIndex}`);
    setError(null);
    setAnnouncement(`${meal.name} wird ausgetauscht …`);

    try {
      const response = await fetch("/api/replace-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal, dayMeals: day.meals }),
      });
      const result: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          result && typeof result === "object" && "error" in result && typeof result.error === "string"
            ? result.error
            : "Das Gericht konnte gerade nicht getauscht werden.";
        throw new Error(message);
      }

      const replacement = mealSchema.safeParse(result);
      if (!replacement.success) throw new Error("Die Antwort des Servers war unvollständig. Bitte versuche es erneut.");

      // Safe to derive from `plan`: only one swap can be in flight at a time.
      const next = replaceMealAt(plan, dayIndex, mealIndex, replacement.data);
      setPlan(next);
      storePlan(next, { keepShoppingProgress: true });
      setAnnouncement(`${meal.name} wurde durch ${replacement.data.name} ersetzt.`);
    } catch (caught) {
      console.error("Fehler beim Austauschen der Mahlzeit:", caught);
      setError(
        caught instanceof TypeError
          ? "Keine Verbindung zum Server. Prüfe deine Internetverbindung."
          : caught instanceof Error
            ? caught.message
            : "Das Gericht konnte gerade nicht getauscht werden.",
      );
      setAnnouncement("");
    } finally {
      setReplacingKey(null);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        actions={
          isDemo ? (
            <ButtonLink href="/onboarding" size="sm" trailingIcon={<ArrowRightIcon size={16} />}>
              <span className="max-sm:hidden">Eigenen Plan erstellen</span>
              <span className="sm:hidden">Starten</span>
            </ButtonLink>
          ) : (
            <ButtonLink href="/onboarding" size="sm" variant="secondary" leadingIcon={<PencilIcon size={15} />}>
              <span className="max-sm:sr-only">Angaben anpassen</span>
            </ButtonLink>
          )
        }
      />

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
        <PlanHero plan={plan} isDemo={isDemo} />

        <div className="mt-8">
          <DayNav days={plan.days} />
        </div>

        <div className="mt-10 space-y-16">
          {plan.days.map((day, index) => (
            <DaySection
              key={day.day}
              day={day}
              index={index}
              targetCalories={plan.dailyCalories}
              replacingKey={replacingKey}
              onReplace={isDemo ? undefined : (mealIndex) => replaceMeal(index, mealIndex)}
            />
          ))}
        </div>

        <div className="mt-16 grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <MealPrepPanel days={plan.days} />
          <ShoppingList key={mode} items={plan.shoppingList} persist={!isDemo} />
        </div>

        {isDemo ? (
          <section className="reveal relative isolate mt-16 overflow-hidden rounded-panel bg-brand-solid px-6 py-12 text-center text-on-brand shadow-brand sm:px-12">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(1_0_0/0.18),transparent_60%)]" />
            <SparklesIcon size={28} className="mx-auto" />
            <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Bereit für deinen eigenen Plan?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-on-brand/85">
              Sechs kurze Schritte – danach steht dein persönlicher Wochenplan.
            </p>
            <ButtonLink
              href="/onboarding"
              size="lg"
              variant="secondary"
              className="mt-7 border-transparent"
              trailingIcon={<ArrowRightIcon size={18} />}
            >
              Jetzt Plan erstellen
            </ButtonLink>
          </section>
        ) : null}
      </main>

      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>

      {error ? (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg animate-fade-up items-start gap-3 rounded-card border border-danger/30 bg-surface p-4 shadow-float sm:bottom-6"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertCircleIcon size={18} />
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-sm font-semibold text-fg">Tauschen fehlgeschlagen</p>
            <p className="mt-0.5 text-sm text-fg-muted">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Meldung schließen"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg"
          >
            <XIcon size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

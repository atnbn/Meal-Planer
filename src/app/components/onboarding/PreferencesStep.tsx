import type { ReactNode } from "react";

import { ChoiceCard } from "@/app/components/ui/ChoiceCard";
import { FieldMessage } from "@/app/components/ui/FieldMessage";
import { ChefHatIcon, ClockIcon, FlameIcon } from "@/app/components/ui/icons";
import { Segmented } from "@/app/components/ui/Segmented";
import { Switch } from "@/app/components/ui/Switch";
import { TextField } from "@/app/components/ui/TextField";
import {
  BUDGET_PERIOD_LABELS,
  BUDGET_PERIODS,
  COOKING_TIME_OPTIONS,
  MEAL_COUNT_OPTIONS,
  MEAL_PREP_LABELS,
  MEAL_PREP_PREFERENCES,
  type MealPrepPreference,
} from "@/lib/onboarding/constants";
import { getDailyBudget, sanitizeNumericInput } from "@/lib/onboarding/form";

import { FormSection } from "./FormSection";
import { fieldId, messageId, type StepProps } from "./types";

const mealPrepMeta: Record<MealPrepPreference, { icon: ReactNode; hint: string }> = {
  full: { icon: <ChefHatIcon size={22} />, hint: "1–2× pro Woche vorkochen, unter der Woche nur aufwärmen." },
  partial: { icon: <FlameIcon size={22} />, hint: "Basics vorbereiten, den Rest frisch kochen." },
  fresh: { icon: <ClockIcon size={22} />, hint: "Jede Mahlzeit frisch – kaum Vorbereitung." },
};

const LOW_BUDGET_PER_DAY = 4;

const formatEuro = (value: number) =>
  value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export function PreferencesStep({ form, errors, setField }: StepProps) {
  const dailyBudget = errors.budget ? null : getDailyBudget(form);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormSection legend="Mahlzeiten pro Tag">
          <Segmented
            id={fieldId("mealsPerDay")}
            name="mealsPerDay"
            value={form.mealsPerDay}
            options={MEAL_COUNT_OPTIONS.map((count) => ({
              value: count,
              label: String(count),
              ariaLabel: `${count} Mahlzeiten`,
            }))}
            onChange={(count) => setField("mealsPerDay", count)}
            invalid={Boolean(errors.mealsPerDay)}
          />
          <FieldMessage id={messageId("mealsPerDay")} error={errors.mealsPerDay} />
        </FormSection>

        <FormSection legend="Maximale Kochzeit">
          <Segmented
            id={fieldId("maxCookingTime")}
            name="maxCookingTime"
            value={form.maxCookingTime}
            options={COOKING_TIME_OPTIONS.map((minutes) => ({
              value: minutes,
              label: `${minutes}′`,
              ariaLabel: `${minutes} Minuten`,
            }))}
            onChange={(minutes) => setField("maxCookingTime", minutes)}
            invalid={Boolean(errors.maxCookingTime)}
          />
          <FieldMessage
            id={messageId("maxCookingTime")}
            error={errors.maxCookingTime}
            hint="Pro Mahlzeit, in Minuten."
          />
        </FormSection>
      </div>

      <Switch
        id={fieldId("snacks")}
        checked={form.snacks}
        onChange={(checked) => setField("snacks", checked)}
        label="Snacks einplanen"
        description="Kleine Zwischenmahlzeiten zusätzlich zu den Hauptmahlzeiten."
      />

      <FormSection legend="Meal Prep">
        <div className="grid gap-3 sm:grid-cols-3">
          {MEAL_PREP_PREFERENCES.map((prep, index) => (
            <ChoiceCard
              key={prep}
              id={index === 0 ? fieldId("mealPrep") : undefined}
              name="mealPrep"
              value={prep}
              checked={form.mealPrep === prep}
              onChange={() => setField("mealPrep", prep)}
              icon={mealPrepMeta[prep].icon}
              title={MEAL_PREP_LABELS[prep]}
              description={mealPrepMeta[prep].hint}
              layout="stacked"
            />
          ))}
        </div>
      </FormSection>

      <FormSection as="div" legend="Lebensmittel-Budget">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-start">
          <TextField
            id={fieldId("budget")}
            label={<span className="sr-only">Budget in Euro</span>}
            unit="€"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="go"
            placeholder="60"
            maxLength={6}
            value={form.budget}
            onChange={(event) => setField("budget", sanitizeNumericInput(event.target.value, true))}
            error={errors.budget}
            hint={
              dailyBudget
                ? `≈ ${formatEuro(dailyBudget)} pro Tag`
                : "Wie viel möchtest du für Lebensmittel ausgeben?"
            }
          />
          <fieldset>
            <legend className="sr-only">Zeitraum des Budgets</legend>
            <Segmented
              name="budgetPeriod"
              value={form.budgetPeriod}
              options={BUDGET_PERIODS.map((period) => ({
                value: period,
                label: `pro ${BUDGET_PERIOD_LABELS[period]}`,
              }))}
              onChange={(period) => setField("budgetPeriod", period)}
            />
          </fieldset>
        </div>
        {dailyBudget !== null && dailyBudget < LOW_BUDGET_PER_DAY ? (
          <p
            role="status"
            className="mt-3 animate-fade-up rounded-card bg-warning-soft px-4 py-3 text-sm text-warning"
          >
            Ein sehr knappes Budget – wir setzen verstärkt auf günstige Grundzutaten wie Hülsenfrüchte,
            Haferflocken und saisonales Gemüse.
          </p>
        ) : null}
      </FormSection>
    </div>
  );
}

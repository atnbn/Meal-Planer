import { Button } from "@/app/components/ui/Button";
import { InfoIcon, RotateCcwIcon, SparklesIcon } from "@/app/components/ui/icons";
import { TextField } from "@/app/components/ui/TextField";
import type { NutritionTargets } from "@/lib/calorie-target";
import {
  getTargetRule,
  macroCalories,
  TARGET_KEYS,
  type Targets,
} from "@/lib/onboarding/form";

import { MacroBar } from "@/app/components/ui/MacroBar";
import { fieldId, type StepProps } from "./types";

type TargetsPanelProps = StepProps & {
  recommended: NutritionTargets;
  targets: Targets;
  onEnableManual: () => void;
  onDisableManual: () => void;
};

const MISMATCH_TOLERANCE = 0.1;

export function TargetsPanel({
  form,
  errors,
  setField,
  recommended,
  targets,
  onEnableManual,
  onDisableManual,
}: TargetsPanelProps) {
  const macroKcal = macroCalories(targets);
  const deviation = targets.targetCalories > 0
    ? (macroKcal - targets.targetCalories) / targets.targetCalories
    : 0;
  const showMismatch = form.useManualTargets && Math.abs(deviation) > MISMATCH_TOLERANCE;

  return (
    <section
      aria-labelledby="targets-heading"
      className="relative overflow-hidden rounded-card border border-brand-100 bg-linear-to-br from-brand-50 via-surface to-surface p-5 sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="targets-heading"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700"
          >
            <SparklesIcon size={14} />
            {form.useManualTargets ? "Deine Zielwerte" : "Empfohlene Zielwerte"}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            {form.useManualTargets
              ? "Manuell angepasst – wir planen exakt mit diesen Werten."
              : "Berechnet aus deinen Angaben und deinem Ziel."}
          </p>
        </div>
        {form.useManualTargets ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDisableManual}
            leadingIcon={<RotateCcwIcon size={15} />}
          >
            Empfehlung nutzen
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={onEnableManual}>
            Anpassen
          </Button>
        )}
      </div>

      <MacroBar targets={targets} className="relative mt-5" />

      {form.useManualTargets ? (
        <div className="relative mt-6 animate-fade-up">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TARGET_KEYS.map((key) => {
              const rule = getTargetRule(key);
              return (
                <TextField
                  key={key}
                  id={fieldId(key)}
                  label={rule.label}
                  unit={rule.unit}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={form[key]}
                  onChange={(event) => setField(key, event.target.value.replace(/\D/g, ""))}
                  error={errors[key]}
                  hint={`${rule.min}–${rule.max.toLocaleString("de-DE")}`}
                />
              );
            })}
          </div>

          {showMismatch ? (
            <div
              role="status"
              className="mt-4 flex flex-col gap-3 rounded-card bg-warning-soft p-4 text-sm text-warning sm:flex-row sm:items-center sm:justify-between"
            >
              <p>
                Deine Makros ergeben {Math.round(macroKcal).toLocaleString("de-DE")} kcal –{" "}
                {Math.abs(Math.round(deviation * 100))} % {deviation > 0 ? "mehr" : "weniger"} als dein
                Kalorienziel.
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setField("targetCalories", String(Math.round(macroKcal / 10) * 10))
                }
              >
                Kalorien angleichen
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <details className="group/details relative mt-5 text-sm text-fg-muted">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-md font-medium text-fg-muted hover:text-fg [&::-webkit-details-marker]:hidden">
          <InfoIcon size={16} />
          Wie wird das berechnet?
        </summary>
        <p className="mt-2 max-w-prose leading-relaxed">
          Grundumsatz nach Mifflin-St-Jeor ca.{" "}
          <strong className="font-semibold text-fg">
            {recommended.bmr.toLocaleString("de-DE")} kcal
          </strong>
          , multipliziert mit deinem Aktivitätsfaktor ({recommended.activityFactor.toLocaleString("de-DE")})
          ergibt einen Erhaltungsbedarf von ca.{" "}
          <strong className="font-semibold text-fg">
            {recommended.maintenanceCalories.toLocaleString("de-DE")} kcal
          </strong>
          . Für dein Ziel passen wir um {recommended.goalAdjustment >= 0 ? "+" : "−"}
          {Math.abs(recommended.goalAdjustment)} kcal an. Die Werte sind eine Schätzung und ersetzen
          keine ärztliche Beratung.
        </p>
      </details>
    </section>
  );
}

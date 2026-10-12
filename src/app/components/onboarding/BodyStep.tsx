import type { CSSProperties } from "react";

import { ChoiceCard } from "@/app/components/ui/ChoiceCard";
import { FieldMessage } from "@/app/components/ui/FieldMessage";
import { FlameIcon } from "@/app/components/ui/icons";
import { Segmented } from "@/app/components/ui/Segmented";
import { TextField } from "@/app/components/ui/TextField";
import { cn } from "@/lib/cn";
import {
  ACTIVITY_LEVELS,
  type ActivityLevel,
  GENDERS,
  LIMITS,
} from "@/lib/onboarding/constants";
import {
  getBulkHint,
  getBulkStyle,
  sanitizeNumericInput,
  type Targets,
} from "@/lib/onboarding/form";

import { FormSection } from "./FormSection";
import { MacroBar } from "@/app/components/ui/MacroBar";
import { fieldId, messageId, type StepProps } from "./types";

const activityMeta: Record<ActivityLevel, { hint: string; level: number }> = {
  "Wenig aktiv": { hint: "Überwiegend sitzend, kaum Sport.", level: 1 },
  "Leicht aktiv": { hint: "Spaziergänge oder 1–2× Training pro Woche.", level: 2 },
  "Moderat aktiv": { hint: "3–5× Training oder viel Bewegung im Alltag.", level: 3 },
  "Sehr aktiv": { hint: "Körperlicher Job oder fast tägliches, intensives Training.", level: 4 },
};

function IntensityMeter({ level }: { level: number }) {
  return (
    <span aria-hidden="true" className="mt-2 flex gap-1">
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={cn(
            "h-1.5 w-5 rounded-full transition-colors duration-300",
            bar <= level ? "bg-brand-500" : "bg-line",
          )}
        />
      ))}
    </span>
  );
}

type BodyStepProps = StepProps & { targets: Targets | null };

export function BodyStep({ form, errors, setField, targets }: BodyStepProps) {
  const surplusRange = LIMITS.calorieSurplus.max - LIMITS.calorieSurplus.min;
  const surplusProgress = ((form.calorieSurplus - LIMITS.calorieSurplus.min) / surplusRange) * 100;
  const bulkStyle = getBulkStyle(form.calorieSurplus);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          id={fieldId("age")}
          label="Alter"
          unit="Jahre"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="next"
          placeholder="28"
          maxLength={5}
          value={form.age}
          onChange={(event) => setField("age", sanitizeNumericInput(event.target.value, true))}
          error={errors.age}
        />
        <TextField
          id={fieldId("height")}
          label="Größe"
          unit="cm"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="next"
          placeholder="175"
          maxLength={5}
          value={form.height}
          onChange={(event) => setField("height", sanitizeNumericInput(event.target.value, true))}
          error={errors.height}
        />
        <TextField
          id={fieldId("weight")}
          label="Gewicht"
          unit="kg"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="next"
          placeholder="72,5"
          maxLength={5}
          value={form.weight}
          onChange={(event) => setField("weight", sanitizeNumericInput(event.target.value, true))}
          error={errors.weight}
        />
      </div>

      <FormSection
        legend="Geschlecht"
        description="Wird nur für die Berechnung deines Grundumsatzes verwendet."
      >
        <Segmented
          id={fieldId("gender")}
          name="gender"
          value={form.gender}
          options={GENDERS.map((gender) => ({ value: gender, label: gender }))}
          onChange={(gender) => setField("gender", gender)}
          invalid={Boolean(errors.gender)}
          describedById={errors.gender ? messageId("gender") : undefined}
          columnsClassName="grid-cols-2 sm:grid-cols-4"
        />
        <FieldMessage id={messageId("gender")} error={errors.gender} />
      </FormSection>

      <FormSection legend="Wie aktiv ist dein Alltag?">
        <div className="grid gap-3 sm:grid-cols-2">
          {ACTIVITY_LEVELS.map((activity, index) => (
            <ChoiceCard
              key={activity}
              id={index === 0 ? fieldId("activityLevel") : undefined}
              name="activityLevel"
              value={activity}
              checked={form.activityLevel === activity}
              onChange={() => setField("activityLevel", activity)}
              title={activity}
              description={activityMeta[activity].hint}
              meta={<IntensityMeter level={activityMeta[activity].level} />}
              invalid={Boolean(errors.activityLevel)}
              describedById={errors.activityLevel ? messageId("activityLevel") : undefined}
            />
          ))}
        </div>
        <FieldMessage id={messageId("activityLevel")} error={errors.activityLevel} />
      </FormSection>

      {form.goal === "Muskelaufbau" ? (
        <div className="animate-fade-up rounded-card border border-brand-100 bg-linear-to-br from-brand-50 to-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <label htmlFor={fieldId("calorieSurplus")} className="text-sm font-semibold text-fg">
                Wie stark möchtest du aufbauen?
              </label>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-fg">
                {bulkStyle}
                <span className="ml-2 text-base font-medium tabular-nums text-brand-700">
                  +{form.calorieSurplus} kcal
                </span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-brand-700 shadow-xs">
              <FlameIcon size={14} />
              Überschuss pro Tag
            </span>
          </div>

          <input
            id={fieldId("calorieSurplus")}
            type="range"
            min={LIMITS.calorieSurplus.min}
            max={LIMITS.calorieSurplus.max}
            step={LIMITS.calorieSurplus.step}
            value={form.calorieSurplus}
            onChange={(event) => setField("calorieSurplus", Number(event.target.value))}
            aria-valuetext={`${form.calorieSurplus} Kilokalorien Überschuss, ${bulkStyle}`}
            aria-describedby={`${fieldId("calorieSurplus")}-hint`}
            className="range-brand mt-5 w-full"
            style={{ "--range-progress": `${surplusProgress}%` } as CSSProperties}
          />
          <div aria-hidden="true" className="mt-1 flex justify-between text-xs font-medium text-fg-subtle">
            <span>Lean · {LIMITS.calorieSurplus.min}</span>
            <span>Moderat</span>
            <span>Dirty · {LIMITS.calorieSurplus.max}</span>
          </div>
          <p id={`${fieldId("calorieSurplus")}-hint`} className="mt-3 text-sm leading-relaxed text-fg-muted">
            {getBulkHint(form.calorieSurplus)}
          </p>
          <FieldMessage id={messageId("calorieSurplus")} error={errors.calorieSurplus} />
        </div>
      ) : null}

      {targets ? (
        <div
          className="animate-fade-up rounded-card border border-line bg-surface-muted p-5 lg:hidden"
          aria-live="polite"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Dein geschätzter Tagesbedarf
          </p>
          <MacroBar targets={targets} variant="compact" />
        </div>
      ) : null}
    </div>
  );
}

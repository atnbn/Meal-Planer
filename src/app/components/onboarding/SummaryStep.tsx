import type { ReactNode } from "react";

import { Button } from "@/app/components/ui/Button";
import {
  AlertCircleIcon,
  CarrotIcon,
  ClockIcon,
  PencilIcon,
  ScaleIcon,
  SparklesIcon,
  XIcon,
} from "@/app/components/ui/icons";
import type { NutritionTargets } from "@/lib/calorie-target";
import { BUDGET_PERIOD_LABELS, MEAL_PREP_LABELS } from "@/lib/onboarding/constants";
import { getBulkStyle, getImpliedExclusions, type Targets } from "@/lib/onboarding/form";

import { TargetsPanel } from "./TargetsPanel";
import type { StepProps } from "./types";

type SummaryStepProps = StepProps & {
  recommended: NutritionTargets | null;
  targets: Targets | null;
  onEdit: (step: number) => void;
  onEnableManual: () => void;
  onDisableManual: () => void;
  generationError: string | null;
  onRetry: () => void;
};

type Section = {
  title: string;
  step: number;
  icon: ReactNode;
  rows: Array<[label: string, value: string]>;
};

const list = (items: readonly string[], empty: string) => (items.length ? items.join(", ") : empty);

export function SummaryStep({
  form,
  errors,
  setField,
  recommended,
  targets,
  onEdit,
  onEnableManual,
  onDisableManual,
  generationError,
  onRetry,
}: SummaryStepProps) {
  const implied = getImpliedExclusions(form.diet);
  const exclusions = form.blacklist.filter((item) => !implied.includes(item));

  const sections: Section[] = [
    {
      title: "Ziel",
      step: 0,
      icon: <SparklesIcon size={18} />,
      rows: [
        ["Ziel", form.goal || "–"],
        ...(form.goal === "Muskelaufbau"
          ? ([["Bulk", `${getBulkStyle(form.calorieSurplus)} · +${form.calorieSurplus} kcal`]] as Array<
              [string, string]
            >)
          : []),
      ],
    },
    {
      title: "Über dich",
      step: 1,
      icon: <ScaleIcon size={18} />,
      rows: [
        ["Profil", [form.age && `${form.age} Jahre`, form.gender].filter(Boolean).join(" · ") || "–"],
        ["Körper", form.height && form.weight ? `${form.height} cm · ${form.weight} kg` : "–"],
        ["Aktivität", form.activityLevel || "–"],
      ],
    },
    {
      title: "Ernährung",
      step: 2,
      icon: <CarrotIcon size={18} />,
      rows: [["Ernährungsweise", form.diet || "–"]],
    },
    {
      title: "Ausschlüsse",
      step: 3,
      icon: <XIcon size={18} />,
      rows: [
        ["Allergien", list(form.allergies, "Keine")],
        ["Mag ich nicht", list(exclusions, "Nichts")],
      ],
    },
    {
      title: "Alltag & Budget",
      step: 4,
      icon: <ClockIcon size={18} />,
      rows: [
        ["Rhythmus", `${form.mealsPerDay} Mahlzeiten${form.snacks ? " + Snacks" : ""}`],
        ["Kochen", `${MEAL_PREP_LABELS[form.mealPrep]} · max. ${form.maxCookingTime} Min.`],
        [
          "Budget",
          form.budget ? `${form.budget} € pro ${BUDGET_PERIOD_LABELS[form.budgetPeriod]}` : "–",
        ],
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {generationError ? (
        <div
          role="alert"
          className="flex animate-fade-up flex-col gap-3 rounded-card border border-danger/25 bg-danger-soft p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2 text-sm font-medium text-danger">
            <AlertCircleIcon size={18} className="mt-0.5 shrink-0" />
            <span>{generationError}</span>
          </p>
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Erneut versuchen
          </Button>
        </div>
      ) : null}

      {recommended && targets ? (
        <TargetsPanel
          form={form}
          errors={errors}
          setField={setField}
          recommended={recommended}
          targets={targets}
          onEnableManual={onEnableManual}
          onDisableManual={onDisableManual}
        />
      ) : (
        <p className="flex items-start gap-2 rounded-card bg-warning-soft p-4 text-sm text-warning">
          <AlertCircleIcon size={18} className="mt-0.5 shrink-0" />
          Deine Zielwerte können erst berechnet werden, wenn deine Angaben unter „Über dich“
          vollständig sind.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((section, index) => (
          <section
            key={section.title}
            aria-labelledby={`summary-${section.step}`}
            className={`group/summary flex flex-col rounded-card ${index === sections.length - 1 ? "sm:col-span-2" : ""} border border-line bg-surface p-4 transition-colors hover:border-brand-200 sm:p-5`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id={`summary-${section.step}`}
                className="flex items-center gap-2 text-sm font-semibold text-fg"
              >
                <span className="flex size-8 items-center justify-center rounded-[0.6rem] bg-surface-sunken text-fg-muted">
                  {section.icon}
                </span>
                {section.title}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(section.step)}
                leadingIcon={<PencilIcon size={14} />}
                aria-label={`${section.title} bearbeiten`}
              >
                <span aria-hidden="true">Bearbeiten</span>
              </Button>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              {section.rows.map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="w-28 shrink-0 text-fg-subtle">{label}</dt>
                  <dd className="min-w-0 font-medium text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}

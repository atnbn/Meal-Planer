import type { ReactNode } from "react";

import { ChoiceCard } from "@/app/components/ui/ChoiceCard";
import { FieldMessage } from "@/app/components/ui/FieldMessage";
import {
  DumbbellIcon,
  HeartPulseIcon,
  ScaleIcon,
  TrendingDownIcon,
} from "@/app/components/ui/icons";
import { GOALS, type Goal } from "@/lib/onboarding/constants";

import { FormSection } from "./FormSection";
import { fieldId, messageId, type StepProps } from "./types";

const goalMeta: Record<Goal, { icon: ReactNode; hint: string }> = {
  Abnehmen: {
    icon: <TrendingDownIcon size={22} />,
    hint: "Moderates Defizit, viele Sattmacher und klare Struktur.",
  },
  Muskelaufbau: {
    icon: <DumbbellIcon size={22} />,
    hint: "Kalorienüberschuss und viel Protein für Training und Aufbau.",
  },
  "Gewicht halten": {
    icon: <ScaleIcon size={22} />,
    hint: "Ausgewogen essen, ohne Fokus auf Zu- oder Abnahme.",
  },
  "Gesünder leben": {
    icon: <HeartPulseIcon size={22} />,
    hint: "Mehr Balance, Routine und hochwertige Lebensmittel.",
  },
};

export function GoalStep({ form, errors, setField }: StepProps) {
  return (
    <FormSection legend={<span className="sr-only">Ziel auswählen</span>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {GOALS.map((goal, index) => (
          <ChoiceCard
            key={goal}
            id={index === 0 ? fieldId("goal") : undefined}
            name="goal"
            value={goal}
            checked={form.goal === goal}
            onChange={() => setField("goal", goal)}
            icon={goalMeta[goal].icon}
            title={goal}
            description={goalMeta[goal].hint}
            invalid={Boolean(errors.goal)}
            describedById={errors.goal ? messageId("goal") : undefined}
          />
        ))}
      </div>
      <FieldMessage id={messageId("goal")} error={errors.goal} />
    </FormSection>
  );
}

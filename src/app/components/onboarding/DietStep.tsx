import type { ReactNode } from "react";

import { ChoiceCard } from "@/app/components/ui/ChoiceCard";
import { FieldMessage } from "@/app/components/ui/FieldMessage";
import { BeefIcon, CarrotIcon, FishIcon, SproutIcon } from "@/app/components/ui/icons";
import { DIETS, type Diet } from "@/lib/onboarding/constants";

import { FormSection } from "./FormSection";
import { fieldId, messageId, type StepProps } from "./types";

const dietMeta: Record<Diet, { icon: ReactNode; hint: string }> = {
  Omnivor: { icon: <BeefIcon size={22} />, hint: "Fleisch, Fisch und Pflanzliches – alles erlaubt." },
  Pescetarisch: { icon: <FishIcon size={22} />, hint: "Vegetarisch, ergänzt um Fisch und Meeresfrüchte." },
  Vegetarisch: { icon: <CarrotIcon size={22} />, hint: "Ohne Fleisch und Fisch, mit Ei und Milchprodukten." },
  Vegan: { icon: <SproutIcon size={22} />, hint: "Rein pflanzlich, ohne tierische Produkte." },
};

export function DietStep({ form, errors, setField }: StepProps) {
  return (
    <FormSection legend={<span className="sr-only">Ernährungsweise auswählen</span>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {DIETS.map((diet, index) => (
          <ChoiceCard
            key={diet}
            id={index === 0 ? fieldId("diet") : undefined}
            name="diet"
            value={diet}
            checked={form.diet === diet}
            onChange={() => setField("diet", diet)}
            icon={dietMeta[diet].icon}
            title={diet}
            description={dietMeta[diet].hint}
            invalid={Boolean(errors.diet)}
            describedById={errors.diet ? messageId("diet") : undefined}
          />
        ))}
      </div>
      <FieldMessage id={messageId("diet")} error={errors.diet} />
    </FormSection>
  );
}

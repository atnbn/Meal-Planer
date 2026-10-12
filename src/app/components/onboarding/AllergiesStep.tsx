import { InfoIcon } from "@/app/components/ui/icons";
import { DEFAULT_ALLERGIES, DEFAULT_EXCLUSIONS } from "@/lib/onboarding/constants";
import { getImpliedExclusions } from "@/lib/onboarding/form";

import { EntryPicker } from "./EntryPicker";
import { fieldId, type StepProps } from "./types";

type AllergiesStepProps = StepProps & {
  customAllergies: string[];
  customExclusions: string[];
  onAddAllergy: (value: string) => void;
  onAddExclusion: (value: string) => void;
};

const unique = (items: readonly string[]) => [...new Set(items)];

export function AllergiesStep({
  form,
  errors,
  setField,
  customAllergies,
  customExclusions,
  onAddAllergy,
  onAddExclusion,
}: AllergiesStepProps) {
  const implied = getImpliedExclusions(form.diet);
  const exclusionOptions = unique([...DEFAULT_EXCLUSIONS, ...customExclusions]).filter(
    (item) => !implied.includes(item),
  );

  const toggle = (key: "allergies" | "blacklist", item: string) =>
    setField(
      key,
      form[key].includes(item) ? form[key].filter((entry) => entry !== item) : [...form[key], item],
    );

  return (
    <div className="space-y-8">
      <EntryPicker
        name="allergies"
        inputId={fieldId("allergies")}
        legend="Allergien & Unverträglichkeiten"
        description="Diese Zutaten tauchen garantiert nicht auf."
        inputLabel="Eigene Allergie"
        placeholder="Weitere, z. B. Sesam"
        options={unique([...DEFAULT_ALLERGIES, ...customAllergies])}
        selected={form.allergies}
        onToggle={(item) => toggle("allergies", item)}
        onAdd={onAddAllergy}
        error={errors.allergies}
      />

      <div className="h-px bg-line" aria-hidden="true" />

      <EntryPicker
        name="blacklist"
        inputId={fieldId("blacklist")}
        legend="Was magst du nicht?"
        description="Wir lassen es weg, so gut es geht."
        inputLabel="Eigener Ausschluss"
        placeholder="Weitere, z. B. Koriander"
        options={exclusionOptions}
        selected={form.blacklist}
        onToggle={(item) => toggle("blacklist", item)}
        onAdd={onAddExclusion}
        error={errors.blacklist}
      />

      {implied.length > 0 ? (
        <p className="flex items-start gap-2 rounded-card bg-surface-muted p-4 text-sm text-fg-muted">
          <InfoIcon size={18} className="mt-0.5 shrink-0 text-brand-600" />
          <span>
            Durch deine Ernährungsweise ({form.diet}) schließen wir {implied.join(", ")} bereits
            automatisch aus.
          </span>
        </p>
      ) : null}
    </div>
  );
}

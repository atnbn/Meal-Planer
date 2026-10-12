import type { FieldErrors, FieldKey, FormState } from "@/lib/onboarding/form";

export type SetField = <K extends FieldKey>(key: K, value: FormState[K]) => void;

export type StepProps = {
  form: FormState;
  errors: FieldErrors;
  setField: SetField;
};

export const fieldId = (key: FieldKey) => `field-${key}`;
export const messageId = (key: FieldKey) => `field-${key}-message`;

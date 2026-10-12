"use client";

import { useId, useState } from "react";

import { Button } from "@/app/components/ui/Button";
import { Chip } from "@/app/components/ui/Chip";
import { FieldMessage } from "@/app/components/ui/FieldMessage";
import { PlusIcon } from "@/app/components/ui/icons";
import { LIMITS } from "@/lib/onboarding/constants";
import { resolveCustomEntry } from "@/lib/onboarding/form";

type EntryPickerProps = {
  name: string;
  legend: string;
  description?: string;
  inputLabel: string;
  placeholder: string;
  options: readonly string[];
  selected: readonly string[];
  onToggle: (item: string) => void;
  onAdd: (item: string) => void;
  error?: string;
  inputId?: string;
};

/** Chip multi-select with an inline field for custom entries. */
export function EntryPicker({
  name,
  legend,
  description,
  inputLabel,
  placeholder,
  options,
  selected,
  onToggle,
  onAdd,
  error,
  inputId,
}: EntryPickerProps) {
  const generatedId = useId();
  const id = inputId ?? `${generatedId}-input`;
  const [draft, setDraft] = useState("");
  const [inputError, setInputError] = useState<string | undefined>();
  const limitReached = selected.length >= LIMITS.customEntry.maxItems;

  const add = () => {
    if (!draft.trim()) {
      return;
    }
    const result = resolveCustomEntry(draft, options);
    if (!result.ok) {
      setInputError(result.error);
      return;
    }
    if (selected.includes(result.value)) {
      setInputError(`„${result.value}“ ist bereits ausgewählt.`);
      return;
    }
    onAdd(result.value);
    setDraft("");
    setInputError(undefined);
  };

  const shownError = inputError ?? error;
  const messageId = `${id}-message`;

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold text-fg">{legend}</legend>
      {description ? <p className="mt-0.5 text-sm text-fg-muted">{description}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option}
            name={name}
            label={option}
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
          />
        ))}
      </div>

      <div className="mt-4">
        <label htmlFor={id} className="sr-only">
          {inputLabel}
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            type="text"
            value={draft}
            maxLength={LIMITS.customEntry.maxLength}
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="done"
            disabled={limitReached}
            aria-invalid={shownError ? true : undefined}
            aria-describedby={messageId}
            onChange={(event) => {
              setDraft(event.target.value);
              setInputError(undefined);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                // Enter adds the entry instead of submitting the step.
                event.preventDefault();
                add();
              }
            }}
            className="h-11 min-w-0 flex-1 rounded-control border border-dashed border-line-strong bg-surface px-4 text-[0.9375rem] text-fg shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-fg-subtle/80 hover:border-brand-300 focus:border-solid focus:border-brand-500 focus:shadow-[0_0_0_4px_var(--color-brand-100)] disabled:opacity-50"
          />
          <Button
            variant="secondary"
            onClick={add}
            disabled={!draft.trim() || limitReached}
            leadingIcon={<PlusIcon size={16} />}
            aria-label={`${inputLabel} hinzufügen`}
          >
            <span className="hidden sm:inline">Hinzufügen</span>
          </Button>
        </div>
        <FieldMessage
          id={messageId}
          error={shownError}
          hint={
            limitReached
              ? `Maximal ${LIMITS.customEntry.maxItems} Einträge.`
              : "Mit Enter hinzufügen."
          }
        />
      </div>
    </fieldset>
  );
}

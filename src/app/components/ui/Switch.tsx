import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SwitchProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
};

export function Switch({ id, checked, onChange, label, description }: SwitchProps) {
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <label
      htmlFor={id}
      className="focus-ring-within flex cursor-pointer items-center justify-between gap-4 rounded-card border border-line bg-surface p-4 shadow-xs transition-colors hover:border-brand-300 sm:p-5"
    >
      <span className="flex flex-col gap-1">
        <span className="text-[0.9375rem] font-semibold text-fg">{label}</span>
        {description ? (
          <span id={descriptionId} className="text-sm text-fg-muted">
            {description}
          </span>
        ) : null}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        aria-checked={checked}
        aria-describedby={descriptionId}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300",
          checked ? "bg-brand-600" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "size-6 rounded-full bg-white shadow-card transition-transform duration-300 ease-(--ease-spring)",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </label>
  );
}

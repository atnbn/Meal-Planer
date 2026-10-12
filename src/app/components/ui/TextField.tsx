import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { describedBy, FieldMessage } from "./FieldMessage";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  id: string;
  label: ReactNode;
  unit?: string;
  hint?: string;
  error?: string;
  labelClassName?: string;
};

export function TextField({
  id,
  label,
  unit,
  hint,
  error,
  className,
  labelClassName,
  ...inputProps
}: TextFieldProps) {
  const messageId = `${id}-message`;

  return (
    <div className={className}>
      <label htmlFor={id} className={cn("mb-2 block text-sm font-medium text-fg", labelClassName)}>
        {label}
      </label>
      <div
        className={cn(
          "group/field relative flex items-center rounded-control border bg-surface shadow-xs transition-[border-color,box-shadow] duration-200",
          "focus-within:border-brand-500 focus-within:shadow-[0_0_0_4px_var(--color-brand-100)]",
          error
            ? "border-danger/70 focus-within:border-danger focus-within:shadow-[0_0_0_4px_var(--color-danger-soft)]"
            : "border-line-strong hover:border-brand-300",
        )}
      >
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(messageId, error, hint)}
          className="h-12 w-full min-w-0 rounded-control bg-transparent px-4 text-base font-medium tabular-nums text-fg outline-none placeholder:font-normal placeholder:text-fg-subtle/80"
          {...inputProps}
        />
        {unit ? (
          <span
            aria-hidden="true"
            className="pointer-events-none pr-4 text-sm font-medium text-fg-subtle"
          >
            {unit}
          </span>
        ) : null}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
}

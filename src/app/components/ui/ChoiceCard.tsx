import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { CheckIcon } from "./icons";

type ChoiceCardProps = {
  id?: string;
  type?: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  meta?: ReactNode;
  invalid?: boolean;
  describedById?: string;
  layout?: "row" | "stacked";
  className?: string;
};

/**
 * Selectable card backed by a native radio/checkbox, so keyboard behaviour
 * (arrow keys within radio groups, space to toggle) and semantics come for free.
 */
export function ChoiceCard({
  id,
  type = "radio",
  name,
  value,
  checked,
  onChange,
  title,
  description,
  icon,
  meta,
  invalid,
  describedById,
  layout = "row",
  className,
}: ChoiceCardProps) {
  return (
    <label
      data-checked={checked || undefined}
      className={cn(
        "group/card focus-ring-within relative flex cursor-pointer gap-4 rounded-card border bg-surface p-4 text-left shadow-xs sm:p-5",
        "transition-[border-color,background-color,box-shadow,transform] duration-300 ease-(--ease-out-expo)",
        "hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card active:translate-y-0 active:scale-[0.99]",
        "data-checked:border-brand-500 data-checked:bg-brand-50/70 data-checked:shadow-[0_0_0_1px_var(--color-brand-500),var(--shadow-card)]",
        invalid && !checked ? "border-danger/60" : "border-line",
        layout === "stacked" ? "flex-col" : "items-start",
        className,
      )}
    >
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        aria-describedby={describedById}
        className="sr-only"
      />
      {icon ? (
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-[0.9rem] transition-colors duration-300",
            "bg-surface-sunken text-fg-muted group-hover/card:bg-brand-100 group-hover/card:text-brand-700",
            "group-data-checked/card:bg-brand-solid group-data-checked/card:text-on-brand",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-1 pr-7">
        <span className="text-[0.9375rem] font-semibold leading-snug text-fg">{title}</span>
        {description ? (
          <span className="text-sm leading-relaxed text-fg-muted">{description}</span>
        ) : null}
        {meta}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-4 top-4 flex size-5 items-center justify-center border transition-all duration-300 sm:right-5 sm:top-5",
          type === "radio" ? "rounded-full" : "rounded-md",
          "border-line-strong bg-surface",
          "group-data-checked/card:border-brand-solid group-data-checked/card:bg-brand-solid group-data-checked/card:text-on-brand",
        )}
      >
        {checked ? <CheckIcon size={12} strokeWidth={3} className="animate-pop" /> : null}
      </span>
    </label>
  );
}

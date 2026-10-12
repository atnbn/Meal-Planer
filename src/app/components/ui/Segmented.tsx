import { cn } from "@/lib/cn";

type SegmentedOption<T extends string | number> = {
  value: T;
  label: string;
  ariaLabel?: string;
};

type SegmentedProps<T extends string | number> = {
  id?: string;
  name: string;
  value: T | "";
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  invalid?: boolean;
  describedById?: string;
  className?: string;
  /** Overrides the default single-row layout, e.g. "grid-cols-2 sm:grid-cols-4". */
  columnsClassName?: string;
};

/** Pill-style radio group. Render inside a <fieldset> with a <legend> for an accessible name. */
export function Segmented<T extends string | number>({
  id,
  name,
  value,
  options,
  onChange,
  invalid,
  describedById,
  className,
  columnsClassName,
}: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        "grid gap-1 rounded-[1rem] border bg-surface-sunken p-1",
        invalid ? "border-danger/60" : "border-line",
        columnsClassName,
        className,
      )}
      style={
        columnsClassName
          ? undefined
          : { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }
      }
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <label
            key={String(option.value)}
            data-checked={checked || undefined}
            className={cn(
              "focus-ring-within relative flex h-11 cursor-pointer items-center justify-center rounded-[0.75rem] px-2 text-center text-sm font-semibold tabular-nums",
              "text-fg-muted transition-[background-color,color,box-shadow] duration-200 hover:text-fg",
              "data-checked:bg-surface data-checked:text-brand-700 data-checked:shadow-card",
            )}
          >
            <input
              id={index === 0 ? id : undefined}
              type="radio"
              name={name}
              value={String(option.value)}
              checked={checked}
              onChange={() => onChange(option.value)}
              aria-label={option.ariaLabel}
              aria-describedby={describedById}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

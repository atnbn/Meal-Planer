import { cn } from "@/lib/cn";
import type { Targets } from "@/lib/onboarding/form";

const MACROS = [
  { key: "targetProtein", label: "Protein", kcalPerGram: 4, color: "bg-macro-protein" },
  { key: "targetCarbs", label: "Kohlenhydrate", kcalPerGram: 4, color: "bg-macro-carbs" },
  { key: "targetFat", label: "Fett", kcalPerGram: 9, color: "bg-macro-fat" },
] as const;

const format = (value: number) => Math.round(value).toLocaleString("de-DE");

type MacroBarProps = {
  targets: Targets;
  variant?: "compact" | "full";
  caption?: string;
  className?: string;
};

/** Daily calories plus a stacked bar showing the energy split between macros. */
export function MacroBar({ targets, variant = "full", caption = "kcal / Tag", className }: MacroBarProps) {
  const total = MACROS.reduce(
    (sum, macro) => sum + targets[macro.key] * macro.kcalPerGram,
    0,
  );

  const shares = MACROS.map((macro) => ({
    ...macro,
    grams: targets[macro.key],
    share: total > 0 ? (targets[macro.key] * macro.kcalPerGram) / total : 0,
  }));

  return (
    <div className={className}>
      <p className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-semibold tabular-nums tracking-tight text-fg",
            variant === "full" ? "text-4xl sm:text-5xl" : "text-3xl",
          )}
        >
          {format(targets.targetCalories)}
        </span>
        <span className="text-sm font-medium text-fg-muted">{caption}</span>
      </p>

      <div
        className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-sunken"
        role="img"
        aria-label={shares
          .map((macro) => `${macro.label} ${Math.round(macro.share * 100)} Prozent`)
          .join(", ")}
      >
        {shares.map((macro) => (
          <span
            key={macro.key}
            className={cn("h-full transition-[width] duration-700 ease-(--ease-out-expo)", macro.color)}
            style={{ width: `${macro.share * 100}%` }}
          />
        ))}
      </div>

      <dl
        className={cn(
          "mt-4 grid grid-cols-3 gap-2",
          variant === "full" && "sm:gap-3",
        )}
      >
        {shares.map((macro) => (
          <div
            key={macro.key}
            className={cn(variant === "full" && "rounded-[0.9rem] bg-surface-muted p-3")}
          >
            <dt className="flex items-center gap-1.5 text-xs font-medium text-fg-muted">
              <span aria-hidden="true" className={cn("size-2 rounded-full", macro.color)} />
              <span className="truncate">{macro.label}</span>
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-fg">
              {format(macro.grams)}
              <span className="ml-0.5 text-xs font-medium text-fg-muted">g</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

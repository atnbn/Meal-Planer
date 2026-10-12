import { cn } from "@/lib/cn";

import { CheckIcon, PlusIcon } from "./icons";

type ChipProps = {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
};

/** Toggleable chip backed by a native checkbox. */
export function Chip({ name, label, checked, onChange }: ChipProps) {
  return (
    <label
      data-checked={checked || undefined}
      className={cn(
        "group/chip focus-ring-within inline-flex h-10 cursor-pointer select-none items-center gap-1.5 rounded-full border pl-3 pr-4 text-sm font-medium",
        "transition-[background-color,border-color,color,transform] duration-200 active:scale-95",
        "border-line-strong bg-surface text-fg-muted hover:border-brand-300 hover:text-fg",
        "data-checked:border-brand-solid data-checked:bg-brand-solid data-checked:text-on-brand data-checked:hover:bg-brand-solid-hover",
      )}
    >
      <input
        type="checkbox"
        name={name}
        value={label}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {checked ? (
        <CheckIcon size={15} strokeWidth={2.5} className="animate-pop" />
      ) : (
        <PlusIcon size={15} strokeWidth={2} className="text-fg-subtle" />
      )}
      {label}
    </label>
  );
}

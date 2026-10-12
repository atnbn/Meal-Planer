"use client";

import { useEffect, useMemo, useState } from "react";

import { CheckIcon, RotateCcwIcon, ShoppingCartIcon } from "@/app/components/ui/icons";
import { SHOPPING_STORAGE_KEY, type ShoppingItem } from "@/lib/plan";

type ShoppingListProps = {
  items: readonly ShoppingItem[];
  /** Remember ticked items for this tab (off for the demo plan). */
  persist?: boolean;
};

const loadChecked = (persist: boolean): Set<string> => {
  if (!persist) return new Set();
  try {
    const raw = sessionStorage.getItem(SHOPPING_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []);
  } catch {
    return new Set();
  }
};

export function ShoppingList({ items, persist = false }: ShoppingListProps) {
  const [checked, setChecked] = useState(() => loadChecked(persist));

  useEffect(() => {
    if (!persist) return;
    try {
      sessionStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify([...checked]));
    } catch {
      // Ignore – ticking items still works for this page view.
    }
  }, [checked, persist]);

  const groups = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>();
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "de"));
  }, [items]);

  // Only count ticks that still exist after a meal swap changed the list.
  const doneCount = items.filter((item) => checked.has(item.name)).length;
  const progress = items.length > 0 ? doneCount / items.length : 0;

  const toggle = (name: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <section
      id="einkaufsliste"
      aria-labelledby="shopping-title"
      className="reveal scroll-mt-36 rounded-panel border border-line bg-surface p-6 shadow-card sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-[0.9rem] bg-brand-50 text-brand-700">
            <ShoppingCartIcon size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Für die ganze Woche</p>
            <h2 id="shopping-title" className="text-xl font-semibold tracking-tight text-fg">
              Einkaufsliste
            </h2>
          </div>
        </div>
        {doneCount > 0 ? (
          <button
            type="button"
            onClick={() => setChecked(new Set())}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg"
          >
            <RotateCcwIcon size={14} />
            Zurücksetzen
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-fg-muted" aria-live="polite">
            <span className="font-semibold tabular-nums text-fg">{doneCount}</span> von{" "}
            <span className="tabular-nums">{items.length}</span> erledigt
          </span>
          {doneCount === items.length && items.length > 0 ? (
            <span className="inline-flex animate-pop items-center gap-1 text-sm font-semibold text-success">
              <CheckIcon size={14} strokeWidth={2.75} />
              Alles im Korb
            </span>
          ) : null}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-(--ease-out-expo)"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {groups.map(([category, categoryItems]) => (
          <fieldset key={category} className="min-w-0">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-fg-subtle">
              {category}
            </legend>
            <ul className="space-y-0.5">
              {categoryItems.map((item) => {
                const isChecked = checked.has(item.name);
                return (
                  <li key={`${item.name}-${item.amount}`}>
                    <label className="group/item focus-ring-within flex cursor-pointer items-center gap-3 rounded-[0.7rem] px-2 py-1.5 transition-colors hover:bg-surface-muted">
                      <span className="relative flex size-5 shrink-0 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(item.name)}
                          className="peer size-5 cursor-pointer appearance-none rounded-md border-[1.5px] border-fg-subtle bg-surface transition-colors checked:border-brand-solid checked:bg-brand-solid focus-visible:outline-none"
                        />
                        <CheckIcon
                          size={13}
                          strokeWidth={3}
                          className="pointer-events-none absolute scale-50 text-on-brand opacity-0 transition-[opacity,transform] duration-200 ease-(--ease-spring) peer-checked:scale-100 peer-checked:opacity-100"
                        />
                      </span>
                      <span
                        className={
                          isChecked
                            ? "min-w-0 flex-1 text-sm text-fg-subtle line-through decoration-fg-subtle/60"
                            : "min-w-0 flex-1 text-sm text-fg"
                        }
                      >
                        {item.name}
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-fg-muted">{item.amount}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>
    </section>
  );
}

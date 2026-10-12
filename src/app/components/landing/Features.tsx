import type { ReactNode } from "react";

import {
  BoxIcon,
  CheckIcon,
  FlameIcon,
  LockIcon,
  RefreshIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  WalletIcon,
  XIcon,
} from "@/app/components/ui/icons";
import { MacroBar } from "@/app/components/ui/MacroBar";
import { cn } from "@/lib/cn";

import { SectionHeading } from "./SectionHeading";

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
  visual?: ReactNode;
  className: string;
};

const FEATURES: Feature[] = [
  {
    title: "Makrogenau berechnet",
    description:
      "Dein Bedarf wird nach Mifflin-St Jeor aus Alter, Größe, Gewicht und Aktivität berechnet – und live angezeigt, während du tippst.",
    icon: <FlameIcon size={20} />,
    className: "md:col-span-4",
    visual: (
      <MacroBar
        variant="full"
        className="mt-6 rounded-card border border-line bg-surface p-5 shadow-xs"
        targets={{ targetCalories: 2480, targetProtein: 165, targetCarbs: 270, targetFat: 80 }}
      />
    ),
  },
  {
    title: "Gericht tauschen",
    description: "Keine Lust auf Lachs? Ein Klick – und ein neues Gericht mit fast identischen Makros ersetzt es.",
    icon: <RefreshIcon size={20} />,
    className: "md:col-span-2",
    visual: (
      <div className="relative mt-6 h-28">
        <div className="absolute inset-x-6 top-0 rounded-[0.9rem] border border-line bg-surface-muted px-4 py-3 text-sm text-fg-subtle line-through">
          Lachs mit Kartoffeln
        </div>
        <div className="absolute inset-x-0 top-10 flex items-center gap-3 rounded-[0.9rem] border border-brand-300 bg-surface px-4 py-3 text-sm font-semibold text-fg shadow-card transition-transform duration-500 ease-(--ease-spring) group-hover/feature:-translate-y-1">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-solid text-on-brand">
            <RefreshIcon size={13} />
          </span>
          Tofu-Bowl mit Erdnuss
        </div>
      </div>
    ),
  },
  {
    title: "Meal Prep inklusive",
    description: "Gerichte, die sich vorkochen lassen, sind markiert und als Batch zusammengefasst.",
    icon: <BoxIcon size={20} />,
    className: "md:col-span-2",
    visual: (
      <div className="mt-6 flex flex-wrap gap-1.5">
        {["Mo", "Di", "Mi", "Do"].map((day) => (
          <span key={day} className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
            {day}
          </span>
        ))}
        <span className="rounded-full border border-dashed border-line-strong px-3 py-1 text-xs text-fg-subtle">
          1× kochen
        </span>
      </div>
    ),
  },
  {
    title: "Einkaufsliste, fertig sortiert",
    description: "Alle Zutaten der Woche – zusammengerechnet, nach Kategorie sortiert und abhakbar.",
    icon: <ShoppingCartIcon size={20} />,
    className: "md:col-span-2",
    visual: (
      <ul className="mt-6 space-y-1.5 text-sm">
        {[
          ["Haferflocken", "320 g", true],
          ["Brokkoli", "1,4 kg", false],
        ].map(([name, amount, done]) => (
          <li key={String(name)} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-[0.3rem] border",
                done ? "border-brand-solid bg-brand-solid text-on-brand" : "border-fg-subtle",
              )}
            >
              {done ? <CheckIcon size={10} strokeWidth={3} /> : null}
            </span>
            <span className={cn("flex-1", done ? "text-fg-subtle line-through" : "text-fg")}>{name}</span>
            <span className="tabular-nums text-fg-muted">{amount}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Allergien & Abneigungen",
    description: "Was du nicht verträgst oder nicht magst, landet garantiert nicht auf dem Teller.",
    icon: <ShieldCheckIcon size={20} />,
    className: "md:col-span-2",
    visual: (
      <div className="mt-6 flex flex-wrap gap-1.5">
        {["Nüsse", "Laktose", "Pilze"].map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-3 py-1 text-xs font-semibold text-danger"
          >
            <XIcon size={11} strokeWidth={3} />
            {item}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Budget im Blick",
    description:
      "Lege fest, wie viel du pro Tag ausgeben willst. Der Plan setzt auf passende Zutaten – von günstig bis gönnen.",
    icon: <WalletIcon size={20} />,
    className: "md:col-span-3",
    visual: (
      <div className="mt-6">
        <div className="flex justify-between text-xs text-fg-subtle">
          <span>3 €</span>
          <span className="font-semibold text-fg">8 € / Tag</span>
          <span>20 €</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-brand-100">
          <div className="relative h-full w-[30%] rounded-full bg-brand-500">
            <span className="absolute -right-2.5 -top-1.5 size-5 rounded-full border-2 border-brand-600 bg-surface shadow-brand" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Privat by Design",
    description:
      "Kein Konto, kein Tracking. Deine Angaben bleiben in diesem Browser-Tab und werden nur zur Planerstellung verwendet.",
    icon: <LockIcon size={20} />,
    className: "md:col-span-3",
    visual: (
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted shadow-xs">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        Lokal gespeichert · sessionStorage
      </div>
    ),
  },
];

export function Features() {
  return (
    <section id="funktionen" aria-labelledby="features-title" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <SectionHeading
        id="features-title"
        eyebrow="Funktionen"
        title="Alles, was ein guter Wochenplan braucht."
        description="Keine Tabellen, keine Rechnerei. Meal Planner nimmt dir die Planung ab – und lässt dir trotzdem die Kontrolle."
      />

      <ul className="mt-12 grid gap-4 md:grid-cols-6">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className={cn(
              "group/feature reveal relative flex flex-col overflow-hidden rounded-panel border border-line bg-surface-muted p-6 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-card sm:p-7",
              feature.className,
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-[0.9rem] bg-surface text-brand-700 shadow-xs ring-1 ring-line transition-transform duration-500 ease-(--ease-spring) group-hover/feature:-rotate-6 group-hover/feature:scale-105">
              {feature.icon}
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-fg">{feature.title}</h3>
            <p className="mt-1.5 max-w-prose text-pretty text-sm leading-relaxed text-fg-muted">{feature.description}</p>
            {feature.visual ? (
              <div aria-hidden="true" className="mt-auto">
                {feature.visual}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

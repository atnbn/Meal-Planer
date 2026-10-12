import Link from "next/link";

import { BrandMark } from "@/app/components/ui/BrandMark";

const LINKS = [
  { href: "/onboarding", label: "Plan erstellen" },
  { href: "/plan/demo", label: "Beispielplan" },
  { href: "/#funktionen", label: "Funktionen" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <BrandMark />
          <p className="mt-4 text-sm leading-relaxed text-fg-muted">
            Persönliche Wochenpläne mit Makros, Meal Prep und Einkaufsliste. Die Angaben sind Richtwerte und
            ersetzen keine medizinische Beratung.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-fg-muted transition-colors hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-fg-subtle sm:px-6">
          © {new Date().getFullYear()} Meal Planner · Gebaut mit Next.js, React und Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}

import { ChevronDownIcon } from "@/app/components/ui/icons";

import { SectionHeading } from "./SectionHeading";

const FAQ = [
  {
    question: "Ist Meal Planner kostenlos?",
    answer: "Ja. Du kannst so viele Pläne erstellen, wie du möchtest – ohne Abo und ohne versteckte Kosten.",
  },
  {
    question: "Brauche ich ein Konto?",
    answer:
      "Nein. Du startest direkt. Dein Fortschritt im Onboarding und dein fertiger Plan werden nur in diesem Browser-Tab gespeichert.",
  },
  {
    question: "Was passiert mit meinen Daten?",
    answer:
      "Deine Angaben werden ausschließlich zur Erstellung deines Plans an unseren Server und das dahinterliegende KI-Modell übermittelt – ohne Namen, ohne Konto und ohne dauerhafte Speicherung bei uns. Im Browser liegen sie nur in diesem Tab.",
  },
  {
    question: "Wie genau sind die Kalorien- und Makroangaben?",
    answer:
      "Der Bedarf wird mit der Mifflin-St-Jeor-Formel und deinem Aktivitätslevel berechnet. Das sind gute Richtwerte, aber keine medizinische Beratung – bei Vorerkrankungen sprich bitte mit Ärztin, Arzt oder Ernährungsfachkraft.",
  },
  {
    question: "Funktioniert das auch vegetarisch oder vegan?",
    answer:
      "Ja. Du wählst deine Ernährungsweise im Onboarding, zusätzlich kannst du Allergien und einzelne Lebensmittel ausschließen.",
  },
  {
    question: "Kann ich einzelne Gerichte austauschen?",
    answer:
      "Jederzeit. Ein Klick auf das Tausch-Symbol ersetzt ein Gericht durch eine Alternative mit ähnlichen Makros – die Einkaufsliste wird automatisch angepasst.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 sm:px-6">
      <SectionHeading id="faq-title" eyebrow="FAQ" title="Häufige Fragen" />

      <div className="reveal mt-12 divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface shadow-card">
        {FAQ.map((item, index) => (
          <details key={item.question} name="faq" open={index === 0} className="group/faq">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-fg transition-colors hover:bg-surface-muted sm:px-7 [&::-webkit-details-marker]:hidden">
              {item.question}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-fg-muted transition-[transform,background-color,color] duration-300 ease-(--ease-out-expo) group-open/faq:rotate-180 group-open/faq:bg-brand-50 group-open/faq:text-brand-700">
                <ChevronDownIcon size={16} />
              </span>
            </summary>
            <p className="px-6 pb-6 text-pretty leading-relaxed text-fg-muted sm:px-7">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

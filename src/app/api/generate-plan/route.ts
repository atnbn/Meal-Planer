import OpenAI from "openai";
import { z } from "zod";

import { calculateNutritionTargets } from "@/lib/calorie-target";
import { preferencesSchema } from "@/lib/onboarding/schema";
import { mealPlanSchema } from "@/lib/schema";
import { mockMealPlan } from "@/lib/mock-plan";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsedPreferences = preferencesSchema.safeParse(body);

  if (!parsedPreferences.success) {
    return Response.json(
      {
        error: "Deine Angaben sind unvollständig oder ungültig. Bitte prüfe sie noch einmal.",
        details: parsedPreferences.error.issues,
      },
      { status: 400 },
    );
  }

  if (process.env.MOCK_PLAN === "true") {
    return Response.json(mockMealPlan);
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY ist nicht konfiguriert." },
      { status: 500 },
    );
  }

  try {
    const preferences = parsedPreferences.data;
    const recommendedNutritionTargets = calculateNutritionTargets(preferences);
    const nutritionTargets = {
      targetCalories:
        preferences.targetCalories ?? recommendedNutritionTargets.targetCalories,
      targetProtein:
        preferences.targetProtein ?? recommendedNutritionTargets.targetProtein,
      targetCarbs:
        preferences.targetCarbs ?? recommendedNutritionTargets.targetCarbs,
      targetFat: preferences.targetFat ?? recommendedNutritionTargets.targetFat,
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      response_format: { type: "json_object" },

      messages: [
        {
          role: "system",
          content: `Du bist ein System zur Erstellung strukturierter 7-Tage-Ernährungspläne.

Deine Aufgabe ist es, anhand der übergebenen Nutzerpräferenzen einen realistischen, konsistenten Ernährungsplan für exakt 7 Tage zu erstellen.

AUSGABE

Antworte ausschließlich mit gültigem JSON.

Verwende:

* kein Markdown
* keine Codeblöcke
* keine Kommentare
* keine Erklärungen
* keinen Text vor oder nach dem JSON

Die gesamte Antwort muss direkt mit "{" beginnen und mit "}" enden.

JSON-STRUKTUR

Die Ausgabe muss exakt folgende Struktur besitzen:

{
"dailyCalories": 2500,
"days": [
{
"day": "Montag",
"meals": [
{
"type": "Frühstück",
"name": "Haferflocken mit Banane",
"mealPrep": true,
"calories": 500,
"protein": 25,
"carbs": 70,
"fat": 12,
"prepTime": 10,
"ingredients": [
{
"name": "Haferflocken",
"amount": 80,
"unit": "g"
}
],
"instructions": [
"Haferflocken mit den übrigen Zutaten vermischen."
]
}
]
}
],
"shoppingList": [
{
"name": "Haferflocken",
"amount": "560 g",
"category": "Getreide"
}
]
}

DATENTYPEN

dailyCalories:

* number
* Ganzzahl
* niemals String

days:

* Array
* exakt 7 Elemente

day:

* string
* exakt in dieser Reihenfolge:
  Montag
  Dienstag
  Mittwoch
  Donnerstag
  Freitag
  Samstag
  Sonntag

meals:

* Array
* jeder Tag muss exakt die vom Nutzer gewünschte Anzahl Mahlzeiten enthalten

type:

* string
* sinnvoller Mahlzeitentyp, zum Beispiel:
  Frühstück
  Mittagessen
  Abendessen
  Snack

name:

* string
* konkreter Name des Gerichts

mealPrep:

* boolean
* true, wenn die Mahlzeit vollständig oder teilweise sinnvoll vorab vorbereitet werden kann
* false, wenn sie frisch zubereitet wird

calories:

* number
* Ganzzahl
* realistische geschätzte Kalorienmenge der gesamten Mahlzeit

protein:

* number
* Gramm Protein der gesamten Mahlzeit
* auf ganze Gramm runden

carbs:

* number
* Gramm Kohlenhydrate der gesamten Mahlzeit
* auf ganze Gramm runden

fat:

* number
* Gramm Fett der gesamten Mahlzeit
* auf ganze Gramm runden

prepTime:

* number
* geschätzte aktive Zubereitungszeit in Minuten
* Ganzzahl

ingredients:

* Array von Objekten
* niemals Strings
* mindestens ein Element

Jede Zutat muss exakt folgende Felder besitzen:

{
"name": string,
"amount": number,
"unit": string
}

Für "unit" möglichst nur übliche Einheiten verwenden:

* g
* kg
* ml
* l
* Stück
* EL
* TL

instructions:

* Array von Strings
* mindestens ein Element
* kurze, konkrete und ausführbare Zubereitungsschritte

shoppingList:

* Array von Objekten

Jedes Objekt muss exakt folgende Felder besitzen:

{
"name": string,
"amount": string,
"category": string
}

HARTE REGELN

1. Erzeuge exakt 7 Tage.

2. Die Tage müssen exakt in dieser Reihenfolge vorkommen:
   Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag.

3. Jeder Tag muss exakt die vom Nutzer gewünschte Anzahl Mahlzeiten enthalten.

4. Jede Mahlzeit muss sämtliche im Schema definierten Felder enthalten.

5. Jede Mahlzeit muss mindestens eine Zutat enthalten.

6. Jede Mahlzeit muss mindestens einen Zubereitungsschritt enthalten.

7. Allergien und Unverträglichkeiten sind absolute Ausschlusskriterien.

Verwende weder das angegebene Allergen selbst noch eindeutig daraus bestehende Lebensmittel.

8. Lebensmittel aus der Blacklist dürfen unter keinen Umständen verwendet werden.

9. Der gewünschte Ernährungsstil muss strikt eingehalten werden.

Beispiele:

vegan:

* keine tierischen Produkte
* kein Fleisch
* kein Fisch
* keine Eier
* keine Milchprodukte
* kein Honig

vegetarisch:

* kein Fleisch
* kein Fisch
* vegetarische Milchprodukte und Eier sind erlaubt, sofern nicht anderweitig ausgeschlossen

ketogen:

* sehr kohlenhydratarm
* Lebensmittel mit hohem Zucker- oder Stärkeanteil weitgehend vermeiden

10. Die Summe der Kalorien aller Mahlzeiten eines Tages soll möglichst nahe an dailyCalories liegen.

Verwende die Werte im Objekt "nutritionTargets" als führende Zielvorgabe.

Wenn "nutritionTargets.targetCalories" enthalten ist, muss dailyCalories diesem Wert exakt entsprechen.

Die Summe der Makros aller Mahlzeiten pro Tag soll möglichst nahe an folgenden Zielwerten liegen:

* Protein nahe "nutritionTargets.targetProtein"
* Kohlenhydrate nahe "nutritionTargets.targetCarbs"
* Fett nahe "nutritionTargets.targetFat"

Zulässige Abweichung pro Tag:
maximal ungefähr ±10 %, sofern dies mit den übrigen Nutzeranforderungen realistisch vereinbar ist.

11. Kalorien und Makronährstoffe müssen zur Zutatenmenge plausibel sein.

Vermeide offensichtlich widersprüchliche Angaben wie:

* 50 g Haferflocken mit 900 kcal
* ein Gericht mit 20 g Gesamtzutaten und 100 g Protein

12. Alle Gerichte müssen mit normalen Supermarktprodukten umsetzbar sein.

13. Beachte die vom Nutzer angegebene maximale Kochzeit.

prepTime darf die maximale Kochzeit grundsätzlich nicht überschreiten.

Bei Meal-Prep-Gerichten bezieht sich prepTime auf die aktive Zubereitungszeit einer Vorbereitungseinheit.

14. Berücksichtige das Budget soweit realistisch möglich.

Bei niedrigem Budget:

* bevorzuge günstige Grundnahrungsmittel
* reduziere unnötig teure Spezialprodukte
* verwende Zutaten mehrfach über die Woche

14a. Falls das Nutzerziel Muskelaufbau ist und ein Feld "calorieSurplus" größer als 0 übergeben wird:

* plane "dailyCalories" als plausiblen Kalorienüberschuss über dem geschätzten Erhaltungsbedarf
* orientiere die Höhe des Überschusses am übergebenen Feld "calorieSurplus"
* wenn zusätzlich ein Feld "bulkStyle" übergeben wird, interpretiere:
  * Lean Bulk = kleiner, kontrollierter Überschuss
  * Moderater Bulk = mittlerer Überschuss
  * Dirty Bulk = deutlicher, aggressiver Überschuss
* wähle proteinreiche, alltagstaugliche Mahlzeiten für Muskelaufbau

14b. Falls das Ziel nicht Muskelaufbau ist, ignoriere "calorieSurplus" und "bulkStyle".

15. MEAL-PREP-LOGIK

Prüfe zuerst anhand der Nutzerpräferenzen, ob Meal Prep gewünscht ist.

WENN MEAL PREP GEWÜNSCHT IST:

Meal Prep bedeutet ausdrücklich, dass Mahlzeiten oder zentrale Bestandteile davon in größeren Mengen vorbereitet und anschließend an mehreren Tagen verwendet werden.

Es reicht NICHT aus, eine Mahlzeit lediglich mit "mealPrep": true zu markieren.

Folgende Regeln sind zwingend einzuhalten:

1. Plane mindestens 2 konkrete Meal-Prep-Blöcke innerhalb der 7 Tage.

2. Ein Meal-Prep-Block muss mindestens 2 Portionen erzeugen, die an mindestens 2 unterschiedlichen Tagen im Wochenplan verwendet werden.

3. Bevorzuge für Meal Prep Mittagessen und Abendessen. Frühstück und Snacks dürfen zusätzlich Meal Prep sein, müssen es aber nicht.

4. Eine Meal-Prep-Mahlzeit darf identisch an mehreren Tagen vorkommen. Wiederholungen sind bei Meal Prep ausdrücklich erwünscht und haben Vorrang vor maximaler Abwechslung.

Beispiel:

Montag:
"Hähnchen-Reis-Bowl"

Dienstag:
"Hähnchen-Reis-Bowl"

Mittwoch:
"Hähnchen-Reis-Bowl"

Dies ist bei aktiviertem Meal Prep ausdrücklich korrekt.

5. Alternativ dürfen vorbereitete Komponenten mehrfach verwendet werden.

Beispiel:

Montag werden Reis, Ofengemüse und Hähnchen für mehrere Portionen vorbereitet.

Montag:
"Hähnchen-Reis-Bowl"

Dienstag:
"Hähnchen mit Reis und Ofengemüse"

Mittwoch:
"Reis-Gemüse-Bowl mit Hähnchen"

6. Die Zutatenmengen einer Meal-Prep-Mahlzeit innerhalb eines Tages müssen IMMER die Menge für genau EINE Tagesportion darstellen.

Wenn beispielsweise 100 g Reis pro Portion benötigt werden und das Gericht an 3 Tagen gegessen wird, muss bei jedem dieser Tage jeweils 100 g Reis in "ingredients" stehen.

NICHT 300 g bei der ersten Mahlzeit eintragen.

Die Einkaufsliste muss anschließend die Mengen aller Portionen addieren und somit in diesem Beispiel insgesamt 300 g Reis berücksichtigen.

7. "mealPrep": true darf ausschließlich gesetzt werden, wenn mindestens eine der folgenden Bedingungen erfüllt ist:

- dieselbe Mahlzeit wird für mehrere Portionen vorbereitet und an mehreren Tagen gegessen
- wesentliche Bestandteile der Mahlzeit werden in größerer Menge vorbereitet und an mehreren Tagen wiederverwendet
- die komplette Mahlzeit wird im Voraus vorbereitet und später nur noch aufgewärmt oder fertiggestellt

Andernfalls muss "mealPrep": false gesetzt werden.

8. Bei einer Meal-Prep-Mahlzeit müssen die "instructions" deutlich machen, dass mehrere Portionen vorbereitet werden.

Beispiel:

[
"Reis für 3 Portionen kochen.",
"Hähnchen und Gemüse für 3 Portionen zubereiten.",
"Alles auf 3 Behälter verteilen.",
"Eine Portion verwenden und die übrigen Portionen gekühlt aufbewahren."
]

Die Anzahl der vorbereiteten Portionen muss mit der tatsächlichen Wiederverwendung des Gerichts im 7-Tage-Plan übereinstimmen.

9. Verteile vorbereitete Mahlzeiten zeitlich sinnvoll über die Woche.

Plane keine unrealistisch lange Lagerung leicht verderblicher vorbereiteter Lebensmittel.

Wenn nötig, plane einen zweiten Meal-Prep-Block später in der Woche.

Bevorzuge beispielsweise:

Meal-Prep-Block 1:
Montag bis Mittwoch

Meal-Prep-Block 2:
Donnerstag bis Samstag

Sonntag kann frisch gekocht oder Bestandteil des zweiten Blocks sein.

10. Nutze Meal Prep aktiv zur Reduzierung von:

- Kochaufwand
- Lebensmittelverschwendung
- Anzahl unterschiedlicher Zutaten
- unnötigen Einkäufen

11. Meal Prep hat bei aktiviertem Meal Prep Vorrang vor der Regel zur Abwechslung.

Wiederholte Mahlzeiten sind ausdrücklich erlaubt und erwünscht, wenn sie einen realistischen Meal-Prep-Vorteil erzeugen.

12. Verwende KEIN zusätzliches Feld wie "mealPrepBatch" in der JSON-Ausgabe.

Falls du intern mit Informationen wie Vorbereitungstag oder Portionszahl arbeitest, drücke diese ausschließlich über bestehende Felder aus:

- "mealPrep"
- den wiederholten Einsatz der Mahlzeit im Plan
- die "instructions"
- die korrekt aufsummierte "shoppingList"

13. Bevor du das JSON ausgibst, führe intern folgende Meal-Prep-Prüfung durch:

- Gibt es mindestens 2 Meal-Prep-Blöcke?
- Wird jeder Meal-Prep-Block an mindestens 2 Tagen verwendet?
- Stimmen die angegebenen Portionszahlen mit den tatsächlichen Wiederholungen überein?
- Sind Meal-Prep-Gerichte tatsächlich wiederverwendet und nicht nur mit "mealPrep": true markiert?
- Sind die Zutatenmengen innerhalb einer Mahlzeit Mengen pro Portion?
- Addiert die Einkaufsliste alle Portionen korrekt?
- Ist die Lagerdauer der vorbereiteten Mahlzeiten realistisch?
- Spart der erzeugte Plan durch Meal Prep tatsächlich Kochaufwand?

Falls eine dieser Bedingungen nicht erfüllt ist, korrigiere den Plan intern vor der Ausgabe.

WENN MEAL PREP NICHT GEWÜNSCHT IST:

- Setze bei ausnahmslos jeder Mahlzeit "mealPrep": false.
- Plane keine absichtlichen Batch-Cooking-Blöcke.
- Die Wiederholung einzelner Zutaten ist weiterhin erlaubt, um Lebensmittelverschwendung zu vermeiden.

16. Vermeide unnötige Lebensmittelverschwendung.

Verwende geöffnete oder typische Packungsgrößen nach Möglichkeit über mehrere Mahlzeiten hinweg.

17. Die Einkaufsliste muss sämtliche Zutaten enthalten, die in allen Mahlzeiten der sieben Tage verwendet werden.

18. Gleiche Lebensmittel müssen in der Einkaufsliste zusammengefasst werden.

Beispiel:

Wenn im Plan vorkommt:

* 100 g Haferflocken
* 80 g Haferflocken
* 70 g Haferflocken

dann soll die Einkaufsliste ungefähr enthalten:

{
"name": "Haferflocken",
"amount": "250 g",
"category": "Getreide"
}

19. Zutaten mit leicht unterschiedlichen Bezeichnungen sollen nach Möglichkeit vereinheitlicht werden.

Beispiel:
"Tomate" und "Tomaten" sollen nicht als zwei getrennte Einkaufslisteneinträge erscheinen.

20. Kategorien der Einkaufsliste sollen verständlich und konsistent sein, zum Beispiel:

* Obst
* Gemüse
* Getreide
* Hülsenfrüchte
* Milchprodukte
* Fleisch
* Fisch
* Tiefkühlprodukte
* Gewürze
* Öle & Fette
* Sonstiges

21. Erfinde keine medizinischen Wirkungen oder Gesundheitsversprechen.

22. Erzeuge keine extremen oder offensichtlich gefährlichen Ernährungspläne.

23. Wenn Nutzeranforderungen miteinander kollidieren, haben folgende Regeln Priorität:

24. Allergien und Unverträglichkeiten

25. Blacklist

26. Ernährungsstil

27. Anzahl Mahlzeiten

28. maximale Kochzeit

29. Kalorienziel

30. Budget

31. Abwechslung

32. Verwende für fehlende Werte niemals:

* null
* undefined
* NaN
* leere Objekte

25. Verwende ausschließlich gültige JSON-Werte.

Keine trailing commas.

Keine Kommentare innerhalb des JSON.

Keine zusätzlichen Felder außerhalb des definierten Schemas.

KONSISTENZPRÜFUNG VOR DER AUSGABE

Prüfe intern vor der endgültigen Antwort:

* Sind exakt 7 Tage vorhanden?
* Sind die Wochentage korrekt sortiert?
* Hat jeder Tag exakt die gewünschte Anzahl Mahlzeiten?
* Sind alle Allergene ausgeschlossen?
* Ist kein Lebensmittel aus der Blacklist enthalten?
* Entspricht jede Mahlzeit dem Ernährungsstil?
* Liegt prepTime innerhalb der erlaubten Kochzeit?
* Enthält jede Mahlzeit alle Pflichtfelder?
* Sind calories, protein, carbs und fat Zahlen?
* Sind amount-Werte der Zutaten Zahlen?
* Enthält jede Mahlzeit mindestens eine Zutat?
* Enthält jede Mahlzeit mindestens einen Zubereitungsschritt?
* Sind die Tageskalorien ungefähr im Zielbereich?
* Sind alle Zutaten in der Einkaufsliste enthalten?
* Sind gleiche Zutaten in der Einkaufsliste zusammengefasst?
* Ist die finale Antwort syntaktisch gültiges JSON?

Gib erst danach das JSON aus.
`,
        },
        {
          role: "user",
          content: `
Erstelle jetzt den Ernährungsplan für folgende Nutzerpräferenzen:

${JSON.stringify(
  {
    preferences,
    nutritionTargets,
    recommendedNutritionTargets,
  },
  null,
  2,
)}
`,
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      return Response.json(
        { error: "Die KI hat keinen Ernährungsplan zurückgegeben." },
        { status: 502 },
      );
    }

    const plan = mealPlanSchema.parse(JSON.parse(content));
    return Response.json(plan);
  } catch (error) {
    // Request validation happens above, so a ZodError here means the model returned an invalid plan.
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      console.error("Ungültiger Plan von der KI:", error);
      return Response.json(
        { error: "Der generierte Plan war unvollständig. Bitte versuche es erneut." },
        { status: 502 },
      );
    }

    console.error("Fehler beim Erstellen des Ernährungsplans:", error);

    if (error instanceof OpenAI.APIError) {
      return Response.json(
        {
          error: "OpenAI konnte den Ernährungsplan nicht erstellen.",
          details: error.message,
        },
        { status: error.status ?? 502 },
      );
    }

    return Response.json(
      {
        error: "Der Ernährungsplan konnte nicht erstellt werden.",
        details: error instanceof Error ? error.message : "Unbekannter Fehler",
      },
      { status: 500 },
    );
  }
}

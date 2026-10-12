import OpenAI from "openai";
import { z } from "zod";

import { mealPlanSchema } from "@/lib/schema";

const mealSchema = mealPlanSchema.shape.days.element.shape.meals.element;
const requestSchema = z.object({
  meal: mealSchema,
  dayMeals: z.array(mealSchema),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mockMeal = (meal: z.infer<typeof mealSchema>) => ({
  ...meal,
  name: `${meal.type} Alternative`,
  ingredients: [
    { name: "Vollkornreis", amount: 100, unit: "g" },
    { name: "Gemüse-Mix", amount: 200, unit: "g" },
    { name: "Hähnchenbrust", amount: 150, unit: "g" },
  ],
  instructions: [
    "Reis nach Packungsanleitung zubereiten.",
    "Gemüse und Hähnchen garen und gemeinsam servieren.",
  ],
});

export async function POST(request: Request) {
  try {
    const { meal, dayMeals } = requestSchema.parse(await request.json());

    if (process.env.MOCK_PLAN === "true") {
      return Response.json(mockMeal(meal));
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY ist nicht konfiguriert." },
        { status: 500 },
      );
    }

    const otherMeals = dayMeals.filter((dayMeal) => dayMeal.name !== meal.name);
    const otherTotals = otherMeals.reduce(
      (totals, currentMeal) => ({
        calories: totals.calories + currentMeal.calories,
        protein: totals.protein + currentMeal.protein,
        carbs: totals.carbs + currentMeal.carbs,
        fat: totals.fat + currentMeal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Erstelle genau eine alternative Mahlzeit als gültiges JSON ohne Markdown. Sie muss denselben type wie die Originalmahlzeit behalten, aber einen anderen Namen und andere Zutaten haben.

Die Tages-Makros müssen nach dem Austausch möglichst gleich bleiben. Die alternative Mahlzeit muss deshalb innerhalb dieser Grenzen liegen:
- calories: maximal 50 kcal Abweichung von ${meal.calories}
- protein: maximal 5 g Abweichung von ${meal.protein}
- carbs: maximal 5 g Abweichung von ${meal.carbs}
- fat: maximal 5 g Abweichung von ${meal.fat}

Die anderen Mahlzeiten des Tages haben zusammen: ${JSON.stringify(otherTotals)}.
Gib exakt diese Felder zurück: type, name, mealPrep, calories, protein, carbs, fat, prepTime, ingredients als Objekt-Array mit name/amount/unit und instructions als String-Array. Das Feld mealPrep muss den Wert der Originalmahlzeit übernehmen.`,
        },
        {
          role: "user",
          content: JSON.stringify({ originalMeal: meal, otherMeals }),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      return Response.json(
        { error: "Es wurde keine alternative Mahlzeit zurückgegeben." },
        { status: 502 },
      );
    }

    const replacement = mealSchema.parse(JSON.parse(content));
    const withinLimit =
      Math.abs(replacement.calories - meal.calories) <= 50 &&
      Math.abs(replacement.protein - meal.protein) <= 5 &&
      Math.abs(replacement.carbs - meal.carbs) <= 5 &&
      Math.abs(replacement.fat - meal.fat) <= 5;

    if (!withinLimit) {
      return Response.json(
        { error: "Keine passende Mahlzeit mit ähnlichen Makros gefunden." },
        { status: 422 },
      );
    }

    return Response.json(replacement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Die Mahlzeitdaten sind ungültig.", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof OpenAI.APIError) {
      return Response.json(
        { error: "Die alternative Mahlzeit konnte nicht erstellt werden." },
        { status: error.status ?? 502 },
      );
    }

    console.error("Fehler beim Austauschen der Mahlzeit:", error);
    return Response.json(
      { error: "Die Mahlzeit konnte nicht ausgetauscht werden." },
      { status: 500 },
    );
  }
}

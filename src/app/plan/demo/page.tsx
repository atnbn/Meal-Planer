import type { Metadata } from "next";

import { PlanView } from "@/app/components/plan/PlanView";
import { mockMealPlan } from "@/lib/mock-plan";
import { rebuildShoppingList } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Beispielplan",
  description: "So sieht ein fertiger Meal-Planner-Wochenplan aus – inklusive Makros, Meal Prep und Einkaufsliste.",
};

// Aggregate the list from the actual ingredients so the demo numbers always add up.
const demoPlan = { ...mockMealPlan, shoppingList: rebuildShoppingList(mockMealPlan) };

export default function DemoPlanPage() {
  return <PlanView initialPlan={demoPlan} mode="demo" />;
}

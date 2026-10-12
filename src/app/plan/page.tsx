import type { Metadata } from "next";

import { StoredPlan } from "@/app/components/plan/StoredPlan";

export const metadata: Metadata = {
  title: "Dein Wochenplan",
  description: "Dein persönlicher 7-Tage-Ernährungsplan mit Makros, Meal Prep und Einkaufsliste.",
};

export default function PlanPage() {
  return <StoredPlan />;
}

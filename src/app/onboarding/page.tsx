import type { Metadata } from "next";

import { OnboardingFlow } from "@/app/components/onboarding/OnboardingFlow";

export const metadata: Metadata = {
  title: "Dein Plan in 6 Schritten",
  description:
    "Ziel, Körperdaten, Ernährung und Alltag angeben – wir erstellen daraus deinen persönlichen 7-Tage-Ernährungsplan.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}

import type { Metadata } from "next";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = { title: "Lernstand festlegen" };

export default function OnboardingPage() {
  return <OnboardingFlow />;
}

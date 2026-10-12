"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/app/components/ui/Button";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  LockIcon,
  RotateCcwIcon,
  SparklesIcon,
  XIcon,
} from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { DEFAULT_ALLERGIES, DEFAULT_EXCLUSIONS, type Diet } from "@/lib/onboarding/constants";
import {
  buildPayload,
  clearDraft,
  computeRecommendedTargets,
  DEFAULT_FORM,
  type FieldErrors,
  type FieldKey,
  type FormState,
  getEffectiveTargets,
  getImpliedExclusions,
  hasErrors,
  loadDraft,
  saveDraft,
  STEP_FIELDS,
  STEPS,
  SUMMARY_STEP,
  TARGET_KEYS,
  validateStep,
} from "@/lib/onboarding/form";
import { preferencesSchema } from "@/lib/onboarding/schema";
import { PLAN_STORAGE_KEY, storePlan } from "@/lib/plan";
import { mealPlanSchema } from "@/lib/schema";

import { AllergiesStep } from "./AllergiesStep";
import { BodyStep } from "./BodyStep";
import { DietStep } from "./DietStep";
import { GeneratingOverlay } from "./GeneratingOverlay";
import { GoalStep } from "./GoalStep";
import { OnboardingSkeleton } from "./OnboardingSkeleton";
import { PreferencesStep } from "./PreferencesStep";
import { MobileProgress, ProgressRail } from "./ProgressRail";
import { SummaryStep } from "./SummaryStep";
import { fieldId, type SetField } from "./types";

const HISTORY_KEY = "onboardingStep";

const readHistoryStep = (state: unknown): number | null => {
  if (!state || typeof state !== "object" || !(HISTORY_KEY in state)) return null;
  const value = (state as Record<string, unknown>)[HISTORY_KEY];
  return typeof value === "number" && Number.isInteger(value) ? value : null;
};

const hasStoredPlan = () => {
  try {
    return sessionStorage.getItem(PLAN_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const generationErrorMessage = (status: number) => {
  if (status === 429) return "Gerade sind sehr viele Anfragen unterwegs. Bitte versuche es in einem Moment erneut.";
  if (status >= 500) return "Der Plan konnte gerade nicht erstellt werden. Bitte versuche es gleich noch einmal.";
  return "Deine Angaben konnten nicht verarbeitet werden. Bitte prüfe sie und versuche es erneut.";
};

export function OnboardingFlow() {
  const isClient = useIsClient();
  return isClient ? <OnboardingWizard /> : <OnboardingSkeleton />;
}

function OnboardingWizard() {
  const router = useRouter();
  const [initialDraft] = useState(loadDraft);

  const [form, setForm] = useState<FormState>(initialDraft?.form ?? DEFAULT_FORM);
  const [step, setStep] = useState(initialDraft?.step ?? 0);
  const [furthestStep, setFurthestStep] = useState(
    Math.max(initialDraft?.furthestStep ?? 0, initialDraft?.step ?? 0),
  );
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [customAllergies, setCustomAllergies] = useState(initialDraft?.customAllergies ?? []);
  const [customExclusions, setCustomExclusions] = useState(initialDraft?.customExclusions ?? []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [showRestored, setShowRestored] = useState(
    Boolean(initialDraft && (initialDraft.furthestStep > 0 || initialDraft.step > 0)),
  );
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [hasPlan] = useState(hasStoredPlan);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastStepRef = useRef(step);
  const historyStepRef = useRef<number | null>(null);

  const recommended = useMemo(() => computeRecommendedTargets(form), [form]);
  const targets = useMemo(() => getEffectiveTargets(form, recommended), [form, recommended]);
  const meta = STEPS[step];

  useEffect(() => {
    saveDraft({ step, furthestStep, form, customAllergies, customExclusions });
  }, [step, furthestStep, form, customAllergies, customExclusions]);

  // Mirror steps into the browser history so the back/forward buttons move between steps
  // instead of leaving the onboarding. The URL itself stays untouched.
  useEffect(() => {
    if (historyStepRef.current === null) {
      window.history.replaceState({ ...window.history.state, [HISTORY_KEY]: step }, "");
    } else if (historyStepRef.current !== step) {
      window.history.pushState({ [HISTORY_KEY]: step }, "");
    }
    historyStepRef.current = step;
  }, [step]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const target = readHistoryStep(event.state);
      if (target === null) return;
      abortRef.current?.abort();
      const clamped = Math.min(target, furthestStep);
      historyStepRef.current = clamped;
      setDirection(clamped < (lastStepRef.current ?? 0) ? "back" : "forward");
      setStep(clamped);
      setErrors({});
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [furthestStep]);

  // Move focus to the new step heading so screen readers announce the change.
  useEffect(() => {
    if (lastStepRef.current === step) return;
    lastStepRef.current = step;

    headingRef.current?.focus({ preventScroll: true });
    const top = formRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      formRef.current?.scrollIntoView({
        block: "start",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  }, [step]);

  const setField: SetField = useCallback((key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "diet") {
        const implied = getImpliedExclusions(value as Diet);
        next.blacklist = prev.blacklist.filter((item) => !implied.includes(item));
      }
      return next;
    });
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const nudgePrimary = () => {
    if (prefersReducedMotion()) return;
    primaryRef.current?.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-5px)" },
        { transform: "translateX(5px)" },
        { transform: "translateX(-3px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 360, easing: "ease-in-out" },
    );
  };

  const revealErrors = (stepIndex: number, stepErrors: FieldErrors) => {
    setErrors(stepErrors);
    nudgePrimary();

    const messages = Object.values(stepErrors);
    setAnnouncement(
      messages.length === 1
        ? (messages[0] ?? "")
        : `${messages.length} Angaben brauchen noch deine Aufmerksamkeit.`,
    );

    const firstInvalid = STEP_FIELDS[stepIndex]?.find((key) => stepErrors[key]);
    if (firstInvalid) {
      // Wait for the step to render before moving focus to the field.
      requestAnimationFrame(() => document.getElementById(fieldId(firstInvalid))?.focus());
    }
  };

  /** Navigates to `target`; moving forward validates every step in between. */
  const goTo = (target: number) => {
    if (target === step || target < 0 || target > SUMMARY_STEP) return;

    if (target < step) {
      setDirection("back");
      setErrors({});
      setStep(target);
      return;
    }

    for (let index = step; index < target; index += 1) {
      const stepErrors = validateStep(index, form);
      if (hasErrors(stepErrors)) {
        if (index !== step) {
          setDirection("forward");
          setStep(index);
        }
        revealErrors(index, stepErrors);
        return;
      }
    }

    setDirection("forward");
    setErrors({});
    setStep(target);
    setFurthestStep((current) => Math.max(current, target));
  };

  const generatePlan = async () => {
    for (let index = 0; index <= SUMMARY_STEP; index += 1) {
      const stepErrors = validateStep(index, form);
      if (hasErrors(stepErrors)) {
        if (index !== step) {
          setDirection("back");
          setStep(index);
        }
        revealErrors(index, stepErrors);
        return;
      }
    }

    const payload = preferencesSchema.safeParse(buildPayload(form, recommended));
    if (!payload.success) {
      console.error("Ungültige Onboarding-Daten:", payload.error.issues);
      setGenerationError("Einige Angaben sind ungültig. Bitte prüfe deine Eingaben.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setGenerationError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.data),
        signal: controller.signal,
      });
      const result: unknown = await response.json().catch(() => null);

      if (!response.ok || !result || typeof result !== "object") {
        const serverMessage =
          result && typeof result === "object" && "error" in result && typeof result.error === "string"
            ? result.error
            : null;
        throw new Error(serverMessage ?? generationErrorMessage(response.status));
      }

      const plan = mealPlanSchema.safeParse(result);
      if (!plan.success) throw new Error(generationErrorMessage(502));

      storePlan(plan.data);
      router.push("/plan");
    } catch (error) {
      setIsGenerating(false);
      if (controller.signal.aborted) {
        setAnnouncement("Die Erstellung wurde abgebrochen.");
        return;
      }
      console.error("Fehler beim Erstellen des Ernährungsplans:", error);
      setGenerationError(
        error instanceof TypeError
          ? "Keine Verbindung zum Server. Prüfe deine Internetverbindung und versuche es erneut."
          : error instanceof Error
            ? error.message
            : generationErrorMessage(500),
      );
    } finally {
      abortRef.current = null;
    }
  };

  const cancelGeneration = useCallback(() => abortRef.current?.abort(), []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // On the summary, generating is an explicit click – Enter in a target field must not trigger it.
    if (step < SUMMARY_STEP) goTo(step + 1);
  };

  const enableManualTargets = () => {
    if (!recommended) return;
    setForm((prev) => ({
      ...prev,
      useManualTargets: true,
      targetCalories: String(recommended.targetCalories),
      targetProtein: String(recommended.targetProtein),
      targetCarbs: String(recommended.targetCarbs),
      targetFat: String(recommended.targetFat),
    }));
    requestAnimationFrame(() => document.getElementById(fieldId("targetCalories"))?.focus());
  };

  const disableManualTargets = () => {
    setForm((prev) => ({
      ...prev,
      useManualTargets: false,
      targetCalories: "",
      targetProtein: "",
      targetCarbs: "",
      targetFat: "",
    }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of TARGET_KEYS) delete next[key as FieldKey];
      return next;
    });
  };

  const addEntry = (
    key: "allergies" | "blacklist",
    value: string,
    defaults: readonly string[],
    custom: string[],
    setCustom: (updater: (prev: string[]) => string[]) => void,
  ) => {
    if (!defaults.includes(value) && !custom.includes(value)) {
      setCustom((prev) => [...prev, value]);
    }
    if (!form[key].includes(value)) {
      setField(key, [...form[key], value]);
    }
  };

  const resetOnboarding = () => {
    abortRef.current?.abort();
    clearDraft();
    setForm(DEFAULT_FORM);
    setCustomAllergies([]);
    setCustomExclusions([]);
    setErrors({});
    setGenerationError(null);
    setShowRestored(false);
    setDirection("back");
    setFurthestStep(0);
    setStep(0);
    setIsResetOpen(false);
    setAnnouncement("Alle Angaben wurden zurückgesetzt.");
  };

  const stepProps = { form, errors, setField };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <GoalStep {...stepProps} />;
      case 1:
        return <BodyStep {...stepProps} targets={targets} />;
      case 2:
        return <DietStep {...stepProps} />;
      case 3:
        return (
          <AllergiesStep
            {...stepProps}
            customAllergies={customAllergies}
            customExclusions={customExclusions}
            onAddAllergy={(value) =>
              addEntry("allergies", value, DEFAULT_ALLERGIES, customAllergies, setCustomAllergies)
            }
            onAddExclusion={(value) =>
              addEntry("blacklist", value, DEFAULT_EXCLUSIONS, customExclusions, setCustomExclusions)
            }
          />
        );
      case 4:
        return <PreferencesStep {...stepProps} />;
      default:
        return (
          <SummaryStep
            {...stepProps}
            recommended={recommended}
            targets={targets}
            onEdit={goTo}
            onEnableManual={enableManualTargets}
            onDisableManual={disableManualTargets}
            generationError={generationError}
            onRetry={generatePlan}
          />
        );
    }
  };

  const isSummary = step === SUMMARY_STEP;
  const isOptionalEmpty = step === 3 && form.allergies.length === 0 && form.blacklist.length === 0;
  const showJumpToSummary = furthestStep === SUMMARY_STEP && !isSummary;

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip">
      <Backdrop />

      <div
        inert={isGenerating}
        className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 pb-10 pt-5 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12 lg:pb-16 lg:pt-12"
      >
        <ProgressRail
          steps={STEPS}
          current={step}
          furthest={furthestStep}
          onNavigate={goTo}
          targets={targets}
        />

        <main className="min-w-0">
          <MobileProgress total={STEPS.length} current={step} label={meta.label} />

          <form
            ref={formRef}
            noValidate
            onSubmit={handleSubmit}
            aria-labelledby="step-title"
            className="mt-6 scroll-mt-4 rounded-panel border border-line bg-surface shadow-panel lg:mt-0"
          >
            <div className="p-5 sm:p-8 lg:p-10">
              <header>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                  Schritt {step + 1} von {STEPS.length}
                  <span className="text-fg-subtle"> · {meta.label}</span>
                </p>
                <h1
                  id="step-title"
                  ref={headingRef}
                  tabIndex={-1}
                  className="mt-3 text-balance text-display text-fg outline-none"
                >
                  {meta.title}
                </h1>
                <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-fg-muted">
                  {meta.description}
                </p>
              </header>

              {showRestored ? (
                <div className="mt-6 flex animate-fade-up flex-wrap items-center gap-x-3 gap-y-1 rounded-card border border-brand-100 bg-brand-50/70 py-2.5 pl-4 pr-2 text-sm text-brand-900">
                  <RotateCcwIcon size={16} className="shrink-0 text-brand-600" />
                  <p className="min-w-0 flex-1 basis-48">Willkommen zurück – dein Fortschritt ist gespeichert.</p>
                  <Button size="sm" variant="ghost" onClick={() => setIsResetOpen(true)}>
                    Neu starten
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowRestored(false)}
                    aria-label="Hinweis schließen"
                    className="flex size-8 items-center justify-center rounded-lg text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ) : null}

              <div
                key={step}
                className={cn(
                  "mt-8 sm:mt-10",
                  direction === "forward" ? "animate-step-in-forward" : "animate-step-in-back",
                )}
              >
                {renderStep()}
              </div>
            </div>

            <footer className="sticky bottom-0 z-10 flex items-center gap-2 rounded-b-panel border-t border-line bg-surface/85 px-4 py-3 backdrop-blur-xl sm:gap-3 sm:px-8 sm:py-4 lg:px-10">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => goTo(step - 1)}
                disabled={step === 0}
                leadingIcon={<ArrowLeftIcon size={18} />}
                className="px-3 sm:px-4"
              >
                <span className="sr-only sm:not-sr-only">Zurück</span>
              </Button>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                {showJumpToSummary ? (
                  <Button variant="secondary" size="lg" onClick={() => goTo(SUMMARY_STEP)}>
                    Übersicht
                  </Button>
                ) : null}

                {isSummary ? (
                  <Button
                    ref={primaryRef}
                    size="lg"
                    onClick={generatePlan}
                    loading={isGenerating}
                    leadingIcon={<SparklesIcon size={18} />}
                  >
                    Plan erstellen
                  </Button>
                ) : (
                  <>
                    <kbd className="hidden items-center gap-1 font-sans text-xs text-fg-subtle md:inline-flex">
                      <span className="rounded-md border border-line bg-surface-muted px-1.5 py-0.5 font-mono text-[0.6875rem] text-fg-muted">
                        Enter ↵
                      </span>
                    </kbd>
                    <Button
                      ref={primaryRef}
                      type="submit"
                      size="lg"
                      trailingIcon={<ArrowRightIcon size={18} />}
                    >
                      {isOptionalEmpty ? "Überspringen" : "Weiter"}
                    </Button>
                  </>
                )}
              </div>
            </footer>
          </form>

          <div className="mt-5 flex flex-col items-center justify-between gap-2 px-2 text-xs text-fg-subtle sm:flex-row">
            <p className="flex items-center gap-1.5">
              <LockIcon size={13} />
              Deine Angaben bleiben in diesem Tab und dienen nur der Planerstellung.
            </p>
            <div className="flex items-center gap-4">
              {hasPlan ? (
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-1.5 rounded-md font-medium text-brand-700 underline-offset-4 hover:underline"
                >
                  <CalendarIcon size={13} />
                  Zu deinem aktuellen Plan
                </Link>
              ) : null}
              {furthestStep > 0 ? (
                <button
                  type="button"
                  onClick={() => setIsResetOpen(true)}
                  className="rounded-md font-medium text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                >
                  Alle Angaben zurücksetzen
                </button>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      <p aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcement}
      </p>

      {isGenerating ? <GeneratingOverlay onCancel={cancelGeneration} /> : null}

      <ConfirmModal
        isOpen={isResetOpen}
        title="Von vorne beginnen?"
        message="Alle bisherigen Angaben werden gelöscht. Das lässt sich nicht rückgängig machen."
        yesLabel="Zurücksetzen"
        noLabel="Abbrechen"
        tone="danger"
        onYes={resetOnboarding}
        onNo={() => setIsResetOpen(false)}
      />
    </div>
  );
}

function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-48 -top-48 size-144 rounded-full bg-brand-200/45 blur-3xl" />
      <div className="absolute -right-40 top-1/4 size-112 rounded-full bg-accent-100/80 blur-3xl dark:bg-accent-100/35" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-line-strong)_1px,transparent_1px)] bg-size-[22px_22px] opacity-50 mask-[radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />
    </div>
  );
}

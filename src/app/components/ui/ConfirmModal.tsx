"use client";

import { useEffect, useId, useRef } from "react";

import { Button } from "@/app/components/ui/Button";
import { AlertCircleIcon, InfoIcon } from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";

type ConfirmModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  yesLabel?: string;
  noLabel?: string;
  /** `danger` styles the confirm action as destructive. */
  tone?: "default" | "danger";
  onYes: () => void;
  onNo: () => void;
};

/**
 * Confirmation dialog on top of the native <dialog> element: focus trapping, Escape handling,
 * an inert background and focus restoration come from the browser.
 */
export default function ConfirmModal({
  isOpen,
  title = "Bist du sicher?",
  message,
  yesLabel = "Ja",
  noLabel = "Nein",
  tone = "default",
  onYes,
  onNo,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      // Safest default: the non-destructive action receives initial focus.
      cancelRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const Icon = tone === "danger" ? AlertCircleIcon : InfoIcon;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-message`}
      onCancel={(event) => {
        // Keep the dialog controlled: Escape asks the parent to close it.
        event.preventDefault();
        onNo();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onNo();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-panel border border-line bg-surface p-0 text-fg shadow-panel",
        "backdrop:bg-scrim backdrop:backdrop-blur-sm",
        "open:animate-dialog-in backdrop:animate-fade-in",
      )}
    >
      <div className="p-6 sm:p-7">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            tone === "danger" ? "bg-danger-soft text-danger" : "bg-brand-50 text-brand-700",
          )}
        >
          <Icon size={22} />
        </span>
        <h2 id={`${id}-title`} className="mt-4 text-lg font-semibold tracking-tight text-fg">
          {title}
        </h2>
        <p id={`${id}-message`} className="mt-2 text-sm leading-relaxed text-fg-muted">
          {message}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button ref={cancelRef} variant="secondary" onClick={onNo}>
            {noLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onYes}>
            {yesLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

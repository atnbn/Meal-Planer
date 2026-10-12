import { cn } from "@/lib/cn";

import { AlertCircleIcon } from "./icons";

type FieldMessageProps = {
  id: string;
  error?: string;
  hint?: string;
  className?: string;
};

/** Renders the error (preferred) or the hint for a field under a stable id for aria-describedby. */
export function FieldMessage({ id, error, hint, className }: FieldMessageProps) {
  if (error) {
    return (
      <p
        id={id}
        className={cn(
          "mt-2 flex animate-fade-up items-start gap-1.5 text-sm font-medium text-danger",
          className,
        )}
      >
        <AlertCircleIcon size={16} className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </p>
    );
  }

  if (hint) {
    return (
      <p id={id} className={cn("mt-2 text-sm text-fg-subtle", className)}>
        {hint}
      </p>
    );
  }

  return null;
}

export const describedBy = (id: string, error?: string, hint?: string) =>
  error || hint ? id : undefined;

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type FormSectionProps = {
  legend: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  as?: "fieldset" | "div";
};

/** Groups related controls. Uses <fieldset>/<legend> so radio groups get an accessible name. */
export function FormSection({
  legend,
  description,
  aside,
  children,
  className,
  as = "fieldset",
}: FormSectionProps) {
  const Wrapper = as;
  const Legend = as === "fieldset" ? "legend" : "p";

  return (
    <Wrapper className={cn("min-w-0", className)}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <Legend className="text-sm font-semibold text-fg">{legend}</Legend>
          {description ? <p className="mt-0.5 text-sm text-fg-muted">{description}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </Wrapper>
  );
}

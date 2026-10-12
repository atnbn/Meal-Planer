import Link from "next/link";

import { SparklesIcon } from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";

type BrandMarkProps = {
  /** Renders the mark as a link (defaults to the landing page). Pass `null` for a static mark. */
  href?: string | null;
  /** Hides the word mark on small screens to free up header space. */
  compact?: boolean;
  className?: string;
};

export function BrandMark({ href = "/", compact = false, className }: BrandMarkProps) {
  const content = (
    <>
      <span className="flex size-9 items-center justify-center rounded-[0.8rem] bg-linear-to-br from-brand-400 to-brand-solid text-on-brand shadow-brand transition-transform duration-300 ease-(--ease-spring) group-hover/brand:-rotate-6 group-hover/brand:scale-105">
        <SparklesIcon size={18} />
      </span>
      <span
        className={cn(
          "text-[0.9375rem] font-semibold tracking-tight text-fg",
          compact && "max-sm:sr-only",
        )}
      >
        Meal Planner
      </span>
    </>
  );

  const classes = cn("group/brand flex items-center gap-2.5 rounded-xl", className);

  if (href === null) return <div className={classes}>{content}</div>;

  return (
    <Link href={href} className={classes} aria-label="Meal Planner – zur Startseite">
      {content}
    </Link>
  );
}

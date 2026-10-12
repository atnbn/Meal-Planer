import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
};

export function SectionHeading({ id, eyebrow, title, description, align = "center" }: SectionHeadingProps) {
  return (
    <div className={cn("reveal max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">{eyebrow}</p>
      <h2
        id={id}
        className="mt-3 text-balance text-[clamp(1.875rem,1.3rem+2.2vw,3rem)] font-semibold leading-[1.08] text-fg"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-lg leading-relaxed text-fg-muted">{description}</p>
      ) : null}
    </div>
  );
}

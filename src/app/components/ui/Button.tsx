import Link from "next/link";
import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

const base =
  "group/button relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-solid text-on-brand shadow-brand hover:bg-brand-solid-hover hover:shadow-[0_14px_34px_-12px_var(--color-brand-solid)]",
  secondary:
    "border border-line-strong bg-surface text-fg shadow-xs hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800",
  ghost: "text-fg-muted hover:bg-surface-sunken hover:text-fg",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-800",
  danger:
    "border border-danger/30 bg-danger-soft text-danger hover:border-danger hover:bg-danger hover:text-surface",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-[0.7rem] px-3 text-sm",
  md: "h-11 rounded-control px-4 text-[0.9375rem]",
  lg: "h-12 rounded-control px-5 text-base sm:h-13 sm:px-6",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

function TrailingIcon({ children }: { children: ReactNode }) {
  return (
    <span className="transition-transform duration-300 ease-(--ease-spring) group-hover/button:translate-x-0.5">
      {children}
    </span>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : (
        leadingIcon
      )}
      {children}
      {trailingIcon ? <TrailingIcon>{trailingIcon}</TrailingIcon> : null}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

/** Navigation that looks like a button – keeps link semantics (open in new tab, prefetch). */
export function ButtonLink({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon ? <TrailingIcon>{trailingIcon}</TrailingIcon> : null}
    </Link>
  );
}

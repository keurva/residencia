import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm" | "icon";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent-active",
  secondary:
    "border border-line bg-panel text-ink shadow-raised hover:bg-sunken active:bg-sunken",
  ghost: "text-ink-2 hover:bg-sunken hover:text-ink",
  danger: "bg-red-600 text-white hover:bg-red-600/90",
};

const SIZES: Record<Size, string> = {
  md: "h-10 rounded-lg px-4 text-sm",
  sm: "h-8 rounded-md px-3 text-sm",
  icon: "h-9 w-9 rounded-lg",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function buttonClassName(
  variant: Variant = "primary",
  size: Size = "md",
  className = "",
): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClassName(variant, size, className)} {...props} />
  );
}

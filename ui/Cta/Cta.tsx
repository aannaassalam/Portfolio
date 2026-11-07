import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

interface CtaProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  /** Trailing glyph. Defaults to the arrow that slides on hover. */
  icon?: ReactNode;
}

/**
 * The site's single call-to-action treatment. Hover lifts the border,
 * warms the surface and nudges the arrow — three small cues, no bounce.
 */
export default function Cta({
  href,
  children,
  variant = "primary",
  icon,
  className,
  ...props
}: CtaProps) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  // Same-page anchors stay plain anchors: the smooth scroller handles them,
  // and routing them through Next's Link would add a second, competing scroll.
  const Tag = external || href.startsWith("#") ? "a" : Link;

  return (
    <Tag
      href={href}
      className={cx(
        "group relative inline-flex min-h-11 items-center gap-3 overflow-hidden rounded-full px-6 py-3.5",
        "text-sm font-medium tracking-tight transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        variant === "primary"
          ? "bg-violet-600 text-white hover:bg-violet-500"
          : "border border-ink-600 text-mist hover:border-violet-600 hover:text-chalk",
        className
      )}
      {...(external
        ? {
            rel: "noreferrer",
            target: href.startsWith("http") ? "_blank" : undefined
          }
        : {})}
      {...props}
    >
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-8 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-70"
          style={{
            background:
              "radial-gradient(closest-side, rgba(168,85,247,0.9), transparent)"
          }}
        />
      )}
      <span className="relative">{children}</span>
      <span
        aria-hidden
        className="relative transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
      >
        {icon ?? "→"}
      </span>
    </Tag>
  );
}

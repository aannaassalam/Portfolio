import { useState } from "react";
import { TECHNOLOGIES, TECH_EDGES } from "@/json/site/content";
import { revealChildren, useGsapScope } from "@/lib/motion";
import { claimPhase } from "@/lib/three/world";
import { cx } from "@/lib/utils";

const VIEW = { width: 1000, height: 560 };

const point = (index: number) => ({
  x: TECHNOLOGIES[index].x * VIEW.width,
  y: TECHNOLOGIES[index].y * VIEW.height
});

/**
 * The stack as a graph rather than a logo wall: the point is that these
 * technologies are wired to each other, not that we can name twelve of them.
 * Every node is a real button, so keyboard and pointer get the same detail.
 */
export default function TechStack() {
  const [focused, setFocused] = useState<number | null>(null);

  const scope = useGsapScope<HTMLElement>(({ scope }) => {
    revealChildren(scope);
    claimPhase(scope, "drift");
  }, []);

  const isLit = (index: number) =>
    focused === null ||
    focused === index ||
    TECH_EDGES.some(
      ([a, b]) =>
        (a === focused && b === index) || (b === focused && a === index)
    );

  return (
    <section
      ref={scope}
      className="veil relative overflow-hidden py-28 md:py-36"
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow" data-reveal>
              The stack
            </p>
            <h2
              className="mt-6 max-w-xl text-[clamp(2rem,4.4vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.03em]"
              data-reveal
            >
              Built on technology that moves.
            </h2>
          </div>
          <p
            className="max-w-sm text-sm leading-relaxed text-slate-muted"
            data-reveal
          >
            We pick tools for how well they hold up in year three, not how they
            look in a launch post.
          </p>
        </div>

        <div className="relative mt-16" data-reveal>
          <svg
            viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
            className="hidden h-auto w-full md:block"
            aria-hidden
          >
            {TECH_EDGES.map(([a, b]) => {
              const from = point(a);
              const to = point(b);
              const lit = focused !== null && (a === focused || b === focused);
              return (
                <line
                  key={`${a}-${b}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={lit ? "#A855F7" : "#8B5CF6"}
                  strokeWidth={lit ? 1.4 : 0.8}
                  strokeOpacity={lit ? 0.65 : 0.14}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* One list, two layouts. Under md the constellation has no room to
              breathe, so the nodes fall back to an ordinary wrapped list —
              same markup, same ids, no duplicated DOM. */}
          <ul className="flex flex-wrap gap-2 md:absolute md:inset-0 md:block">
            {TECHNOLOGIES.map((tech, index) => (
              <li
                key={tech.name}
                className="relative md:absolute md:-translate-x-1/2 md:-translate-y-1/2"
                style={{ left: `${tech.x * 100}%`, top: `${tech.y * 100}%` }}
              >
                <button
                  type="button"
                  onMouseEnter={() => setFocused(index)}
                  onMouseLeave={() => setFocused(null)}
                  onFocus={() => setFocused(index)}
                  onBlur={() => setFocused(null)}
                  aria-describedby={`tech-note-${index}`}
                  className={cx(
                    "flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs transition-all duration-500 ease-out-expo md:px-5 md:text-sm",
                    isLit(index)
                      ? "border-violet-600/60 bg-ink-850/90 text-chalk"
                      : "border-ink-600 bg-ink-850/60 text-slate-muted",
                    focused === index &&
                      "border-violet-400 shadow-[0_0_30px_-6px_rgba(168,85,247,0.8)] md:scale-110"
                  )}
                >
                  <span
                    className={cx(
                      "h-1.5 w-1.5 rounded-full transition-colors duration-500",
                      isLit(index) ? "bg-violet-400" : "bg-ink-600"
                    )}
                  />
                  {tech.name}
                </button>
                <span
                  id={`tech-note-${index}`}
                  className={cx(
                    "pointer-events-none absolute left-1/2 top-full mt-2 w-max -translate-x-1/2 font-mono text-xs uppercase tracking-[0.16em] text-violet-300 transition-opacity duration-300",
                    focused === index ? "opacity-100" : "opacity-0"
                  )}
                >
                  {tech.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

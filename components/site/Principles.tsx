import { PRINCIPLES, TRUST } from "@/json/site/content";
import { revealChildren, useGsapScope } from "@/lib/motion";
import { claimPhase, world } from "@/lib/three/world";
import GlowCard from "@/ui/GlowCard/GlowCard";
import SectionIntro from "@/ui/SectionIntro/SectionIntro";

/**
 * Technical credibility without invented statistics: what we guarantee about
 * how a system is built, not a wall of numbers nobody can verify.
 */
export default function Principles() {
  const scope = useGsapScope<HTMLElement>(({ scope }) => {
    revealChildren(scope);
    // Out of the city; the scattered system is back overhead, ready to be
    // the core again by the time the closing section asks.
    claimPhase(scope, "ascend", () => {
      world.formation = "core";
    });
  }, []);

  return (
    <section ref={scope} className="py-28 md:py-36">
      <div className="shell">
        <SectionIntro
          eyebrow="Engineering standards"
          headline={["Built for today.", "Engineered for tomorrow."]}
        />

        <ul className="mt-16 grid gap-px border border-ink-700 bg-ink-700 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <li key={principle.label} data-reveal>
              <GlowCard className="h-full border-0">
                <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-violet-300">
                  {principle.label}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-mist">
                  {principle.body}
                </p>
              </GlowCard>
            </li>
          ))}
        </ul>

        {/* Where the work happens. Names, not a logo wall we can't substantiate. */}
        <div className="mt-28 border-t border-ink-700 pt-14">
          <p className="eyebrow" data-reveal>
            {TRUST.eyebrow}
          </p>
          <h3
            className="mt-5 text-2xl font-medium tracking-tight md:text-3xl"
            data-reveal
          >
            {TRUST.headline}
          </h3>

          <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-5" data-reveal>
            {TRUST.industries.map((industry) => (
              <li
                key={industry}
                className="font-mono text-sm uppercase tracking-[0.2em] text-slate-muted transition-colors duration-500 hover:text-violet-300"
              >
                {industry}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

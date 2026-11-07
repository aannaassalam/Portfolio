import { ABOUT } from "@/json/site/content";
import { gsap, revealChildren, useGsapScope } from "@/lib/motion";
import { claimPhase, world } from "@/lib/three/world";
import SectionIntro from "@/ui/SectionIntro/SectionIntro";

/**
 * Strategy + Design + Engineering = Product, drawn as an equation whose
 * terms converge on scroll. The three disciplines are one output, which is
 * the whole claim of the section.
 */
export default function About() {
  const scope = useGsapScope<HTMLElement>(({ scope }) => {
    revealChildren(scope);
    claimPhase(scope, "ascend", () => {
      world.formation = "core";
    });

    gsap.fromTo(
      scope.querySelectorAll("[data-term]"),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: scope.querySelector("[data-equation]"),
          start: "top 75%"
        }
      }
    );

    gsap.fromTo(
      scope.querySelector("[data-outcome]"),
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: scope.querySelector("[data-equation]"),
          start: "top 55%"
        }
      }
    );
  }, []);

  return (
    <section
      ref={scope}
      id="about"
      className="veil relative overflow-hidden py-28 md:py-40"
    >
      <div className="shell">
        <SectionIntro
          eyebrow={ABOUT.eyebrow}
          headline={ABOUT.headline}
          body={ABOUT.body}
        />

        <div
          data-equation
          className="mt-20 flex flex-col items-stretch gap-4 md:mt-28 md:flex-row md:items-center"
        >
          {ABOUT.equation.map((item, index) => (
            <div
              key={item.term}
              className="flex flex-1 items-center gap-4 md:contents"
            >
              {index > 0 && (
                <span
                  aria-hidden
                  className="hidden text-2xl font-light text-ink-600 md:block"
                >
                  +
                </span>
              )}
              <div
                data-term
                className="flex-1 border border-ink-700 bg-ink-850/60 p-6 md:p-7"
              >
                <p className="text-lg font-medium tracking-tight md:text-xl">
                  {item.term}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-muted">
                  {item.note}
                </p>
              </div>
            </div>
          ))}

          <span
            aria-hidden
            className="self-center text-2xl font-light text-ink-600 md:self-auto"
          >
            =
          </span>

          <div
            data-outcome
            className="flex-1 border border-violet-600/40 bg-[linear-gradient(140deg,rgba(124,58,237,0.18),transparent_65%)] p-6 md:p-7"
          >
            <p className="text-lg font-medium tracking-tight text-violet-200 md:text-xl">
              {ABOUT.outcome.term}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              {ABOUT.outcome.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

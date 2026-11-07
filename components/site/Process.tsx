import { PROCESS } from "@/json/site/content";
import { cx } from "@/lib/utils";
import { gsap, revealChildren, useGsapScope } from "@/lib/motion";
import { claimPhase } from "@/lib/three/world";
import SectionIntro from "@/ui/SectionIntro/SectionIntro";

/**
 * The lifecycle as an assembly line: a rail that draws itself as you scroll,
 * with each stage switching on only once the line reaches it.
 */
export default function Process() {
  const scope = useGsapScope<HTMLElement>(({ scope }) => {
    revealChildren(scope);
    // The camera turns toward the city here, so the flythrough starts moving.
    claimPhase(scope, "transit");

    gsap.fromTo(
      scope.querySelector("[data-rail]"),
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scope.querySelector("[data-stages]"),
          start: "top 65%",
          end: "bottom 75%",
          scrub: 0.5
        }
      }
    );

    scope.querySelectorAll<HTMLElement>("[data-stage]").forEach((stage) => {
      gsap.fromTo(
        stage,
        { opacity: 0.28 },
        {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: stage, start: "top 70%" }
        }
      );

      gsap.fromTo(
        stage.querySelector("[data-node]"),
        { scale: 0.4, backgroundColor: "#1F1F28" },
        {
          scale: 1,
          backgroundColor: "#8B5CF6",
          duration: 0.6,
          ease: "expo.out",
          scrollTrigger: { trigger: stage, start: "top 70%" }
        }
      );
    });
  }, []);

  return (
    <section
      ref={scope}
      id="process"
      className="veil relative overflow-hidden py-28 md:py-40"
    >
      <div className="shell">
        <SectionIntro
          eyebrow="How we build"
          headline={["From first thought", "to final product."]}
        />

        <ol className="relative mt-20 md:mt-28" data-stages>
          {/* Rail: static track, plus the segment that draws in on scroll. */}
          <span
            aria-hidden
            className="absolute bottom-0 left-1.75 top-0 w-px bg-ink-700 md:left-1/2"
          />
          <span
            aria-hidden
            data-rail
            className="absolute bottom-0 left-1.75 top-0 w-px origin-top bg-linear-to-b from-violet-400 via-violet-500 to-violet-900 md:left-1/2"
          />

          {PROCESS.map((stage, index) => (
            <li
              key={stage.number}
              data-stage
              className="relative grid gap-4 pb-16 pl-10 last:pb-0 md:grid-cols-2 md:gap-16 md:pl-0"
            >
              <span
                aria-hidden
                data-node
                className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-ink-900 md:left-1/2 md:-translate-x-1/2"
              />

              {/* Stages alternate sides on md+; the rail runs between them. */}
              <div
                className={cx(
                  index % 2 === 0
                    ? "md:col-start-1 md:pr-16 md:text-right"
                    : "md:col-start-2 md:pl-16"
                )}
              >
                <span className="font-mono text-sm text-violet-400">
                  {stage.number}
                </span>
                <h3 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">
                  {stage.title}
                </h3>
                <p
                  className={cx(
                    "mt-3 max-w-sm text-sm leading-relaxed text-mist md:max-w-xs",
                    index % 2 === 0 && "md:ml-auto"
                  )}
                >
                  {stage.body}
                </p>
                <p className="eyebrow mt-4">{stage.output}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

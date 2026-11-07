import Image from "next/image";
import { useRef } from "react";
import { CASE_STUDIES } from "@/json/site/content";
import { gsap, revealChildren, useGsapScope } from "@/lib/motion";
import { claimPhase, world } from "@/lib/three/world";

type Study = (typeof CASE_STUDIES)[number];

function Panel({ study }: { study: Study }) {
  return (
    <article
      data-panel
      className="flex w-screen shrink-0 items-center px-[clamp(1.25rem,5vw,5rem)]"
    >
      <div className="grid w-full gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-16">
        <div>
          <div className="flex items-center gap-4" data-panel-item>
            <span className="font-mono text-sm text-violet-400">
              {study.number}
            </span>
            <span className="eyebrow">{study.sector}</span>
          </div>

          <h3
            className="mt-6 text-[clamp(1.875rem,3.6vw,3.25rem)] font-medium leading-[1.03] tracking-[-0.035em]"
            data-panel-item
          >
            {study.title}
          </h3>

          <p
            className="mt-5 max-w-lg text-base leading-relaxed text-mist"
            data-panel-item
          >
            {study.summary}
          </p>

          <dl
            className="mt-8 space-y-5 border-l border-ink-700 pl-5"
            data-panel-item
          >
            {(
              [
                ["Problem", study.problem],
                ["Approach", study.solution],
                ["Result", study.result]
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-2 max-w-lg text-sm leading-relaxed text-slate-muted">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <ul
            className="mt-8 flex flex-wrap gap-2 border-t border-ink-700 pt-6"
            data-panel-item
          >
            {study.stack.map((tech) => (
              <li
                key={tech}
                className="font-mono text-xs uppercase tracking-[0.14em] text-slate-muted"
              >
                {tech}
              </li>
            ))}
          </ul>

          {/* The live product. Real links, so the proof is one tap away. */}
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1" data-panel-item>
            {study.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm text-chalk transition-colors duration-300 hover:text-violet-300"
                >
                  {link.label}
                  <span aria-hidden>↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative" data-panel-visual>
          {/* The live site itself, not a drawing of it. */}
          <Image
            src={study.image}
            alt={`${study.title} home page`}
            width={2560}
            height={1760}
            quality={90}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto w-full rounded-2xl border border-ink-700 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]"
          />
        </div>
      </div>
    </article>
  );
}

/**
 * Pinned horizontal run on desktop, plain vertical stack below lg. Touch
 * devices get the layout they can actually drive rather than a hijacked
 * vertical gesture pretending to be horizontal.
 */
export default function CaseStudies() {
  const track = useRef<HTMLDivElement>(null);

  const scope = useGsapScope<HTMLElement>(({ scope }) => {
    // Section heading reveals at every breakpoint — it must never depend on
    // the desktop-only horizontal branch running.
    revealChildren(scope, "top 85%");
    claimPhase(scope, "drift");

    const media = gsap.matchMedia();

    media.add("(min-width: 1024px)", () => {
      const rail = track.current;
      if (!rail) return;

      const distance = () => rail.scrollWidth - window.innerWidth;

      const horizontal = gsap.to(rail, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          // The section claim above measures the unpinned height; this one
          // covers the pinned run, so scrolling back up into it never shows
          // the next section's camera.
          onToggle: (self) => {
            if (self.isActive) world.phase = "drift";
          }
        }
      });

      // Panels animate against horizontal travel, not vertical scroll.
      rail.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
        gsap.from(panel.querySelectorAll("[data-panel-item]"), {
          opacity: 0,
          y: 28,
          duration: 0.9,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horizontal,
            start: "left 72%"
          }
        });

        gsap.from(panel.querySelector("[data-panel-visual]"), {
          scale: 0.85,
          opacity: 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horizontal,
            start: "left 85%"
          }
        });
      });
    });

    return () => media.revert();
  }, []);

  return (
    <section
      ref={scope}
      id="work"
      className="relative overflow-hidden lg:h-screen"
    >
      {/* Pinned above the rail on lg, so it condenses to a single line —
          a full-size heading would eat the panel's vertical budget. */}
      <div className="shell pb-10 pt-28 lg:absolute lg:left-0 lg:right-0 lg:top-0 lg:z-10 lg:flex lg:items-baseline lg:gap-5 lg:pb-0 lg:pt-24">
        <p className="eyebrow" data-reveal>
          Selected work
        </p>
        <h2
          className="mt-5 text-[clamp(2rem,4.4vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.03em] lg:mt-0 lg:text-xl"
          data-reveal
        >
          Ideas, engineered.
        </h2>
      </div>

      <div
        ref={track}
        className="flex flex-col gap-24 pb-28 lg:h-screen lg:flex-row lg:gap-0 lg:pb-0 lg:pt-32"
      >
        {CASE_STUDIES.map((study) => (
          <Panel key={study.number} study={study} />
        ))}
      </div>
    </section>
  );
}

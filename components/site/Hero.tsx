import { COMPLEXITY, HERO } from "@/json/site/content";
import { gsap, useGsapScope } from "@/lib/motion";
import { claimPhase, world } from "@/lib/three/world";
import Cta from "@/ui/Cta/Cta";

/**
 * Act one. The hero and the two "complexity" statements are one idea: an
 * organised system, taken apart, and put back together simpler. The object
 * itself lives in the page-wide scene; this act only tells it how far apart
 * to be.
 */
export default function Hero() {
  const act = useGsapScope<HTMLDivElement>(({ scope }) => {
    // fromTo, not from: the start state is already set in CSS, so `from()`
    // would read the CSS-hidden values as its destination and animate to
    // nothing. Stating both ends keeps GSAP and the stylesheet in agreement.
    // The delay is small on purpose — it is dead time the visitor spends
    // looking at a hidden headline.
    const intro = gsap.timeline({
      defaults: { ease: "expo.out" },
      delay: 0.12
    });

    intro
      .fromTo(
        scope.querySelectorAll("[data-hero-line] > span"),
        // `y: 0` is not redundant. GSAP treats yPercent as a SEPARATE
        // transform component: it parses the CSS pre-hide (translateY(118%))
        // into its base `y` and then adds yPercent on top, so `yPercent: 0`
        // alone lands back on the CSS offset instead of at zero. Declaring
        // `y` zeroes that base so yPercent is the only thing driving it.
        { yPercent: 118, y: 0 },
        { yPercent: 0, y: 0, duration: 1.5, stagger: 0.12 }
      )
      .fromTo(
        scope.querySelectorAll("[data-hero-fade]"),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 },
        "-=1.05"
      );

    // Scroll choreography across the whole act: the system disperses through
    // the first statement, then resolves — tighter than it started. Written
    // straight into the world; the scene reads it every frame.
    const scrub = gsap
      .timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7
        }
      })
      .fromTo(
        world,
        { dispersion: 0 },
        { dispersion: 1, duration: 1.3, ease: "none", immediateRender: false }
      )
      .to(world, { dispersion: 0.06, duration: 1, ease: "power2.inOut" });

    claimPhase(scope, "hero", () => {
      world.formation = "core";
      // Re-entering from below: land on the scrub's resting value rather than
      // on whatever the section after us asked for.
      if (scrub.progress() >= 1) world.dispersion = 0.06;
    });

    gsap.to(scope.querySelector("[data-hero-copy]"), {
      opacity: 0,
      y: -70,
      filter: "blur(12px)",
      ease: "none",
      scrollTrigger: {
        trigger: scope.querySelector("[data-hero-copy]"),
        start: "top top",
        end: "+=60%",
        scrub: true
      }
    });

    // The two statements cross-fade in the middle of the act.
    const statements = scope.querySelectorAll<HTMLElement>("[data-statement]");
    statements.forEach((statement, index) => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: statement.dataset.range,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6
          }
        })
        .fromTo(
          statement,
          { opacity: 0, y: 40, filter: "blur(14px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }
        )
        .to(statement, { duration: index === 1 ? 1.4 : 0.6 })
        .to(statement, {
          opacity: 0,
          y: -40,
          filter: "blur(14px)",
          duration: 1
        });
    });
  });

  return (
    <div ref={act} className="relative">
      {/* Sticky scrim for the whole act. Narrow viewports park the object
          under the copy, so the copy has to win over it at every scroll. */}
      <div className="pointer-events-none sticky top-0 h-screen w-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#050505_20%,rgba(5,5,5,0.82)_52%,transparent_86%)] lg:hidden" />
      </div>

      <section
        id="top"
        className="relative z-10 flex min-h-screen items-center"
        style={{ marginTop: "-100vh" }}
      >
        <div className="shell w-full pb-24 pt-32" data-hero-copy>
          <p className="eyebrow" data-hero-fade>
            {HERO.eyebrow}
          </p>

          <h1 className="mt-8 text-[clamp(2.75rem,9vw,9rem)] font-medium leading-[0.92] tracking-[-0.045em]">
            {HERO.headline.map((line, i) => (
              <span key={line} className="block overflow-hidden" data-hero-line>
                <span className={i === 1 ? "block text-mist" : "block"}>
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="mt-8 max-w-xl text-base leading-relaxed text-mist md:text-lg"
            data-hero-fade
          >
            {HERO.lede}
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-3"
            data-hero-fade
          >
            <Cta href={HERO.primaryCta.href}>{HERO.primaryCta.label}</Cta>
            <Cta href={HERO.secondaryCta.href} variant="ghost" icon="↓">
              {HERO.secondaryCta.label}
            </Cta>
          </div>

          <ul
            className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-2"
            data-hero-fade
          >
            {HERO.disciplines.map((item, i) => (
              <li key={item} className="eyebrow flex items-center gap-3">
                {i > 0 && (
                  <span aria-hidden className="text-ink-600">
                    ·
                  </span>
                )}
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Scroll distance is the pacing: one viewport-and-a-bit per statement. */}
      <div className="relative z-10 h-[240vh]">
        <div
          id="complexity-1"
          className="pointer-events-none absolute inset-x-0 top-0 h-[120vh]"
          aria-hidden
        />
        <div
          id="complexity-2"
          className="pointer-events-none absolute inset-x-0 top-[120vh] h-[120vh]"
          aria-hidden
        />

        <div className="sticky top-0 flex h-screen items-center">
          {/* Both statements share one grid cell so they cross-fade in place
              without absolute positioning guesswork. */}
          <div className="shell grid w-full">
            {[COMPLEXITY.first, COMPLEXITY.second].map((line, i) => (
              <p
                key={line}
                data-statement
                data-range={`#complexity-${i + 1}`}
                data-scrub-hidden
                className="col-start-1 row-start-1 max-w-4xl text-[clamp(1.75rem,5vw,4rem)] font-medium leading-[1.08] tracking-[-0.035em]"
              >
                {i === 1 ? (
                  <>
                    Our job is to make it{" "}
                    <span className="text-violet-400">simple</span>.
                  </>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

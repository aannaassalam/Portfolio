import { ARCHITECTURE } from "@/json/site/content";
import { gsap, useGsapScope } from "@/lib/motion";
import { claimPhase, world } from "@/lib/three/world";

/**
 * The flythrough. Scroll is the camera dolly: an overview of separate
 * structures at the top, one connected platform by the bottom. The city is
 * part of the page-wide scene; this section only drives the travel.
 */
export default function Architecture() {
  const scope = useGsapScope<HTMLElement>(({ scope }) => {
    claimPhase(scope, "city");

    gsap.fromTo(
      world,
      { city: 0 },
      {
        city: 1,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6
        }
      }
    );

    gsap.fromTo(
      scope.querySelectorAll("[data-arch-line]"),
      { opacity: 0, y: 30, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.15,
        ease: "expo.out",
        duration: 1.4,
        scrollTrigger: { trigger: scope, start: "top 30%" }
      }
    );

    gsap.fromTo(
      scope.querySelectorAll("[data-layer]"),
      { opacity: 0, x: -18 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8
        }
      }
    );
  }, []);

  return (
    <section ref={scope} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Vignette keeps the type legible wherever the camera happens to be. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,5,5,0.5)_22%,rgba(5,5,5,0.3)_50%,rgba(5,5,5,0.78)_80%,rgba(5,5,5,0.82)_93%,transparent_100%)]" />

        <div className="shell absolute inset-x-0 top-1/2 -translate-y-1/2">
          <p className="eyebrow" data-arch-line>
            {ARCHITECTURE.eyebrow}
          </p>
          <h2 className="mt-6 max-w-3xl text-[clamp(1.75rem,4.2vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.035em]">
            {ARCHITECTURE.headline.map((line, i) => (
              <span key={line} className="block" data-arch-line>
                <span className={i === 1 ? "text-violet-300" : undefined}>
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <p
            className="mt-6 max-w-lg text-sm leading-relaxed text-mist md:text-base"
            data-arch-line
          >
            {ARCHITECTURE.body}
          </p>
        </div>

        <ul className="shell absolute inset-x-0 bottom-10 flex flex-wrap gap-x-6 gap-y-2">
          {ARCHITECTURE.layers.map((layer) => (
            <li
              key={layer.name}
              data-layer
              className="flex items-baseline gap-2"
            >
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-violet-300">
                {layer.name}
              </span>
              <span className="hidden text-xs text-slate-muted lg:inline">
                {layer.note}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

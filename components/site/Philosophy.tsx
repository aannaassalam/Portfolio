import { useMemo, useRef } from "react";
import { PHILOSOPHY } from "@/json/site/content";
import { gsap, revealChildren, useGsapScope } from "@/lib/motion";
import { seededRandom } from "@/lib/three/formations";
import { claimPhase } from "@/lib/three/world";
import SectionIntro from "@/ui/SectionIntro/SectionIntro";

const COLUMNS = 4;
const ROWS = 7;
const VIEW = { width: 1000, height: 620 };

/**
 * Two positions per node — where it sits in a system nobody planned, and
 * where it sits once someone did. Scroll interpolates between them.
 */
function buildNetwork() {
  const rand = seededRandom(88231);

  const nodes = Array.from({ length: COLUMNS * ROWS }, (_, i) => {
    const column = i % COLUMNS;
    const row = Math.floor(i / COLUMNS);
    return {
      chaos: {
        x: 70 + rand() * (VIEW.width - 140),
        y: 50 + rand() * (VIEW.height - 100)
      },
      order: {
        x: 130 + column * ((VIEW.width - 260) / (COLUMNS - 1)),
        y: 55 + row * ((VIEW.height - 110) / (ROWS - 1))
      },
      column,
      row
    };
  });

  const edges: [number, number][] = [];
  const at = (c: number, r: number) => r * COLUMNS + c;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLUMNS - 1; c++) edges.push([at(c, r), at(c + 1, r)]);
  }
  // Only the outer columns run vertically — enough to read as a spine,
  // not so much that the resolved state becomes its own kind of noise.
  for (let r = 0; r < ROWS - 1; r++) {
    edges.push([at(0, r), at(0, r + 1)]);
    edges.push([at(COLUMNS - 1, r), at(COLUMNS - 1, r + 1)]);
  }

  return { nodes, edges };
}

export default function Philosophy() {
  const { nodes, edges } = useMemo(() => buildNetwork(), []);
  const circles = useRef<(SVGCircleElement | null)[]>([]);
  const lines = useRef<(SVGLineElement | null)[]>([]);

  const scope = useGsapScope<HTMLElement>(({ scope }) => {
    revealChildren(scope);
    // The 3D system loosens into a starfield behind this section's own network.
    claimPhase(scope, "drift");

    const draw = (p: number) => {
      // Ease per-node so the structure snaps together back-to-front.
      nodes.forEach((node, i) => {
        const local = gsap.utils.clamp(0, 1, (p - node.column * 0.06) / 0.82);
        const t = gsap.parseEase("power3.inOut")(local);
        const x = node.chaos.x + (node.order.x - node.chaos.x) * t;
        const y = node.chaos.y + (node.order.y - node.chaos.y) * t;
        const circle = circles.current[i];
        if (!circle) return;
        circle.setAttribute("cx", String(x));
        circle.setAttribute("cy", String(y));
        circle.setAttribute("r", String(2.5 + t * 2));
      });

      edges.forEach(([a, b], i) => {
        const line = lines.current[i];
        const from = circles.current[a];
        const to = circles.current[b];
        if (!line || !from || !to) return;
        line.setAttribute("x1", from.getAttribute("cx") ?? "0");
        line.setAttribute("y1", from.getAttribute("cy") ?? "0");
        line.setAttribute("x2", to.getAttribute("cx") ?? "0");
        line.setAttribute("y2", to.getAttribute("cy") ?? "0");
        line.setAttribute("stroke-opacity", String(0.06 + p * 0.22));
      });
    };

    const state = { p: 0 };
    draw(0);

    gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: () => draw(state.p),
      scrollTrigger: {
        trigger: scope.querySelector("[data-network]"),
        start: "top 80%",
        end: "bottom 30%",
        scrub: 0.6
      }
    });

    gsap.to(scope.querySelectorAll("[data-symptom]"), {
      opacity: 0.25,
      filter: "blur(2px)",
      stagger: 0.04,
      ease: "none",
      scrollTrigger: {
        trigger: scope.querySelector("[data-network]"),
        start: "top 60%",
        end: "center 40%",
        scrub: 0.6
      }
    });

    gsap.fromTo(
      scope.querySelector("[data-resolved]"),
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: scope.querySelector("[data-network]"),
          start: "center 55%",
          end: "bottom 45%",
          scrub: 0.6
        }
      }
    );
  }, []);

  return (
    <section
      ref={scope}
      className="relative overflow-hidden py-28 md:py-40"
    >
      <div className="shell">
        <SectionIntro
          eyebrow={PHILOSOPHY.eyebrow}
          headline={PHILOSOPHY.headline}
          body={PHILOSOPHY.body}
        />

        <div className="relative mt-20" data-network>
          <svg
            viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
            className="h-auto w-full"
            role="img"
            aria-label="A tangle of disconnected systems reorganising into a single layered architecture."
          >
            {edges.map(([a, b], i) => (
              <line
                key={`${a}-${b}`}
                ref={(node) => {
                  lines.current[i] = node;
                }}
                stroke="#8B5CF6"
                strokeWidth="1"
                strokeOpacity="0.06"
              />
            ))}
            {nodes.map((node, i) => (
              <circle
                key={i}
                ref={(el) => {
                  circles.current[i] = el;
                }}
                cx={node.chaos.x}
                cy={node.chaos.y}
                r="2.5"
                fill={
                  node.column === 0 || node.column === COLUMNS - 1
                    ? "#C4B5FD"
                    : "#7C3AED"
                }
              />
            ))}
          </svg>

          {/* Symptoms sit over the tangle and recede as it resolves. */}
          <ul className="pointer-events-none absolute inset-0 hidden lg:block">
            {PHILOSOPHY.symptoms.map((symptom, i) => (
              <li
                key={symptom}
                data-symptom
                className="absolute font-mono text-xs uppercase tracking-[0.18em] text-mist"
                style={{
                  left: `${8 + ((i * 37) % 74)}%`,
                  top: `${10 + ((i * 23) % 76)}%`
                }}
              >
                {symptom}
              </li>
            ))}
          </ul>

          <p
            data-resolved
            data-scrub-hidden
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border border-violet-600/40 bg-ink-900/80 px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-violet-300 backdrop-blur-sm"
          >
            {PHILOSOPHY.resolvedLabel}
          </p>
        </div>

        {/* Below lg the overlay labels are hidden, so the symptoms are listed
            plainly instead — the visualisation is never the only carrier. */}
        <ul className="mt-20 grid gap-x-10 gap-y-4 border-t border-ink-700 pt-8 sm:grid-cols-2 lg:hidden">
          {PHILOSOPHY.symptoms.map((symptom) => (
            <li key={symptom} className="text-sm text-slate-muted" data-reveal>
              {symptom}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

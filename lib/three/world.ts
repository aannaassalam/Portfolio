import { ScrollTrigger } from "@/lib/motion";
import type { FormationName } from "./formations";

/**
 * Scroll state for the one continuous scene behind the page.
 *
 * Sections write TARGETS here from their ScrollTriggers; WorldScene reads
 * them every frame and eases toward them. A step change at a section boundary
 * therefore still arrives as motion, and no section needs to know what its
 * neighbours are doing. Plain mutable object on purpose: nothing in here ever
 * triggers a React render.
 */
export type Phase =
  | "hero" // the core, parked beside the headline
  | "drift" // dispersed into a starfield behind ordinary content
  | "services" // reassembled into the active discipline, fitted to its slot
  | "transit" // camera turns and starts the descent toward the city
  | "city" // the architecture flythrough
  | "ascend" // climbing back up out of the city
  | "return" // the core reassembling behind the closing call to action
  | "footer";

export const world = {
  phase: "hero" as Phase,
  /**
   * 0 assembled, 1 scattered. Owned by the two scrubs (hero act, contact);
   * every other phase decides its own spread and ignores this.
   */
  dispersion: 0,
  formation: "core" as FormationName,
  /** 0–1 travel through the architecture flythrough. */
  city: 0,
  /** Pointer in NDC, tracked at the window: a pointer-events-none canvas never sees it. */
  pointer: { x: 0, y: 0 },
  /**
   * Where the services layout wants the object, as viewport fractions:
   * centre x/y and the square's side as a fraction of viewport height.
   * Measured from the DOM so every breakpoint fits without magic numbers.
   */
  slot: { x: 0.75, y: 0.5, size: 0.72 }
};

/**
 * The city lives well below the core so the descent is a real journey.
 * A plain tuple: this module is imported by every section, and pulling
 * three.js in here would drag it into the main bundle the canvas's dynamic
 * import exists to keep it out of.
 */
export const CITY: [number, number, number] = [0, -30, -8];

/**
 * Hands the scene to `phase` while `trigger` owns the 60% line of the
 * viewport. Adjacent sections share that line, so exactly one claim is active
 * at any scroll position and the handover is a single step the scene smooths.
 * Only activation is acted on: a section leaving never has to know who's next.
 */
export function claimPhase(
  trigger: Element,
  phase: Phase,
  onClaim?: () => void,
  range: { start?: string; end?: string | (() => string) } = {}
) {
  return ScrollTrigger.create({
    trigger,
    start: range.start ?? "top 60%",
    end: range.end ?? "bottom 60%",
    onToggle: (self) => {
      if (!self.isActive) return;
      world.phase = phase;
      onClaim?.();
    }
  });
}

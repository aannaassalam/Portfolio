import { useEffect } from "react";
import { useDeviceTier } from "@/lib/motion";
import { world } from "@/lib/three/world";
import Stage from "./Stage";
import WorldScene from "./WorldScene";

/**
 * The fixed canvas under the whole page. Dynamic-import boundary for
 * everything three.js-shaped, so the first HTML payload stays free of it.
 */
export default function WorldCanvas() {
  const tier = useDeviceTier();

  useEffect(() => {
    // Tracked at the window: the canvas sits behind the content with pointer
    // events off, so it would never hear a pointer of its own.
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      world.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      world.pointer.y = 1 - (event.clientY / window.innerHeight) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Stage
      className="grain pointer-events-none fixed inset-0 z-0"
      camera={{ position: [0, 0, 7.8], fov: 46 }}
      dpr={[1, tier === "low" ? 1.25 : 1.5]}
      fallback={
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(76,29,149,0.28),transparent_60%)]" />
      }
    >
      <WorldScene tier={tier} />
    </Stage>
  );
}

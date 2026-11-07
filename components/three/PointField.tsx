import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import {
  buildFormation,
  buildNeighbourPairs,
  seededRandom,
  type FormationName
} from "@/lib/three/formations";

const vertexShader = /* glsl */ `
  attribute float aScale;
  uniform float uSize;
  uniform float uTime;
  varying float vScale;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.78 + 0.22 * sin(uTime * 1.4 + aScale * 42.0);
    vScale = aScale * twinkle;
    // uSize is a pixel size at one world unit of depth; the divide keeps
    // points shrinking with distance instead of saturating the frame.
    gl_PointSize = uSize * aScale * twinkle * (6.0 / max(-mv.z, 0.5));
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vScale;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uColorA, uColorB, clamp(vScale, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha * alpha * uOpacity);
    // Colours are authored in sRGB and handed over linear; encode on the way
    // out so the points match whether or not a composer sits in front.
    #include <colorspace_fragment>
  }
`;

interface PointFieldProps {
  count: number;
  /**
   * Formation the cloud settles into, read every frame from a ref so the
   * scene can change it without re-rendering React. Changing it animates
   * the morph.
   */
  formation: RefObject<FormationName>;
  /**
   * 0–1 blend toward the scattered state, read every frame from a ref so
   * scroll can drive it without re-rendering React.
   */
  dispersion?: RefObject<number>;
  /** 0–1 presence; multiplies every opacity the field owns. */
  presence?: RefObject<number>;
  /** Start scattered and assemble into `formation` on mount. */
  assemble?: boolean;
  edges?: boolean;
  size?: number;
  opacity?: number;
  colorA?: string;
  colorB?: string;
  /** Higher settles faster. */
  lambda?: number;
  seed?: number;
  /**
   * Shared scroll energy, 0-1. Loosens the cloud and fattens the points while
   * the page is moving, so the scene reacts to velocity and not just position.
   */
  energy?: RefObject<number>;
  /** Outward push at the midpoint of a formation change, in world units. */
  burst?: number;
}

/** Seconds a formation change takes to travel through its bulge. */
const MORPH_SECONDS = 0.9;

export default function PointField({
  count,
  formation,
  dispersion,
  presence,
  assemble = false,
  edges = false,
  size = 7,
  opacity = 0.8,
  colorA = "#7C3AED",
  colorB = "#DDD6FE",
  lambda = 2.4,
  seed = 1337,
  energy,
  burst = 0.55
}: PointFieldProps) {
  const positionAttr = useRef<THREE.BufferAttribute>(null);
  const edgeAttr = useRef<THREE.BufferAttribute>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const material = useRef<THREE.ShaderMaterial>(null);

  // Formation targets, built on first use and kept for the component's life.
  // Only ever touched from the render loop, never during render.
  const bases = useRef(new Map<FormationName, Float32Array>());

  // Morph state: 1 means settled. Reset to 0 whenever the target shape changes.
  const settled = useRef(1);
  const currentShape = useRef<FormationName>(formation.current);
  // Neighbour edges are wired for the core. Drawn over any other shape they
  // are a hairball, so they fade with the shape rather than with the points.
  const edgeFade = useRef(formation.current === "core" ? 1 : 0);

  const scattered = useMemo(
    () => buildFormation("scatter", count, seed + 7),
    [count, seed]
  );

  // Initial buffers only. Once handed to three.js these are the GPU's arrays,
  // and every per-frame write below goes through the attribute, not through
  // this memo — React-owned values are not ours to mutate.
  const { positions, scales, pairs, edgePositions } = useMemo(() => {
    const rand = seededRandom(seed + 99);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) scales[i] = 0.35 + rand() * 0.65;

    const pairs = edges
      ? buildNeighbourPairs(buildFormation("core", count, seed))
      : new Uint16Array(0);

    return {
      positions: Float32Array.from(
        assemble ? scattered : buildFormation(formation.current, count, seed)
      ),
      scales,
      pairs,
      edgePositions: new Float32Array(pairs.length * 3)
    };
    // The formation ref sets the starting shape only — later changes morph
    // the existing points, not rebuild the geometry underneath them.
  }, [count, seed, edges, assemble, scattered]); // eslint-disable-line react-hooks/exhaustive-deps

  const uniforms = useMemo(
    () => ({
      uSize: { value: size },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) }
    }),
    [size, opacity, colorA, colorB]
  );

  useFrame((_, delta) => {
    const attr = positionAttr.current;
    if (!attr) return;

    // Clamp: a backgrounded tab can hand back a multi-second delta.
    const dt = Math.min(delta, 0.05);
    const blend = 1 - Math.exp(-lambda * dt);
    const spread = Math.min(Math.max(dispersion?.current ?? 0, 0), 1);
    const flow = Math.min(Math.max(energy?.current ?? 0, 0), 1);
    const here = Math.min(Math.max(presence?.current ?? 1, 0), 1);
    const shape = formation.current;
    const live = attr.array as Float32Array;

    const cache = bases.current;
    let base = cache.get(shape);
    // Length check also covers the device tier changing the particle count.
    if (!base || base.length !== live.length) {
      base = buildFormation(shape, count, seed);
      cache.set(shape, base);
    }

    // A formation change travels through an outward bulge rather than sliding
    // straight to the target — a straight lerp between two shapes reads as a
    // cross-fade, not as one system becoming another.
    if (currentShape.current !== shape) {
      currentShape.current = shape;
      settled.current = 0;
    }
    settled.current = Math.min(1, settled.current + dt / MORPH_SECONDS);
    const bulge = burst * Math.sin(Math.PI * settled.current);

    // Scroll energy loosens the cloud a little past its resting shape.
    const loosen = Math.min(spread + flow * 0.14, 1.15);

    for (let i = 0; i < live.length; i += 3) {
      let tx = base[i] + (scattered[i] - base[i]) * loosen;
      let ty = base[i + 1] + (scattered[i + 1] - base[i + 1]) * loosen;
      let tz = base[i + 2] + (scattered[i + 2] - base[i + 2]) * loosen;

      if (bulge > 0.001) {
        const len = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
        const push = 1 + bulge / len;
        tx *= push;
        ty *= push;
        tz *= push;
      }

      live[i] += (tx - live[i]) * blend;
      live[i + 1] += (ty - live[i + 1]) * blend;
      live[i + 2] += (tz - live[i + 2]) * blend;
    }
    attr.needsUpdate = true;

    if (edgeAttr.current && pairs.length) {
      const lines = edgeAttr.current.array as Float32Array;
      for (let p = 0; p < pairs.length; p++) {
        const src = pairs[p] * 3;
        const dst = p * 3;
        lines[dst] = live[src];
        lines[dst + 1] = live[src + 1];
        lines[dst + 2] = live[src + 2];
      }
      edgeAttr.current.needsUpdate = true;
    }
    // Edges stretch as the cloud scatters; thin them so the starfield behind
    // body copy stays a starfield rather than a web.
    edgeFade.current += ((shape === "core" ? 1 : 0) - edgeFade.current) * blend;
    if (edgeMat.current) {
      edgeMat.current.opacity =
        0.16 * here * edgeFade.current * (1 - spread * 0.7);
    }

    if (material.current) {
      const u = material.current.uniforms;
      u.uTime.value += dt;
      // Edges only read as structure while the system is organised.
      u.uOpacity.value = opacity * (1 - spread * 0.45) * here;
      // Points thicken slightly with scroll speed, like a longer exposure.
      u.uSize.value = size * (1 + flow * 0.4);
    }
  });

  return (
    <group>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            ref={positionAttr}
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {edges && pairs.length > 0 && (
        <lineSegments frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute
              ref={edgeAttr}
              attach="attributes-position"
              args={[edgePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={edgeMat}
            color="#8B5CF6"
            transparent
            opacity={0.16}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}
    </group>
  );
}

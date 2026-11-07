import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { world } from "@/lib/three/world";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Clip space directly: a sky that never moves with the camera.
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uDrift;
  uniform vec2 uPointer;
  uniform float uFlow;
  uniform float uVeil;
  uniform float uAspect;
  uniform vec3 uBase;
  uniform vec3 uCloud;
  uniform vec3 uGlow;
  varying vec2 vUv;

  // No sine. The classic sin() hash collapses to a flat value on Apple GPUs
  // once its argument grows, which shows up as a dead band across the sky.
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0);
    uv += uPointer * vec2(0.035, 0.025);

    // Domain-warped clouds. The drift is a slow circle, so the sampling point
    // never wanders far from the origin however long the page stays open.
    vec2 q = vec2(fbm(uv * 1.15 + uDrift), fbm(uv * 1.15 - uDrift.yx * 0.7 + 3.1));
    float n = fbm(uv * 1.5 + 1.9 * q + uDrift * 0.4);
    float cloud = smoothstep(0.32, 0.86, n);
    float core = smoothstep(0.62, 0.96, n);

    // The veil drops the sky while the camera is inside the city, so the
    // skyline reads against fog rather than against more violet.
    float lift = 1.0 - uVeil * 0.75;
    vec3 col = uBase;
    col = mix(col, uCloud, cloud * 0.6 * lift);
    col += uGlow * core * (0.32 + uFlow * 0.45) * lift;

    // Pinpoint stars, one per sparse cell, each twinkling on its own phase.
    vec2 sp = vUv * vec2(uAspect, 1.0) * 160.0;
    vec2 g = floor(sp);
    vec2 f = fract(sp);
    float r = hash(g);
    vec2 c = vec2(hash(g + 7.1), hash(g + 3.3));
    float star = step(0.985, r) * (1.0 - smoothstep(0.0, 0.14, length(f - c)));
    star *= 0.55 + 0.45 * sin(uTime * 1.3 + r * 60.0);
    col += vec3(0.85, 0.82, 1.0) * star * 0.5 * (1.0 - uVeil * 0.5);

    // Vignette: the copy always has a dark edge to sit on.
    float vig = 1.0 - smoothstep(0.2, 1.25, length(uv));
    col *= 0.5 + 0.5 * vig;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

interface NebulaProps {
  /** Shared scroll energy, 0–1. */
  energy: RefObject<number>;
  /** 0–1, how far the sky recedes (1 inside the city). Pre-smoothed. */
  veil: RefObject<number>;
}

/**
 * The sky. A full-screen quad in clip space, drawn first with no depth, so it
 * sits behind everything wherever the camera goes. One evaluation of warped
 * noise per pixel — cheap enough to run under the whole page.
 */
export default function Nebula({ energy, veil }: NebulaProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const phase = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDrift: { value: new THREE.Vector2(3, 0) },
      uPointer: { value: new THREE.Vector2() },
      uFlow: { value: 0 },
      uVeil: { value: 0 },
      uAspect: { value: 1 },
      uBase: { value: new THREE.Color("#07060f") },
      uCloud: { value: new THREE.Color("#1b1444") },
      uGlow: { value: new THREE.Color("#6d28d9") }
    }),
    []
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const dt = Math.min(delta, 0.05);
    const ease = 1 - Math.exp(-2 * dt);
    const flow = Math.min(Math.max(energy.current ?? 0, 0), 1);
    // Scroll energy speeds the drift, so the sky is felt to move when the
    // page does. Integrated here rather than scaled in the shader, so a burst
    // of energy nudges the pattern instead of teleporting it.
    phase.current += dt * (0.02 + flow * 0.04);
    (u.uDrift.value as THREE.Vector2).set(
      Math.cos(phase.current) * 3,
      Math.sin(phase.current) * 3
    );
    // Only the twinkle reads the clock; wrapped so it stays precise for days.
    u.uTime.value = (u.uTime.value + dt) % 1000;
    u.uFlow.value = flow;
    u.uVeil.value = veil.current ?? 0;
    u.uAspect.value = state.size.width / state.size.height;
    const p = u.uPointer.value as THREE.Vector2;
    p.x += (world.pointer.x - p.x) * ease;
    p.y += (world.pointer.y - p.y) * ease;
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

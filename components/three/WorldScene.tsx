import { useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshTransmissionMaterial
} from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useRef } from "react";
import * as THREE from "three";
import { useScrollEnergy } from "@/lib/motion";
import type { FormationName } from "@/lib/three/formations";
import { CITY, world, type Phase } from "@/lib/three/world";
import City from "./City";
import Nebula from "./Nebula";
import PointField from "./PointField";

const FOV = 46;
const HALF_FOV_TAN = Math.tan((FOV / 2) * (Math.PI / 180));
const CITY_ORIGIN = new THREE.Vector3(...CITY);
/** Half-extent of the largest formation; the services slot must fit it. */
const OBJECT_RADIUS = 2.24;

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

interface Targets {
  /** Where the object parks, in NDC. */
  ndc: [number, number];
  /** Camera distance from the origin. */
  dist: number;
  /** 0–1 presence of the object; multiplies every opacity it owns. */
  presence: number;
  /** 0 assembled, 1 scattered. `null` follows the scrubbed world.dispersion. */
  spread: number | null;
  /** 0–1 visibility of the lattice, cage, rings and nucleus around the points. */
  shell: number;
}

/**
 * What each phase asks for. Phases hand over with a step; the frame loop
 * eases toward these, so the handover is what the visitor sees as motion.
 */
function targetsFor(phase: Phase, wide: boolean, spread: number): Targets {
  switch (phase) {
    case "hero":
      // Wide screens park the core right of the headline. Narrow ones have
      // no horizontal room, so it drops below the copy instead of sitting
      // behind it. The camera pushes in as the system comes apart.
      return wide
        ? {
            ndc: [0.48, 0],
            dist: 7.8 - spread * 3.8,
            presence: 1,
            spread: null,
            shell: 1
          }
        : {
            ndc: [0, -0.23],
            dist: 11.2 - spread * 3.8,
            presence: 1,
            spread: null,
            shell: 1
          };
    case "services": {
      // Fit the object to the square the layout measured for it. Only the
      // points take part: a phone inside a geodesic sphere is not a phone.
      const slot = world.slot;
      return {
        ndc: [slot.x * 2 - 1, 1 - slot.y * 2],
        dist: OBJECT_RADIUS / (Math.max(slot.size, 0.2) * HALF_FOV_TAN),
        presence: 1,
        spread: 0,
        shell: 0
      };
    }
    case "return":
      return { ndc: [0, 0], dist: 8.6, presence: 1, spread: null, shell: 1 };
    case "footer":
      return { ndc: [0, 0], dist: 8.6, presence: 0.15, spread: null, shell: 1 };
    case "city":
      return { ndc: [0, 0], dist: 9.5, presence: 0, spread: 1, shell: 0 };
    default:
      // drift · transit · ascend: a loose starfield behind the content.
      return { ndc: [0, 0], dist: 9.5, presence: 0.45, spread: 1, shell: 0 };
  }
}

/**
 * The one scene. Everything 3D on the site lives here, under a fixed canvas,
 * and scroll moves the camera and the object through it: the core beside the
 * headline, taken apart, reassembled into each discipline, left behind on the
 * descent into the city, and put back together behind the closing line.
 */
export default function WorldScene({ tier }: { tier: "low" | "high" }) {
  const high = tier === "high";
  const energy = useScrollEnergy();

  const system = useRef<THREE.Group>(null);
  const lattice = useRef<THREE.Mesh>(null);
  const latticeMat = useRef<THREE.MeshBasicMaterial>(null);
  const cage = useRef<THREE.Mesh>(null);
  const cageMat = useRef<THREE.MeshBasicMaterial>(null);
  const rings = useRef<THREE.Group>(null);
  const nucleus = useRef<THREE.Mesh>(null);
  const key = useRef<THREE.PointLight>(null);

  // Smoothed copies of the world targets. Refs handed to children are read
  // in their own frame callbacks, never during render.
  const spread = useRef(0);
  const presence = useRef(1);
  const shell = useRef(1);
  const formation = useRef<FormationName>("core");
  const cityT = useRef(0);
  const veil = useRef(0);
  const cityPresence = useRef(0);
  const smooth = useRef({
    px: 0,
    py: 0,
    roll: 0,
    look: new THREE.Vector3(),
    camTarget: new THREE.Vector3(0, 0, 7.8),
    lookTarget: new THREE.Vector3(),
    anchor: new THREE.Vector3()
  });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = smooth.current;
    const phase = world.phase;
    const wide = state.size.width >= 1024;
    const aspect = state.size.width / state.size.height;
    const flow = clamp01(energy.current ?? 0);
    const ease = 1 - Math.exp(-2.4 * dt);

    s.px += (world.pointer.x - s.px) * ease;
    s.py += (world.pointer.y - s.py) * ease;
    formation.current = world.formation;

    const want = targetsFor(phase, wide, spread.current);
    const spreadTarget = want.spread ?? clamp01(world.dispersion);
    spread.current += (spreadTarget - spread.current) * ease;
    presence.current += (want.presence - presence.current) * ease;
    shell.current += (want.shell - shell.current) * ease;
    veil.current += ((phase === "city" ? 1 : 0) - veil.current) * ease;
    // The city exists for the approach and the flythrough. Climbing out, it
    // fades rather than lingering below as a fogged silhouette against the sky.
    cityPresence.current +=
      ((phase === "city" || phase === "transit" ? 1 : 0) - cityPresence.current) * ease;
    // The flythrough is scrubbed, so it tracks tighter than the handovers.
    cityT.current += (clamp01(world.city) - cityT.current) * (1 - Math.exp(-6 * dt));

    // Camera. Every phase is a position and a point to look at; the city adds
    // a bank on the way in that levels off once the links resolve.
    let rollTarget = 0;
    if (phase === "city") {
      const t = cityT.current;
      const z = 14 - t * 26;
      s.camTarget.set(s.px * 1.6, 7.5 - t * 5.6, z).add(CITY_ORIGIN);
      s.lookTarget.set(0, 1.4 + (1 - t) * 0.8, z - 12).add(CITY_ORIGIN);
      rollTarget = (1 - t) * 0.07 + s.px * 0.02;
    } else if (phase === "transit") {
      s.camTarget.set(0, -6, 13);
      s.lookTarget.set(0, -18, -8);
    } else {
      s.camTarget.set(0, 0, want.dist);
      s.lookTarget.set(0, 0, 0);
    }
    const camEase = 1 - Math.exp(-(phase === "city" ? 6 : 2.2) * dt);
    state.camera.position.lerp(s.camTarget, camEase);
    s.look.lerp(s.lookTarget, camEase);
    state.camera.lookAt(s.look);
    s.roll += (rollTarget - s.roll) * camEase;
    // After lookAt, which writes the whole quaternion.
    state.camera.rotateZ(s.roll);

    // The object parks at an NDC anchor, converted at the camera's current
    // distance so it keeps its screen position while the camera moves.
    const dist = state.camera.position.length();
    s.anchor.set(
      want.ndc[0] * dist * HALF_FOV_TAN * aspect + s.px * 0.25,
      want.ndc[1] * dist * HALF_FOV_TAN,
      0
    );

    const p = presence.current;
    const sp = spread.current;
    // The structure around the points: fully there for the core, gone while
    // the points are busy being a phone, a dashboard or a data centre.
    const sh = shell.current;

    if (system.current) {
      system.current.position.lerp(s.anchor, ease);
      system.current.rotation.y += dt * 0.11;
      // Cursor tilts the whole structure rather than swinging the camera —
      // reads as inspecting an object, not a shaky handheld shot.
      system.current.rotation.x += (s.py * 0.18 - system.current.rotation.x) * ease;
    }

    // The lattice counter-rotates against the system so the two shells shear
    // past each other — that relative motion is what reads as depth.
    if (lattice.current) {
      lattice.current.rotation.y -= dt * 0.19;
      lattice.current.rotation.x += dt * 0.05;
      lattice.current.scale.setScalar(1 + sp * 0.85 + flow * 0.03);
    }
    if (latticeMat.current) {
      latticeMat.current.opacity = (wide ? 0.16 : 0.09) * (1 - sp) * p * sh;
    }

    if (cage.current) {
      cage.current.rotation.y += dt * 0.26;
      cage.current.rotation.z -= dt * 0.13;
      cage.current.scale.setScalar(Math.max((1 - sp * 0.6) * p, 0.001));
    }
    if (cageMat.current) {
      cageMat.current.opacity = (wide ? 0.3 : 0.18) * (1 - sp) * p * sh;
    }

    if (rings.current) {
      rings.current.rotation.z -= dt * 0.06;
      rings.current.rotation.x += dt * 0.02;
      rings.current.traverse((child) => {
        const material = (child as THREE.Mesh).material as
          | THREE.Material
          | undefined;
        if (material && "opacity" in material) {
          material.opacity = 0.34 * (1 - sp) * p * sh;
        }
      });
    }

    if (nucleus.current) {
      nucleus.current.scale.setScalar(
        Math.max((1 - sp * 0.75) * p * sh, 0.001)
      );
      nucleus.current.rotation.y -= dt * 0.07;
    }

    // Key light dims as the core disperses, and flares a little on fast scroll.
    if (key.current) {
      key.current.intensity =
        14 * (1 - sp * 0.6) * (1 + flow * 0.35) * p * sh;
    }
  });

  return (
    <>
      {/* Midnight-blue ambient keeps shadows blue everywhere; violet is only
          ever a key light, so the frame never collapses into one purple. */}
      <fogExp2 attach="fog" args={["#05050c", 0.028]} />
      <ambientLight intensity={0.45} color="#5A6BFF" />
      <directionalLight position={[6, 12, 4]} intensity={0.55} color="#C4B5FD" />

      <Nebula energy={energy} veil={veil} />

      {high && (
        // Three soft panels in a room the glass can reflect. Rendered once.
        <Environment resolution={128} frames={1} environmentIntensity={0.5}>
          <Lightformer
            form="rect"
            intensity={3}
            color="#c4b5fd"
            position={[0, 4, -3]}
            scale={[6, 3, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="ring"
            intensity={2.5}
            color="#8b5cf6"
            position={[-4, 1, 3]}
            scale={3}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.6}
            color="#3b4bcc"
            position={[4, -2, 2]}
            scale={[3, 5, 1]}
            target={[0, 0, 0]}
          />
        </Environment>
      )}

      <group ref={system}>
        <pointLight ref={key} position={[2.5, 2, 3]} intensity={14} color="#8B5CF6" />
        <pointLight position={[-3, -1.5, -2]} intensity={6} color="#C4B5FD" />

        {/* Geodesic shell. Detail 1 keeps it to 80 faces — enough triangulation
            to read as engineered, few enough to stay legible behind the type. */}
        <mesh ref={lattice}>
          <icosahedronGeometry args={[1.6, 1]} />
          <meshBasicMaterial
            ref={latticeMat}
            color="#A855F7"
            wireframe
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>

        <PointField
          count={high ? 3200 : 1400}
          formation={formation}
          dispersion={spread}
          presence={presence}
          assemble
          edges
          size={high ? 7 : 6}
          lambda={1.6}
          energy={energy}
          burst={0.55}
        />

        {/* Cage around the nucleus, spinning the other way again. Without it
            the lit solid reads as a lone bead rather than a contained core. */}
        <mesh ref={cage}>
          <icosahedronGeometry args={[0.74, 0]} />
          <meshBasicMaterial
            ref={cageMat}
            color="#8B5CF6"
            wireframe
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>

        {/* The heart of the object. On capable devices it is glass: the point
            cloud and the sky bend through it. Elsewhere, a lit solid. */}
        <mesh ref={nucleus}>
          <icosahedronGeometry args={[0.46, 1]} />
          {high ? (
            <MeshTransmissionMaterial
              samples={6}
              resolution={384}
              transmission={1}
              thickness={0.55}
              roughness={0.12}
              ior={1.35}
              chromaticAberration={0.05}
              anisotropicBlur={0.15}
              distortion={0.25}
              distortionScale={0.35}
              temporalDistortion={0.08}
              color="#d8ccff"
              attenuationColor="#8b5cf6"
              attenuationDistance={1.2}
              emissive="#4c1d95"
              emissiveIntensity={0.35}
              flatShading
            />
          ) : (
            <meshStandardMaterial
              color="#0B0B0F"
              emissive="#4C1D95"
              emissiveIntensity={0.3}
              roughness={0.22}
              metalness={0.95}
              flatShading
            />
          )}
        </mesh>

        <group ref={rings}>
          {[
            { radius: 1.78, rotation: [Math.PI / 2, 0, 0] },
            { radius: 2.0, rotation: [Math.PI / 2.3, 0.5, 0] },
            { radius: 2.24, rotation: [Math.PI / 1.8, -0.4, 0.3] }
          ].map((ring) => (
            <mesh
              key={ring.radius}
              rotation={ring.rotation as [number, number, number]}
            >
              <torusGeometry args={[ring.radius, 0.004, 3, 128]} />
              <meshBasicMaterial
                color="#A855F7"
                transparent
                opacity={0.34}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      </group>

      <City progress={cityT} presence={cityPresence} tier={tier} />

      {/* Bloom only. The threshold sits above the structural towers and the
          dim points, so only the hot towers, the pulses and the brightest
          nodes flare. Skipped on the low tier, where the fill cost is not
          worth it. */}
      {high && (
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.22}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
}

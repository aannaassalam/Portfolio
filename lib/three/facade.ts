/**
 * Procedural building facade.
 *
 * Windows are generated in the fragment shader rather than textured, so the
 * whole city stays one draw call per pass and no atlas has to be authored,
 * loaded or kept in sync with tower heights.
 *
 * Two details matter for it to read as architecture rather than a grid:
 *
 *  - Floor height is constant in WORLD units. The box geometry is a unit cube
 *    scaled per instance, so a naive `uv.y` grid would stretch: tall towers
 *    would get tall windows. The vertical cell count is derived from the
 *    instance's own Y scale instead, which keeps every floor the same height
 *    across the skyline.
 *  - Roofs get no windows. Without the normal check, the top face of every
 *    box is tiled too, and the city reads as a circuit board from above.
 */

import * as THREE from "three";

export interface FacadeOptions {
  /** Base surface colour of the structure. */
  color: THREE.ColorRepresentation;
  /** Window colour once lit. */
  lit: THREE.ColorRepresentation;
  /** 0–1 share of windows that are lit. */
  occupancy: number;
  /** Emissive strength of a lit window. Above ~1 it starts to bloom. */
  glow: number;
  /** World height of one floor. */
  floor?: number;
  /** Windows across one face. */
  columns?: number;
  roughness?: number;
  metalness?: number;
}

export function createFacadeMaterial({
  color,
  lit,
  occupancy,
  glow,
  floor = 0.22,
  columns = 7,
  roughness = 0.55,
  metalness = 0.4
}: FacadeOptions) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLit = { value: new THREE.Color(lit) };
    shader.uniforms.uOccupancy = { value: occupancy };
    shader.uniforms.uGlow = { value: glow };
    shader.uniforms.uFloor = { value: floor };
    shader.uniforms.uColumns = { value: columns };

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec2 vFacadeUv;
         varying float vFloors;
         varying vec3 vFacadeNormal;
         varying vec2 vTowerId;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         vFacadeUv = uv;
         vFacadeNormal = normal;
         #ifdef USE_INSTANCING
           // Column 1 of the instance matrix is the Y axis; its length is the
           // tower's height, which is what keeps floors world-constant.
           float towerHeight = length(instanceMatrix[1].xyz);
           vTowerId = vec2(instanceMatrix[3].x, instanceMatrix[3].z);
         #else
           float towerHeight = 1.0;
           vTowerId = vec2(0.0);
         #endif
         vFloors = max(1.0, floor(towerHeight / ${floor.toFixed(3)}));`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform vec3 uLit;
         uniform float uOccupancy;
         uniform float uGlow;
         uniform float uColumns;
         varying vec2 vFacadeUv;
         varying float vFloors;
         varying vec3 vFacadeNormal;
         varying vec2 vTowerId;

         float facadeHash(vec2 p) {
           vec3 p3 = fract(vec3(p.xyx) * 0.1031);
           p3 += dot(p3, p3.yzx + 33.33);
           return fract((p3.x + p3.y) * p3.z);
         }`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
         // Roofs stay blank — tiling the top face makes the city read as a
         // circuit board when the camera is still above it.
         if (abs(vFacadeNormal.y) < 0.5) {
           vec2 grid = vec2(uColumns, vFloors);
           vec2 cell = floor(vFacadeUv * grid);
           vec2 within = fract(vFacadeUv * grid);

           // Mullions: a margin of dark around each pane.
           float pane =
             step(0.16, within.x) * step(within.x, 0.84) *
             step(0.20, within.y) * step(within.y, 0.80);

           float roll = facadeHash(cell + vTowerId * 7.31);
           float on = step(1.0 - uOccupancy, roll);
           // Lit windows vary in brightness so no two floors match exactly.
           float vary = 0.55 + 0.45 * facadeHash(cell.yx + vTowerId);

           totalEmissiveRadiance += uLit * pane * on * vary * uGlow;
           // Unlit panes read slightly darker than the wall, giving the
           // facade texture even where nothing is switched on.
           diffuseColor.rgb *= 1.0 - pane * (1.0 - on) * 0.45;
         }`
      );
  };

  // Any change to the injected source needs a new program.
  material.customProgramCacheKey = () =>
    `facade-${occupancy}-${glow}-${floor}-${columns}`;

  return material;
}

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Color, type Group, type ShaderMaterial } from 'three';
import { scroll } from '../scroll';
import { COLORS, SPACING, rig } from './state';

const vertexShader = /* glsl */ `
  attribute vec3 aSeed;
  attribute float aRand;
  uniform float uTime;
  uniform float uCamY;
  uniform float uPixel;
  varying float vRand;
  varying float vFade;
  void main() {
    vec3 box = vec3(34.0, 26.0, 26.0);
    vec3 p = aSeed * box;
    // Dust is fixed in the world; wrapping it around the camera makes the
    // descent between chapters read as speed.
    p.y = mod(p.y - uCamY + sin(uTime * 0.12 + aRand * 6.283) * 0.8, box.y);
    p.x += sin(uTime * 0.17 + aRand * 40.0) * 0.5;
    p -= box * 0.5;
    p.z -= 5.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    vFade = smoothstep(1.0, 4.0, depth) * (1.0 - smoothstep(16.0, 26.0, depth));
    vFade *= 1.0 - smoothstep(0.4, 0.5, abs(p.y / box.y));
    vRand = aRand;
    float twinkle = 0.65 + 0.35 * sin(uTime * (1.0 + aRand * 2.0) + aRand * 90.0);
    gl_PointSize = uPixel * (16.0 + aRand * 44.0) * twinkle / depth;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vRand;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    vec3 color = mix(uColorA, uColorB, step(0.62, vRand));
    gl_FragColor = vec4(color, a * vFade * 0.85);
  }
`;

export function Particles({ count }: { count: number }) {
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);

  const { seeds, rands } = useMemo(() => {
    const seeds = new Float32Array(count * 3);
    const rands = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seeds[i * 3] = Math.random();
      seeds[i * 3 + 1] = Math.random();
      seeds[i * 3 + 2] = Math.random();
      rands[i] = Math.random();
    }
    return { seeds, rands };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCamY: { value: 0 },
      uPixel: { value: 1 },
      uColorA: { value: new Color(COLORS.cyan) },
      uColorB: { value: new Color(COLORS.violet) },
    }),
    [],
  );

  useFrame((state) => {
    const camY = -rig.chapter * SPACING;
    if (group.current) group.current.position.y = camY;
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime + scroll.progress * 4;
    u.uCamY.value = camY;
    u.uPixel.value = state.gl.getPixelRatio() * (state.size.height / 900);
  });

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[seeds, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 3]} />
          <bufferAttribute attach="attributes-aRand" args={[rands, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}

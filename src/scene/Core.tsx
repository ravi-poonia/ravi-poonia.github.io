import { MeshTransmissionMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { scroll } from '../scroll';
import { COLORS, SPACING, damp, keyed, rig } from './state';

// Per chapter: hero, about, work, stack, experience, contact.
const SCALE = [1, 0.85, 0, 0, 0, 2.2];
const SIDE = [1.9, -2.5, -2.5, 0, 0, 0];
const DEPTH = [0, 0, 0, -14, -14, -14];

const RINGS = [
  { radius: 2.35, tilt: [1.2, 0.2, 0] as const, speed: 0.35, color: COLORS.cyan },
  { radius: 2.7, tilt: [0.5, 0.9, 0.4] as const, speed: -0.24, color: COLORS.violet },
  { radius: 3.1, tilt: [1.7, -0.5, 0.9] as const, speed: 0.16, color: COLORS.cyan },
];

/** The glass crystal that opens and closes the page. */
export function Core({ low }: { low: boolean }) {
  const root = useRef<Group>(null);
  const crystal = useRef<Mesh>(null);
  const heart = useRef<Mesh>(null);
  const shell = useRef<Mesh>(null);
  const rings = useRef<(Group | null)[]>([]);
  const energy = useRef(0);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const scale = keyed(SCALE);
    g.visible = scale > 0.01;
    if (!g.visible) return;

    const t = state.clock.elapsedTime;
    // Stays with the camera through the first two chapters, waits at the last.
    const stage = rig.chapter < 3 ? Math.min(rig.chapter, 1) : 5;
    g.position.set(keyed(SIDE) * rig.shift, -stage * SPACING + Math.sin(t * 0.6) * 0.12 + (1 - rig.shift) * 2.1, keyed(DEPTH));
    g.scale.setScalar(scale * (0.78 + 0.22 * rig.shift));

    energy.current = damp(energy.current, Math.min(1, Math.abs(scroll.velocity) / 40), 4, dt);
    const spin = 1 + energy.current * 5;

    g.rotation.y = damp(g.rotation.y, scroll.pointerX * 0.5, 3, dt);
    g.rotation.x = damp(g.rotation.x, -scroll.pointerY * 0.35, 3, dt);
    if (crystal.current) {
      crystal.current.rotation.y += dt * 0.25 * spin;
      crystal.current.rotation.z += dt * 0.11 * spin;
    }
    if (heart.current) {
      heart.current.rotation.y -= dt * 0.9;
      heart.current.rotation.x += dt * 0.6;
      heart.current.scale.setScalar(0.42 + Math.sin(t * 2.2) * 0.04 + energy.current * 0.2);
    }
    if (shell.current) {
      shell.current.rotation.y -= dt * 0.12 * spin;
      shell.current.rotation.x += dt * 0.07 * spin;
    }
    rings.current.forEach((ring, i) => {
      if (ring) ring.rotation.z += dt * RINGS[i].speed * spin;
    });
  });

  return (
    <group ref={root}>
      <mesh ref={crystal}>
        <icosahedronGeometry args={[1.3, 0]} />
        {low ? (
          <meshPhysicalMaterial
            color="#9fdcff"
            metalness={0.2}
            roughness={0.08}
            iridescence={1}
            iridescenceIOR={1.6}
            clearcoat={1}
            transparent
            opacity={0.55}
            flatShading
          />
        ) : (
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            thickness={1.4}
            roughness={0.04}
            ior={1.45}
            chromaticAberration={0.6}
            anisotropicBlur={0.05}
            distortion={0.12}
            distortionScale={0.4}
            temporalDistortion={0.15}
            color="#cfeaff"
            attenuationColor={COLORS.violet}
            attenuationDistance={3}
            flatShading
          />
        )}
      </mesh>

      <mesh ref={heart}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={COLORS.cyan} toneMapped={false} />
      </mesh>

      <mesh ref={shell}>
        <icosahedronGeometry args={[1.95, 1]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.16} toneMapped={false} />
      </mesh>

      {RINGS.map((ring, i) => (
        <group key={ring.radius} rotation={[...ring.tilt]}>
          <group ref={(el) => void (rings.current[i] = el)}>
            <mesh>
              <torusGeometry args={[ring.radius, 0.006, 8, 160]} />
              <meshBasicMaterial color={ring.color} transparent opacity={0.55} toneMapped={false} />
            </mesh>
            <mesh position={[ring.radius, 0, 0]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial color={ring.color} toneMapped={false} />
            </mesh>
            <mesh position={[-ring.radius * 0.5, ring.radius * 0.866, 0]}>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

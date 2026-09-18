import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BufferGeometry, Color, Float32BufferAttribute, type Group, type InstancedMesh, Object3D } from 'three';
import { scroll } from '../scroll';
import { COLORS, SPACING, presence, rig } from './state';

const CHAPTER = 4;
const STEPS = 72;
const HEIGHT = 9;
const RADIUS = 1.15;
const TURNS = 2.6;

/** Two strands and their rungs: years stacked on years. */
export function Helix() {
  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const beads = useRef<InstancedMesh>(null);

  const rungs = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < STEPS; i += 3) {
      const a = (i / STEPS) * Math.PI * 2 * TURNS;
      const y = (i / STEPS - 0.5) * HEIGHT;
      points.push(Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS, -Math.cos(a) * RADIUS, y, -Math.sin(a) * RADIUS);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    return geometry;
  }, []);

  useLayoutEffect(() => {
    const mesh = beads.current;
    if (!mesh) return;
    const dummy = new Object3D();
    const cyan = new Color(COLORS.cyan);
    const violet = new Color(COLORS.violet);
    for (let i = 0; i < STEPS; i++) {
      const a = (i / STEPS) * Math.PI * 2 * TURNS;
      const y = (i / STEPS - 0.5) * HEIGHT;
      for (let strand = 0; strand < 2; strand++) {
        const sign = strand ? -1 : 1;
        dummy.position.set(Math.cos(a) * RADIUS * sign, y, Math.sin(a) * RADIUS * sign);
        dummy.scale.setScalar(i % 3 === 0 ? 1.5 : 0.8);
        dummy.updateMatrix();
        mesh.setMatrixAt(i * 2 + strand, dummy.matrix);
        mesh.setColorAt(i * 2 + strand, strand ? violet : cyan);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame((_, dt) => {
    const g = root.current;
    if (!g || !spin.current) return;
    const p = presence(CHAPTER);
    g.visible = p > 0.01;
    if (!g.visible) return;
    g.position.set(2.9 * rig.shift, -CHAPTER * SPACING, -1 - 2 * (1 - rig.shift));
    g.rotation.z = -0.35;
    g.scale.setScalar(0.7 + 0.3 * p);
    spin.current.rotation.y += dt * (0.35 + Math.min(2, Math.abs(scroll.velocity) / 20));
  });

  return (
    <group ref={root}>
      <group ref={spin}>
        <instancedMesh ref={beads} args={[undefined, undefined, STEPS * 2]} frustumCulled={false}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
        <lineSegments geometry={rungs}>
          <lineBasicMaterial color={COLORS.cyan} transparent opacity={0.25} toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  );
}

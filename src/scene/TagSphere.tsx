import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type Group, type Sprite, Vector3 } from 'three';
import { stack } from '../content';
import { scroll } from '../scroll';
import { COLORS, SPACING, damp, labelTexture, presence, rig } from './state';

const CHAPTER = 3;
const RADIUS = 2.3;
const world = new Vector3();

/** The stack as a slowly turning globe of labels; nearer labels read brighter. */
export function TagSphere() {
  const root = useRef<Group>(null);
  const globe = useRef<Group>(null);
  const sprites = useRef<(Sprite | null)[]>([]);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && setFontsReady(true));
    return () => void (alive = false);
  }, []);

  const tags = useMemo(() => {
    if (!fontsReady) return [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    return stack.map((name, i) => {
      const y = 1 - ((i + 0.5) / stack.length) * 2;
      const r = Math.sqrt(1 - y * y);
      const position: [number, number, number] = [
        Math.cos(golden * i) * r * RADIUS,
        y * RADIUS,
        Math.sin(golden * i) * r * RADIUS,
      ];
      return { name, position, texture: labelTexture(name, i % 3 === 0 ? COLORS.violet : COLORS.cyan) };
    });
  }, [fontsReady]);

  useEffect(() => () => tags.forEach((tag) => tag.texture.dispose()), [tags]);

  useFrame((_, dt) => {
    const g = root.current;
    if (!g || !globe.current) return;
    const p = presence(CHAPTER);
    g.visible = p > 0.01;
    if (!g.visible) return;
    g.position.set(-2.2 * rig.shift, -CHAPTER * SPACING + 0.4 * (1 - rig.shift), -1.5 * (1 - rig.shift));
    g.scale.setScalar(0.5 + 0.35 * p);
    globe.current.rotation.y += dt * (0.18 + scroll.pointerX * 0.5);
    globe.current.rotation.x = damp(globe.current.rotation.x, -scroll.pointerY * 0.5, 3, dt);
    sprites.current.forEach((sprite) => {
      if (!sprite) return;
      sprite.getWorldPosition(world);
      // 1 on the side of the globe facing the camera, 0 on the far side.
      const near = Math.min(1, Math.max(0, (world.z - g.position.z) / (RADIUS * 2 * g.scale.z) + 0.5));
      sprite.material.opacity = (0.12 + 0.88 * near * near) * p;
      const s = 0.75 + near * 0.45;
      sprite.scale.set(1.5 * s, 0.375 * s, 1);
    });
  });

  return (
    <group ref={root}>
      <group ref={globe}>
        <mesh>
          <icosahedronGeometry args={[RADIUS * 0.82, 2]} />
          <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.07} toneMapped={false} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.28, 0]} />
          <meshBasicMaterial color={COLORS.violet} toneMapped={false} />
        </mesh>
        {tags.map((tag, i) => (
          <sprite key={tag.name} position={tag.position} ref={(el) => void (sprites.current[i] = el)}>
            <spriteMaterial map={tag.texture} transparent depthWrite={false} toneMapped={false} />
          </sprite>
        ))}
      </group>
    </group>
  );
}

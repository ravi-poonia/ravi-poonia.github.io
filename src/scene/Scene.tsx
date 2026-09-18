import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useMemo, useState } from 'react';
import { Vector2, Vector3 } from 'three';
import { reducedMotion, scroll } from '../scroll';
import { Core } from './Core';
import { Helix } from './Helix';
import { Particles } from './Particles';
import { TagSphere } from './TagSphere';
import { TruckWorld } from './TruckWorld';
import { COLORS, SPACING, clamp01, damp, lerp, rig, smooth } from './state';

type Shot = { position: [number, number, number]; target: [number, number, number]; offset?: [number, number, number] };

// One shot per chapter, relative to that chapter's stage. `offset` slides the
// target sideways on wide screens so the subject clears the text column.
const SHOTS: Shot[] = [
  { position: [0, 0, 8.5], target: [0, 0, 0] },
  { position: [0, 0.2, 7.8], target: [0, 0, 0] },
  { position: [8.4, 2.6, 12.5], target: [0, 0.6, 0], offset: [-3.4, 0, 2.2] },
  { position: [0, 0, 8.5], target: [0, 0, 0] },
  { position: [0, 0, 8.5], target: [0, 0, 0] },
  { position: [0, 0, 8.5], target: [0, 0, 0] },
];

const position = new Vector3();
const target = new Vector3();
const look = new Vector3();

function Rig() {
  useFrame((state, dt) => {
    rig.chapter = reducedMotion ? scroll.chapter : damp(rig.chapter, scroll.chapter, 6, dt);
    rig.shift = clamp01((state.size.width / state.size.height - 0.9) / 0.7);

    const c = Math.min(SHOTS.length - 1, Math.max(0, rig.chapter));
    const i = Math.min(SHOTS.length - 2, Math.floor(c));
    const f = smooth(c - i);
    const pullBack = 1 + (1 - rig.shift) * 0.45;
    for (let axis = 0; axis < 3; axis++) {
      const a = SHOTS[i];
      const b = SHOTS[i + 1];
      const stageA = axis === 1 ? -i * SPACING : 0;
      const stageB = axis === 1 ? -(i + 1) * SPACING : 0;
      position.setComponent(
        axis,
        lerp(a.position[axis] * pullBack + stageA, b.position[axis] * pullBack + stageB, f),
      );
      target.setComponent(
        axis,
        lerp(
          a.target[axis] + (a.offset?.[axis] ?? 0) * rig.shift + stageA,
          b.target[axis] + (b.offset?.[axis] ?? 0) * rig.shift + stageB,
          f,
        ),
      );
    }
    position.x += scroll.pointerX * 0.45;
    position.y += scroll.pointerY * 0.3;
    // The descent itself must not lag behind the scroll, only the parallax does.
    state.camera.position.set(
      damp(state.camera.position.x, position.x, 4, dt),
      position.y,
      damp(state.camera.position.z, position.z, 4, dt),
    );
    look.copy(target);
    state.camera.lookAt(look);
  }, -1);
  return null;
}

function Effects() {
  const aberration = useMemo(() => new Vector2(0.0009, 0.0006), []);
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.5} luminanceSmoothing={0.3} radius={0.75} />
      <ChromaticAberration offset={aberration} radialModulation modulationOffset={0.35} />
      <Noise premultiply opacity={0.35} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette offset={0.25} darkness={0.75} />
    </EffectComposer>
  );
}

export default function Scene({ onReady }: { onReady: () => void }) {
  const [low, setLow] = useState(false);
  const small = window.innerWidth < 760;

  return (
    <Canvas
      className="scene"
      dpr={[1, low ? 1 : small ? 1.5 : 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ fov: 42, near: 0.1, far: 90, position: [0, 0, 8.5] }}
      onCreated={onReady}
    >
      <color attach="background" args={[COLORS.bg]} />
      <fog attach="fog" args={[COLORS.bg, 12, 38]} />
      <PerformanceMonitor onDecline={() => setLow(true)} flipflops={2} />
      <Rig />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color="#cfeaff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color={COLORS.cyan} position={[-5, 2, 3]} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={3} color={COLORS.violet} position={[5, -1, 3]} scale={[4, 8, 1]} />
        <Lightformer form="ring" intensity={4} color="#ffffff" position={[0, 5, -4]} scale={4} />
        <Lightformer form="rect" intensity={1.5} color={COLORS.amber} position={[0, -5, 2]} scale={[8, 2, 1]} />
      </Environment>

      <Particles count={small ? 1400 : 3200} />
      <Core low={low} />
      <TruckWorld />
      <TagSphere />
      <Helix />

      {!low && <Effects />}
    </Canvas>
  );
}

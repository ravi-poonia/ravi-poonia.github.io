import { Edges, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { AdditiveBlending, Color, DoubleSide, type Group, PlaneGeometry, type ShaderMaterial, type Texture } from 'three';
import { scroll } from '../scroll';
import { COLORS, SPACING, damp, glowTexture, liveryTexture, presence } from './state';

const CHAPTER = 2;
const SPEED = 7;

const groundVertex = /* glsl */ `
  uniform float uTravel;
  varying vec3 vGround;
  varying float vHeight;
  void main() {
    vec3 p = position;
    float gz = p.z + uTravel;
    float hills = sin(p.x * 0.45 + gz * 0.18) + sin(gz * 0.37 - p.x * 0.21 + 1.7) * 0.8 + sin(p.x * 1.1 + gz * 0.9) * 0.25;
    float mask = smoothstep(3.2, 10.0, abs(p.x));
    p.y = (hills * 0.5 + 0.7) * mask * 2.4;
    vHeight = p.y;
    vGround = vec3(p.x, p.z, gz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const groundFragment = /* glsl */ `
  uniform vec3 uGrid;
  uniform vec3 uPeak;
  uniform vec3 uRoad;
  uniform float uPresence;
  varying vec3 vGround;
  varying float vHeight;
  float line(float c, float width) {
    float d = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    return 1.0 - min(d / width, 1.0);
  }
  void main() {
    float x = vGround.x;
    float gz = vGround.z;
    float grid = max(line(x * 0.5, 1.2), line(gz * 0.5, 1.2));
    vec3 color = mix(uGrid, uPeak, smoothstep(0.4, 3.2, vHeight)) * grid * 0.9;
    float road = 1.0 - smoothstep(2.3, 2.5, abs(x));
    color *= 1.0 - road * 0.85;
    float edge = 1.0 - min(abs(abs(x) - 2.4) / fwidth(x) / 1.5, 1.0);
    float dash = (1.0 - min(abs(x) / fwidth(x) / 1.5, 1.0)) * step(0.5, fract(gz * 0.22));
    color += uRoad * (edge * 0.9 + dash);
    float dist = length(vGround.xy);
    float alpha = (1.0 - smoothstep(14.0, 30.0, dist)) * uPresence;
    gl_FragColor = vec4(color, alpha * max(grid, max(edge, max(dash, road * 0.6))));
  }
`;

function Ground() {
  const material = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(64, 64, 160, 160);
    plane.rotateX(-Math.PI / 2);
    return plane;
  }, []);
  const uniforms = useMemo(
    () => ({
      uTravel: { value: 0 },
      uPresence: { value: 0 },
      uGrid: { value: new Color(COLORS.cyan) },
      uPeak: { value: new Color(COLORS.violet) },
      uRoad: { value: new Color(COLORS.amber) },
    }),
    [],
  );
  useFrame((state) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTravel.value = state.clock.elapsedTime * SPEED;
    u.uPresence.value = presence(CHAPTER, 0.9);
  });
  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={groundVertex}
        fragmentShader={groundFragment}
        transparent
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}

function Hull({ size, position, children }: { size: [number, number, number]; position: [number, number, number]; children?: ReactNode }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={COLORS.hull} metalness={0.7} roughness={0.32} />
      <Edges color={COLORS.cyan} threshold={15} />
      {children}
    </mesh>
  );
}

const WHEELS: [number, number][] = [
  [0.82, 1.95],
  [-0.82, 1.95],
  [0.82, -1.15],
  [-0.82, -1.15],
  [0.82, -2.1],
  [-0.82, -2.1],
];

function Truck() {
  const body = useRef<Group>(null);
  const wheels = useRef<(Group | null)[]>([]);
  const [livery, setLivery] = useState<Texture | null>(null);
  const glow = useMemo(glowTexture, []);

  useEffect(() => {
    let texture: Texture | null = null;
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive) return;
      texture = liveryTexture('Transport Book');
      setLivery(texture);
    });
    return () => {
      alive = false;
      texture?.dispose();
    };
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = body.current;
    if (!g) return;
    // The pointer steers: the truck drifts across its lane and leans into it.
    const lane = scroll.pointerX * 1.1;
    const before = g.position.x;
    g.position.x = damp(g.position.x, lane, 1.6, dt);
    const drift = (g.position.x - before) / Math.max(dt, 0.001);
    g.rotation.y = damp(g.rotation.y, drift * 0.12, 4, dt);
    g.rotation.z = damp(g.rotation.z, -drift * 0.03, 4, dt);
    g.position.y = Math.sin(t * 9) * 0.012 + Math.sin(t * 2.3) * 0.02;
    wheels.current.forEach((wheel) => {
      if (wheel) wheel.rotation.x += (dt * SPEED) / 0.4;
    });
  });

  return (
    <group ref={body}>
      <Hull size={[1.5, 0.2, 5.4]} position={[0, 0.62, 0]} />
      <Hull size={[1.8, 1.55, 1.45]} position={[0, 1.5, 1.95]}>
        <mesh position={[0, 0.3, 0.73]}>
          <planeGeometry args={[1.5, 0.6]} />
          <meshBasicMaterial color="#123a52" toneMapped={false} />
        </mesh>
      </Hull>
      <Hull size={[1.9, 1.9, 3.7]} position={[0, 1.68, -0.85]} />
      {livery &&
        [1, -1].map((side) => (
          <mesh key={side} position={[0.956 * side, 1.68, -0.85]} rotation={[0, (Math.PI / 2) * side, 0]}>
            <planeGeometry args={[3.6, 1.8]} />
            <meshBasicMaterial map={livery} toneMapped={false} />
          </mesh>
        ))}

      {[0.62, -0.62].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.98, 2.69]}>
            <boxGeometry args={[0.32, 0.16, 0.04]} />
            <meshBasicMaterial color="#fff1d6" toneMapped={false} />
          </mesh>
          <mesh position={[x, 1.2, -2.71]}>
            <boxGeometry args={[0.26, 0.1, 0.04]} />
            <meshBasicMaterial color="#ff3b4e" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.03, 6.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 9]} />
        <meshBasicMaterial map={glow} color={COLORS.amber} transparent opacity={0.5} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>

      {WHEELS.map(([x, z], i) => (
        <group key={i} position={[x, 0.4, z]} ref={(el) => void (wheels.current[i] = el)}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 14]} />
            <meshStandardMaterial color="#05080f" metalness={0.4} roughness={0.6} />
            <Edges color={COLORS.violet} threshold={40} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Screen({ size, color, position = [0, 0, 0.035] }: { size: [number, number]; color: string; position?: [number, number, number] }) {
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function Slab({ size, children }: { size: [number, number, number]; children?: ReactNode }) {
  return (
    <mesh>
      <boxGeometry args={size} />
      <meshStandardMaterial color={COLORS.hull} metalness={0.7} roughness={0.3} />
      <Edges color={COLORS.cyan} threshold={15} />
      {children}
    </mesh>
  );
}

/** The five apps of the product, hovering over the road as the devices they run on. */
function Devices() {
  return (
    <group position={[0, 3.9, -0.6]} scale={0.8}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8} position={[-3.6, 0.2, 0.6]}>
        <Slab size={[1.7, 1.05, 0.06]}>
          <Screen size={[1.56, 0.9]} color="#0f3550" />
          <Screen size={[0.5, 0.78]} color={COLORS.cyan} position={[-0.47, 0, 0.04]} />
        </Slab>
        <mesh position={[0, -0.68, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.05]} />
          <meshStandardMaterial color={COLORS.hull} metalness={0.7} roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={2.6} rotationIntensity={0.7} floatIntensity={1} position={[-1.7, 0.9, -0.4]}>
        <Slab size={[0.56, 1.1, 0.06]}>
          <Screen size={[0.48, 1]} color="#123a52" />
          <Screen size={[0.4, 0.22]} color={COLORS.cyan} position={[0, 0.32, 0.04]} />
        </Slab>
      </Float>
      <Float speed={2.2} rotationIntensity={0.7} floatIntensity={1} position={[0, 1.35, -0.8]}>
        <Slab size={[0.56, 1.1, 0.06]}>
          <Screen size={[0.48, 1]} color="#3a2a10" />
          <Screen size={[0.4, 0.22]} color={COLORS.amber} position={[0, -0.3, 0.04]} />
        </Slab>
      </Float>
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.9} position={[1.8, 0.9, -0.4]}>
        <Slab size={[1.6, 1, 0.04]}>
          <Screen size={[1.5, 0.9]} color="#160f35" />
          <Screen size={[1.5, 0.12]} color={COLORS.violet} position={[0, 0.39, 0.03]} />
        </Slab>
      </Float>
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.7} position={[3.6, 0.2, 0.6]}>
        <Slab size={[0.9, 1.3, 0.9]}>
          {[0.4, 0.13, -0.14, -0.41].map((y) => (
            <Screen key={y} size={[0.7, 0.05]} color={y > 0.2 ? COLORS.amber : COLORS.cyan} position={[0, y, 0.46]} />
          ))}
        </Slab>
      </Float>
    </group>
  );
}

export function TruckWorld() {
  const root = useRef<Group>(null);
  useFrame(() => {
    const g = root.current;
    if (!g) return;
    const p = presence(CHAPTER, 0.95);
    g.visible = p > 0.01;
  });
  return (
    <group ref={root} position={[0, -CHAPTER * SPACING - 1.6, 0]}>
      <Ground />
      <Truck />
      <Devices />
    </group>
  );
}

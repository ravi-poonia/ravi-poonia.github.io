import { CanvasTexture, SRGBColorSpace } from 'three';

/** World distance between two chapters' stages. The camera descends through them. */
export const SPACING = 30;

export const COLORS = {
  bg: '#05070d',
  cyan: '#5ef2ff',
  violet: '#8b5cff',
  amber: '#ffb454',
  hull: '#0a1120',
};

// Written by the camera rig each frame, read by every actor after it.
export const rig = {
  /** Smoothed chapter the camera is at. */
  chapter: 0,
  /** 0 on a portrait screen, 1 on a wide one: how far actors may sit off-centre. */
  shift: 1,
};

export const smooth = (t: number) => t * t * (3 - 2 * t);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** 1 at `center`, falling smoothly to 0 at `width` chapters away. */
export const presence = (center: number, width = 0.8) =>
  1 - smooth(clamp01(Math.abs(rig.chapter - center) / width));

/** Interpolates a per-chapter keyframe list at the rig's chapter. */
export function keyed(values: number[]) {
  const c = Math.min(values.length - 1, Math.max(0, rig.chapter));
  const i = Math.min(values.length - 2, Math.floor(c));
  return lerp(values[i], values[i + 1], smooth(c - i));
}

const FONT = '"JetBrains Mono Variable", ui-monospace, monospace';

export function labelTexture(text: string, color = COLORS.cyan) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.font = `500 44px ${FONT}`;
  const width = Math.min(480, ctx.measureText(text).width + 56);
  const x = (512 - width) / 2;
  ctx.fillStyle = 'rgba(6, 12, 24, 0.72)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, 22, width, 84, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#eaf6ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 66, 440);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function liveryTexture(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0a1120';
  ctx.fillRect(0, 0, 1024, 512);
  ctx.strokeStyle = 'rgba(94, 242, 255, 0.35)';
  ctx.lineWidth = 3;
  for (let i = -512; i < 1024; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 512);
    ctx.lineTo(i + 512, 0);
    ctx.stroke();
  }
  ctx.fillStyle = '#0a1120';
  ctx.fillRect(60, 150, 904, 212);
  ctx.fillStyle = '#5ef2ff';
  ctx.font = '700 104px "Space Grotesk Variable", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), 512, 262, 860);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new CanvasTexture(canvas);
}

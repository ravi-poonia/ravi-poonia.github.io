import { useEffect, useRef } from 'react';
import { reducedMotion } from '../scroll';

/** A ring that trails the pointer and swells over anything clickable. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el || reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let frame = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.dataset.on = 'true';
      el.dataset.active = String(!!(e.target as Element).closest?.('a, button'));
    };
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ring} className="cursor" aria-hidden />;
}

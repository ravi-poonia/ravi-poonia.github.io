import Lenis from 'lenis';

// One mutable object shared between the DOM and the WebGL scene. The scene reads
// it every frame, so nothing here goes through React state.
export const scroll = {
  /** Continuous chapter index: 0 at the first section's top, 1 at the second's... */
  chapter: 0,
  /** 0..1 across the whole page. */
  progress: 0,
  /** Scroll speed in px/frame, smoothed by Lenis. */
  velocity: 0,
  /** Pointer, -1..1 on both axes, y up. */
  pointerX: 0,
  pointerY: 0,
};

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let tops: number[] = [];

function measure() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  tops = [...document.querySelectorAll<HTMLElement>('[data-chapter]')].map((el) =>
    Math.min(el.offsetTop, max),
  );
}

function update(y: number, velocity: number) {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scroll.progress = Math.min(1, Math.max(0, y / max));
  scroll.velocity = velocity;
  const last = tops.length - 1;
  if (last < 1) return;
  let i = 0;
  while (i < last - 1 && y >= tops[i + 1]) i++;
  // A section taller than the screen holds its stage while it is read; the move
  // to the next stage happens over the last screenful before that section.
  const span = Math.max(1, Math.min(window.innerHeight, tops[i + 1] - tops[i]));
  scroll.chapter = Math.min(last, Math.max(0, i + Math.max(0, y - (tops[i + 1] - span)) / span));
}

export function initScroll() {
  measure();
  update(window.scrollY, 0);

  const onPointer = (e: PointerEvent) => {
    scroll.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    scroll.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  const onResize = () => {
    measure();
    update(window.scrollY, 0);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('resize', onResize);
  const observer = new ResizeObserver(onResize);
  observer.observe(document.body);

  let frame = 0;
  let onNativeScroll: (() => void) | null = null;
  if (reducedMotion) {
    onNativeScroll = () => update(window.scrollY, 0);
    window.addEventListener('scroll', onNativeScroll, { passive: true });
  } else {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    lenis.on('scroll', (l: Lenis) => update(l.scroll, l.velocity));
    const loop = (time: number) => {
      lenis?.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
  }

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('resize', onResize);
    if (onNativeScroll) window.removeEventListener('scroll', onNativeScroll);
    observer.disconnect();
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView();
}

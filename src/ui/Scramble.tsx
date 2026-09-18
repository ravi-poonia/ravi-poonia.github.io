import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../scroll';

const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

/** Decodes its text out of noise the first time it scrolls into view. */
export function Scramble({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(reducedMotion ? text : '');

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    let frame = 0;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => {
          const start = performance.now();
          const duration = 500 + text.length * 45;
          const tick = (now: number) => {
            const settled = Math.floor(((now - start) / duration) * text.length);
            let out = '';
            for (let i = 0; i < text.length; i++) {
              if (i < settled || text[i] === ' ') out += text[i];
              else if (i < settled + 6) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
            setShown(out);
            if (settled < text.length) frame = requestAnimationFrame(tick);
            else setShown(text);
          };
          frame = requestAnimationFrame(tick);
        }, delay);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [text, delay]);

  return (
    <span ref={ref} className="scramble" aria-label={text}>
      {/* The final text holds the layout; the decoding copy is laid over it. */}
      <span className="scramble-ghost" aria-hidden>
        {text}
      </span>
      <span className="scramble-live" aria-hidden>
        {shown}
      </span>
    </span>
  );
}

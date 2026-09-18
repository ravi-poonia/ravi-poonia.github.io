import { type MouseEvent, useEffect, useRef, useState } from 'react';
import { chapters, profile } from '../content';
import { scroll, scrollToId } from '../scroll';

const go = (id: string) => (e: MouseEvent) => {
  e.preventDefault();
  scrollToId(id);
  history.replaceState(null, '', `#${id}`);
};

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      timeZone: profile.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

/** The fixed instrument frame: mark, chapter rail, progress readout and local time. */
export function Hud() {
  const time = useClock();
  const [active, setActive] = useState(0);
  const readout = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    let last = -1;
    const loop = () => {
      const index = Math.round(scroll.chapter);
      if (index !== last) setActive((last = index));
      if (readout.current) readout.current.textContent = String(Math.round(scroll.progress * 100)).padStart(3, '0');
      if (fill.current) fill.current.style.transform = `scaleY(${scroll.progress})`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <header className="hud hud-top">
        <a href="#home" onClick={go('home')} className="mark" aria-label="Back to top">
          RP<span>_</span>
        </a>
        <nav aria-label="Sections">
          {chapters.slice(1).map((chapter, i) => (
            <a key={chapter.id} href={`#${chapter.id}`} onClick={go(chapter.id)} data-active={active === i + 1}>
              <small>0{i + 1}</small>
              {chapter.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="rail" aria-hidden>
        <i ref={fill} />
        {chapters.map((chapter, i) => (
          <b key={chapter.id} data-active={active === i} />
        ))}
      </div>

      <footer className="hud hud-bottom" aria-hidden>
        <span>
          SCROLL <span ref={readout}>000</span>% · {chapters[active]?.label.toUpperCase()}
        </span>
        <span className="status">
          <i /> {profile.status.toUpperCase()}
        </span>
        <span>
          {profile.location.toUpperCase()} · {time} IST
        </span>
      </footer>
    </>
  );
}

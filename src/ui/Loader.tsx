import { useEffect, useState } from 'react';

const LINES = ['boot sequence', 'compiling shaders', 'warming the engine', 'ready'];

export function Loader({ done }: { done: boolean }) {
  const [step, setStep] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, LINES.length - 2)), 320);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!done) return;
    setStep(LINES.length - 1);
    const timer = window.setTimeout(() => setGone(true), 900);
    return () => clearTimeout(timer);
  }, [done]);

  if (gone) return null;
  const percent = Math.round(((step + 1) / LINES.length) * 100);
  return (
    <div className="loader" data-done={done} role="status" aria-label="Loading">
      <div className="loader-box">
        <div className="loader-mark">RP_</div>
        <ul>
          {LINES.slice(0, step + 1).map((line) => (
            <li key={line}>
              <span>&gt;</span> {line}
            </li>
          ))}
        </ul>
        <div className="loader-bar">
          <i style={{ width: `${percent}%` }} />
        </div>
        <div className="loader-percent">{String(percent).padStart(3, '0')}%</div>
      </div>
    </div>
  );
}

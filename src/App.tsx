import { Component, type MouseEvent, type ReactNode, Suspense, lazy, useEffect, useState } from 'react';
import { about, certificates, domains, education, experience, profile, stackGroups, work } from './content';
import { initScroll, scrollToId } from './scroll';
import { Cursor } from './ui/Cursor';
import { Hud } from './ui/Hud';
import { Loader } from './ui/Loader';
import { Scramble } from './ui/Scramble';

const Scene = lazy(() => import('./scene/Scene'));

function hasWebGL() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

/** The page is complete without the canvas, so a WebGL failure only drops the backdrop. */
class SceneBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-revealed', 'true');
          observer.unobserve(entry.target);
        }),
      { threshold: 0.15 },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const go = (id: string) => (e: MouseEvent) => {
  e.preventDefault();
  scrollToId(id);
};

function Eyebrow({ index, children }: { index: string; children: string }) {
  return (
    <p className="eyebrow" data-reveal>
      <span>{index}</span> {children}
    </p>
  );
}

export function App() {
  const [webgl] = useState(hasWebGL);
  const [ready, setReady] = useState(!webgl);

  useEffect(() => initScroll(), []);
  useEffect(() => {
    // Never hold the page behind the loader if the scene is slow to arrive.
    const timer = window.setTimeout(() => setReady(true), 6000);
    return () => clearTimeout(timer);
  }, []);
  useReveal();

  return (
    <>
      <div className="backdrop" aria-hidden />
      {webgl && (
        <SceneBoundary onFail={() => setReady(true)}>
          <Suspense fallback={null}>
            <Scene onReady={() => setReady(true)} />
          </Suspense>
        </SceneBoundary>
      )}
      <Loader done={ready} />
      <Cursor />
      <Hud />

      <main>
        <section id="home" data-chapter className="chapter hero">
          <div className="column left">
            <Eyebrow index="00">hello, world</Eyebrow>
            <h1>
              <Scramble text={profile.firstName} delay={500} />
              <span className="outline">
                <Scramble text={profile.lastName} delay={800} />
              </span>
            </h1>
            <p className="role" data-reveal>
              {profile.role}
            </p>
            <p className="lead" data-reveal>
              {profile.lead}
            </p>
            <div className="actions" data-reveal>
              <a className="button primary" href="#work" onClick={go('work')}>
                See the work
              </a>
              <a className="button" href={`mailto:${profile.email}`}>
                Get in touch
              </a>
            </div>
          </div>
          <a className="cue" href="#about" onClick={go('about')}>
            <span>scroll</span>
            <i />
          </a>
        </section>

        <section id="about" data-chapter className="chapter">
          <div className="column right">
            <Eyebrow index="01">about</Eyebrow>
            <h2>
              <Scramble text="One developer, the whole stack." />
            </h2>
            <div className="bio" data-reveal>
              <figure className="portrait">
                <img src="/profile.jpg" alt="Ravi Poonia" width="148" height="148" loading="lazy" />
                <figcaption>RP · IN</figcaption>
              </figure>
              <div>
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            <dl className="stats" data-reveal>
              {about.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.value}</dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>
            <ul className="strengths">
              {about.strengths.map((strength) => (
                <li key={strength.title} data-reveal>
                  <strong>{strength.title}</strong>
                  <span>{strength.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="work" data-chapter className="chapter">
          <div className="column left">
            <Eyebrow index="02">selected work</Eyebrow>
            <h2>
              <Scramble text={work.name} />
            </h2>
            <p className="lead" data-reveal>
              {work.summary}
            </p>
            <ul className="apps" data-reveal>
              {work.apps.map((app, i) => (
                <li key={app.key}>
                  <small>0{i + 1}</small>
                  <strong>{app.name}</strong>
                  <span>{app.detail}</span>
                </li>
              ))}
            </ul>
            <div className="actions" data-reveal>
              <a className="button primary" href={work.url} target="_blank" rel="noreferrer">
                transportbook.app ↗
              </a>
              <a className="button" href={work.storeUrl} target="_blank" rel="noreferrer">
                Microsoft Store ↗
              </a>
            </div>
            <p className="hint" data-reveal>
              Move your pointer — you are steering the truck.
            </p>
            <h3 className="sub" data-reveal>
              Client work, by domain
            </h3>
            <ul className="domains">
              {domains.map((domain) => (
                <li key={domain.title} data-reveal>
                  <strong>{domain.title}</strong>
                  <small>{domain.tags}</small>
                  <span>{domain.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="stack" data-chapter className="chapter">
          <div className="column right">
            <Eyebrow index="03">stack</Eyebrow>
            <h2>
              <Scramble text="Tools I reach for." />
            </h2>
            <div className="groups">
              {stackGroups.map((group) => (
                <article key={group.title} className="panel" data-reveal>
                  <h3>{group.title}</h3>
                  <p>{group.items}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" data-chapter className="chapter">
          <div className="column left wide">
            <Eyebrow index="04">experience</Eyebrow>
            <h2>
              <Scramble text="Where I’ve built." />
            </h2>
            <ol className="timeline">
              {experience.map((job) => (
                <li key={job.company} data-reveal>
                  <time>{job.period}</time>
                  <div>
                    <strong>
                      {job.role} · <em>{job.company}</em>
                    </strong>
                    <small>{job.place}</small>
                    <ul>
                      {job.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
            <h3 className="sub" data-reveal>
              Education & certificates
            </h3>
            <ol className="timeline compact">
              {education.map((item) => (
                <li key={item.title} data-reveal>
                  <time>{item.period}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </div>
                </li>
              ))}
            </ol>
            <p className="certificates" data-reveal>
              HackerRank:{' '}
              {certificates.map((certificate) => (
                <a key={certificate.name} href={certificate.url} target="_blank" rel="noreferrer">
                  {certificate.name} ↗
                </a>
              ))}
            </p>
          </div>
        </section>

        <section id="contact" data-chapter className="chapter contact">
          <div className="column center">
            <Eyebrow index="05">contact</Eyebrow>
            <h2 className="huge">
              <Scramble text="Let’s build" />
              <span className="outline">
                <Scramble text="something." delay={250} />
              </span>
            </h2>
            <a className="mail" href={`mailto:${profile.email}`} data-reveal>
              {profile.email}
            </a>
            <div className="actions" data-reveal>
              <a className="button" href={profile.github} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <a className="button" href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn ↗
              </a>
            </div>
          </div>
          <p className="colophon">
            © {new Date().getFullYear()} {profile.name} · React, three.js and a lot of shaders
          </p>
        </section>
      </main>
    </>
  );
}

# ravi-poonia.github.io

My profile site: a scroll-driven WebGL scene behind a plain HTML page.
React 19, three.js via react-three-fiber, Vite, TypeScript.

```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck + production build into dist/
```

Pushing to `master` deploys: `.github/workflows/deploy.yml` builds the site and publishes it to
GitHub Pages (Pages source: GitHub Actions). Run `pnpm build` first — it typechecks.

## Where things are

- `src/content.ts` — every word on the site. Edit this, not the components.
- `src/App.tsx` — the six chapters as ordinary HTML; the page is complete without WebGL.
- `src/scroll.ts` — Lenis smooth scroll and the shared `scroll` state the scene reads each frame.
- `src/scene/` — the canvas. `Scene.tsx` holds the camera rig (one shot per chapter) and the
  post-processing; each actor (`Core`, `TruckWorld`, `TagSphere`, `Helix`, `Particles`) places
  itself at its chapter's stage, `SPACING` units below the previous one.
- `src/ui/` — HUD frame, loader, cursor ring, text scramble.

The scene drops its post-processing and the glass material when the frame rate falls
(`PerformanceMonitor`), and `prefers-reduced-motion` turns off smooth scroll, the scramble and
the reveal transitions.

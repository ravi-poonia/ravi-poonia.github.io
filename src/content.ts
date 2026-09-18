// Everything the site says lives here. Edit this file; the sections and the 3D
// scene read from it.

export const profile = {
  name: 'Ravi Poonia',
  firstName: 'Ravi',
  lastName: 'Poonia',
  role: 'Full-stack product engineer',
  location: 'India',
  timezone: 'Asia/Kolkata',
  status: 'Open to opportunities',
  email: 'ravipoonia7@gmail.com',
  github: 'https://github.com/ravi-poonia',
  linkedin: 'https://www.linkedin.com/in/ravi-poonia',
  lead: '8+ years building complete products — the web app, the mobile app, the desktop app and the API behind them. Lately, LLM-powered workflows running in production.',
};

export const about = {
  paragraphs: [
    'I build complete products rather than single layers. The pattern I have repeated across roughly a dozen products is the same triplet: a customer-facing mobile app, an internal operations dashboard, and the API that serves both.',
    'That has given me a lot of reps on the parts people usually see once — an API that has to satisfy two very different clients, a design system that stays consistent across web and native, and one codebase promoted through build, QA, UAT, staging and production.',
  ],
  stats: [
    { value: '8+', label: 'years shipping production software' },
    { value: '15+', label: 'mobile apps shipped to the stores' },
    { value: '12', label: 'products owned across app, admin and API' },
  ],
  strengths: [
    {
      title: 'End-to-end ownership',
      detail: 'Mobile, admin and API built together, many times over. I know where the seams leak.',
    },
    {
      title: 'Integrations that stay up',
      detail: 'Legacy XML and REST partners, webhooks, reconciliation and sync jobs — idempotent, replayable and debuggable six months later.',
    },
    {
      title: 'AI that earns its place',
      detail: 'RAG pipelines and agentic workflows balanced for reliability, cost and latency, with observability on what the model actually said.',
    },
  ],
};

export const work = {
  name: 'Transport Book',
  url: 'https://transportbook.app',
  storeUrl: 'https://apps.microsoft.com/detail/9NCXNXW5SXSR',
  summary:
    'My own product: offline-first fleet and transport management. Trips, job cards, fuel, settlements, receivables and reporting from one workspace — designed, built and shipped end to end.',
  apps: [
    { key: 'desktop', name: 'Desktop', detail: 'Electron + React, offline-first on SQLite with background sync' },
    { key: 'mobile', name: 'Mobile', detail: 'Expo / React Native, shipped over the air' },
    { key: 'driver', name: 'Driver', detail: 'Trips, photos, expenses and live location from a driver’s phone' },
    { key: 'web', name: 'Web', detail: 'The desktop interface compiled for the browser, over a WebSocket' },
    { key: 'server', name: 'Server', detail: 'Node + Express, MongoDB and Turso, OpenTelemetry' },
  ],
};

// Client work is described by domain, never by client name.
export const domains = [
  {
    title: 'AI support assistant',
    tags: 'FastAPI · OpenAI · PGVector',
    detail: 'A context-aware RAG pipeline that resolves internal queries, cutting manual support load for a high-traffic streaming platform.',
  },
  {
    title: 'Travel & rental reservations',
    tags: 'NestJS · XML/REST · PostgreSQL',
    detail: 'Booking flows, pricing and discount engines, and OTA-compliant integrations with large third-party distribution systems.',
  },
  {
    title: 'Crypto trading app',
    tags: 'React Native · WebSockets · Expo OTA',
    detail: 'Live options trading over sockets, a re-architecture worth 20% in performance, and App Store / Play Store releases.',
  },
  {
    title: 'On-demand pickup marketplace',
    tags: 'React Native · Node.js',
    detail: 'Customer app, agent app and the backend they share — re-architected and brought up to current standards.',
  },
  {
    title: 'Construction ERP',
    tags: 'React Native · React',
    detail: 'Multi-role portals for internal staff and external brokers over one domain model, from architecture to store release.',
  },
  {
    title: 'Jobs platform for small businesses',
    tags: 'React Native · Node.js · CI/CD',
    detail: 'Requirements to store release: mobile app, Node backend and auto-deploy pipelines for both.',
  },
];

export const stack = [
  'TypeScript',
  'React',
  'Next.js',
  'React Native',
  'Expo',
  'Electron',
  'Angular',
  'Node.js',
  'NestJS',
  'Express',
  'GraphQL',
  'Python',
  'FastAPI',
  'OpenAI API',
  'RAG',
  'PGVector',
  'PostgreSQL',
  'MongoDB',
  'SQLite',
  'Prisma',
  'WebSockets',
  'Docker',
  'AWS',
  'GCP',
  'CI/CD',
  'Grafana',
];

export const stackGroups = [
  { title: 'Interface', items: 'React · Next.js · React Native · Expo · Electron · Angular · Redux Toolkit · Tailwind · MUI' },
  { title: 'Backend', items: 'Node.js · NestJS + Prisma · Express · GraphQL · REST · WebSockets · microservices' },
  { title: 'AI & data', items: 'OpenAI API · RAG · PGVector · semantic search · Python (FastAPI, Flask, Pandas)' },
  { title: 'Data stores', items: 'PostgreSQL · MongoDB · SQLite · Turso' },
  { title: 'Delivery', items: 'Docker · AWS · GCP · CI/CD · Fastlane · EAS / OTA · Grafana · OpenTelemetry' },
];

export const experience = [
  {
    period: '2023 — now',
    role: 'Full Stack Developer',
    company: 'Hotstar',
    place: 'Remote',
    points: [
      'Work across the CMS and CRM teams, streamlining content and customer-relationship workflows.',
      'Engineered a context-aware AI chatbot pipeline with FastAPI, OpenAI and PGVector; RAG workflows now resolve internal queries that used to need a person.',
      'Tuned embeddings and semantic search for low latency under high traffic, with Grafana and custom logging watching AI output in production.',
    ],
  },
  {
    period: '2021 — 2023',
    role: 'Full Stack Developer',
    company: 'Centric3',
    place: 'Remote',
    points: [
      'Led design and delivery of web, mobile, desktop and backend platforms on NestJS, React, Angular, React Native and Electron.',
      'Architected microservices, REST/GraphQL APIs and OTA-compliant XML/REST integrations with third-party platforms, built for fault tolerance.',
      'Built the internal portals for pricing, discounts and integrations, and the Grafana observability behind them.',
    ],
  },
  {
    period: '2019 — 2020',
    role: 'Full Stack Developer',
    company: 'Digital Trons',
    place: 'Ahmedabad',
    points: [
      'Led and mentored the mobile and web teams across React, Angular and React Native.',
      'Turned business requirements into technical plans, and bridged backend and frontend streams.',
      'Set up CI/CD for builds, tests and multi-environment deployments.',
    ],
  },
  {
    period: '2018',
    role: 'React Native Developer',
    company: 'Levaral',
    place: 'Rajkot',
    points: [
      'Re-architected a cross-platform app: 20% faster, three seconds off load time.',
      'Brought in Crashlytics monitoring and rebuilt the mobile build pipeline.',
    ],
  },
];

export const education = [
  { period: '2014 — 2018', title: 'B.E. Computer Engineering', detail: 'Government Engineering College, Rajkot' },
  { period: '2012 — 2014', title: 'Higher secondary, science', detail: 'Kendriya Vidyalaya' },
];

export const certificates = [
  { name: 'Node.js (Intermediate)', url: 'https://www.hackerrank.com/certificates/5d808ae4c7d2' },
  { name: 'Problem Solving (Intermediate)', url: 'https://www.hackerrank.com/certificates/00d1ebdf77a2' },
  { name: 'React', url: 'https://www.hackerrank.com/certificates/b5f9622fa352' },
];

export const chapters = [
  { id: 'home', label: 'Hello' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'stack', label: 'Stack' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

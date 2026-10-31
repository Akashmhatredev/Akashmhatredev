// Everything the artwork says lives here. Edit, then run `npm run build`.

export const user = 'Akashmhatredev';

export const links = [
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', href: 'https://www.linkedin.com/in/akash-sudhir-mhatre/' },
  { id: 'email', label: 'Email me', color: '#D14836', href: 'mailto:mhatreakash2308@gmail.com' },
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', href: 'https://wa.me/919028681730' },
  { id: 'portfolio', label: 'Portfolio', color: '#F5B700', href: 'https://portfolio-v2-indol-kappa.vercel.app' },
];

// Icons come from devicon. `mono` icons are single-colour (mostly black), so
// they get repainted in the theme's ink to stay visible in dark mode.
export const stack = [
  {
    group: 'Languages',
    items: [
      ['JavaScript', 'javascript/javascript-original'],
      ['TypeScript', 'typescript/typescript-original'],
      ['Python', 'python/python-original'],
      ['Java', 'java/java-original'],
      ['Rust', 'rust/rust-original', 'mono'],
      ['HTML5', 'html5/html5-original'],
      ['CSS3', 'css3/css3-original'],
      ['Sass', 'sass/sass-original'],
    ],
  },
  {
    group: 'Frontend',
    items: [
      ['Vue.js', 'vuejs/vuejs-original'],
      ['Quasar', 'quasar/quasar-original'],
      ['React', 'react/react-original'],
      ['Next.js', 'nextjs/nextjs-plain', 'mono'],
      ['Tailwind', 'tailwindcss/tailwindcss-original'],
      ['Three.js', 'threejs/threejs-original', 'mono'],
      ['Vite', 'vitejs/vitejs-original'],
      ['Capacitor', 'capacitor/capacitor-original'],
    ],
  },
  {
    group: 'Backend',
    items: [
      ['Node.js', 'nodejs/nodejs-original'],
      ['Flask', 'flask/flask-original', 'mono'],
      ['Django', 'django/django-plain', 'mono'],
      ['SQLAlchemy', 'sqlalchemy/sqlalchemy-original', 'mono'],
      ['CF Workers', 'cloudflareworkers/cloudflareworkers-original'],
    ],
  },
  {
    group: 'Data',
    items: [
      ['PostgreSQL', 'postgresql/postgresql-original'],
      ['MySQL', 'mysql/mysql-original'],
      ['MongoDB', 'mongodb/mongodb-original'],
      ['Redis', 'redis/redis-original'],
      ['Supabase', 'supabase/supabase-original'],
      ['Firebase', 'firebase/firebase-original'],
      ['Spark', 'apachespark/apachespark-original'],
    ],
  },
  {
    group: 'Cloud & Ops',
    items: [
      ['AWS', 'amazonwebservices/amazonwebservices-plain-wordmark', 'mono'],
      ['Docker', 'docker/docker-original'],
      ['Nginx', 'nginx/nginx-original'],
      ['Linux', 'linux/linux-plain', 'mono'],
      ['Vercel', 'vercel/vercel-original', 'mono'],
      ['Actions', 'githubactions/githubactions-original'],
    ],
  },
  {
    group: 'Tools',
    items: [
      ['Git', 'git/git-original'],
      ['GitHub', 'github/github-original', 'mono'],
      ['GitLab', 'gitlab/gitlab-original'],
      ['VS Code', 'vscode/vscode-original'],
      ['Figma', 'figma/figma-original'],
      ['Android St.', 'androidstudio/androidstudio-original'],
      ['Vitest', 'vitest/vitest-original'],
      ['Playwright', 'playwright/playwright-original'],
    ],
  },
];

// `doodle` picks the little drawing in the card's corner (see build.mjs).
export const projects = [
  {
    slug: 'cartoon-clash',
    name: 'Cartoon Clash Arena',
    repo: 'Cartoon_Clash_Arena',
    date: 'Oct 2026',
    doodle: 'versus',
    pitch: 'A 1v1 arcade fighting game in the browser. Eight cartoon fighters, seven parallax stages and one deterministic 60 Hz combat engine shared by client and server.',
    facts: 'online rooms · Elo ranks · leaderboard',
    tags: ['Vue 3', 'Phaser 3', 'CF Durable Objects', 'Supabase'],
  },
  {
    slug: 'python-learning',
    name: 'Python Learning Platform',
    repo: 'PythonLearningPlatform',
    live: 'https://python-learning-platform-nine.vercel.app',
    date: 'Oct 2026',
    doodle: 'terminal',
    pitch: 'An interactive Python course where the code really runs: CPython 3.14 in the browser via Pyodide, with step-by-step visualizers and test-graded exercises.',
    facts: '134 lessons · 884 interview Qs · 259 exercises',
    tags: ['Vue 3', 'Pyodide', 'Vite', 'Playwright'],
  },
  {
    slug: 'vue-zero',
    name: 'Vue / Zero',
    repo: 'VueJSLearningPlatform',
    live: 'https://vue-js-learning-platform.vercel.app',
    date: 'Oct 2026',
    doodle: 'book',
    pitch: 'A Vue.js course built with Vue 3. Plain-English lessons, a live code sandbox, animated visualizers, quizzes and interview practice. No account, no backend.',
    facts: '134 lessons · 905 interview Qs · 15 visualizers',
    tags: ['Vue 3', 'Pinia', 'Vite', 'Vitest'],
  },
  {
    slug: 'sql-rush',
    name: 'SQL Rush',
    repo: 'SQL-RUSH',
    live: 'https://sql-rush.vercel.app',
    date: 'Oct 2026',
    doodle: 'database',
    pitch: 'A competitive SQL game. Answer against the clock, chain combos, earn XP, keep a daily streak and climb leaderboards that update live.',
    facts: '4 modes · 5 question types · admin panel',
    tags: ['Next.js 15', 'TypeScript', 'Supabase', 'Tailwind'],
  },
  {
    slug: 'pocket-artillery',
    name: 'Pocket Artillery',
    repo: 'pocket-artillery',
    live: 'https://pocket-artillery-sooty.vercel.app',
    date: 'Jul 2026',
    doodle: 'artillery',
    pitch: 'Turn-based multiplayer tank duels. Read the wind, dial in angle and power, and carve craters into fully destructible terrain. Every shot is checked on the server.',
    facts: 'vs robot · private rooms · realtime sync',
    tags: ['Next.js', 'React', 'SpacetimeDB', 'Rust'],
  },
  {
    slug: 'portfolio-v2',
    name: 'Portfolio V2',
    repo: 'Portfolio_V2',
    live: 'https://portfolio-v2-indol-kappa.vercel.app',
    date: 'Jul 2026',
    doodle: 'orbit',
    pitch: 'My interactive portfolio with five custom WebGL scenes, from a glowing workflow engine to a data lakehouse you can watch fill up.',
    facts: '5 Three.js scenes · reduced-motion friendly',
    tags: ['Vue 3', 'Three.js', 'GSAP', 'Lenis'],
  },
];

export const achievements = [
  { id: 'pull-shark', title: 'Pull Shark', note: 'merged pull requests', glyph: 'fin' },
  { id: 'yolo', title: 'YOLO', note: 'merged without a review', glyph: 'YOLO' },
  { id: 'hacktoberfest', title: 'Hacktoberfest', note: '2024 contributor', glyph: "'24" },
  { id: 'shipped', title: 'Shipped', note: '6 apps live on Vercel', glyph: '6' },
  { id: 'years', title: 'Building', note: '4+ years full-stack', glyph: '4+' },
];

// Markup and stylesheets show up in almost every repo, so the languages card skips them.
export const ignoredLanguages = ['HTML', 'CSS', 'SCSS'];

export const languageColors = {
  JavaScript: '#E9C400',
  TypeScript: '#3178C6',
  Vue: '#41B883',
  Python: '#3572A5',
  Java: '#B07219',
  Rust: '#DEA584',
  CSS: '#7A5BC4',
  SCSS: '#C6538C',
  HTML: '#E34C26',
  PLpgSQL: '#336790',
};

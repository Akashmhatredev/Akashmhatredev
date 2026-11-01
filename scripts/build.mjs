// Draws every SVG used by the profile README, once per theme.
//
//   node build.mjs static [part...]  -> ../assets/{light,dark}/*.svg   (commit these)
//   node build.mjs stats [dir]       -> [dir]/{light,dark}/*.svg       (default ../dist; CI publishes it)
//
// Parts: header, sections, toolbox, projects, achievements. Each part lives in
// art/<part>.mjs and is only loaded when it is being drawn.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES } from './lib/sketch.mjs';
import { fetchStats } from './lib/github.mjs';
import * as profile from './profile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

function save(dir, name, render, meta) {
  for (const theme of Object.values(THEMES)) {
    const file = path.join(dir, theme.name, `${name}.svg`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${render(theme).toString(meta)}\n`);
  }
  console.log(`  ✓ ${name}.svg`);
}

const PARTS = {
  async header(dir) {
    const { header } = await import('./art/header.mjs');
    save(dir, 'header', header, {
      title: "Hi there, I'm Akash Mhatre",
      desc: 'Full-stack engineer from Pune, India, drawn as a pencil sketch next to a website wireframe, with doodles of chess, puzzles, treks and games.',
    });
  },
  async sections(dir) {
    const { sectionTitle, tab, button, footer } = await import('./art/sections.mjs');
    profile.sections.forEach((sec, i) => {
      save(dir, `section-${sec.id}`, (t) => sectionTitle(t, i + 1, sec.title, sec.note), { title: sec.title });
      save(dir, `tab-${sec.id}`, (t) => tab(t, sec, i), { title: sec.tab });
    });
    profile.links.forEach((l, i) => save(dir, `button-${l.id}`, (t) => button(t, l, i), { title: l.label }));
    save(dir, 'footer', footer, { title: 'Thanks for dropping by!' });
  },
  async toolbox(dir) {
    const { fetchIcons, toolbox } = await import('./art/toolbox.mjs');
    const icons = await fetchIcons();
    save(dir, 'toolbox', (t) => toolbox(t, icons), {
      title: 'Toolbox',
      desc: profile.stack.map((g) => `${g.group}: ${g.items.map((i) => i[0]).join(', ')}`).join('. '),
    });
  },
  async projects(dir) {
    const { projectCard } = await import('./art/projects.mjs');
    profile.projects.forEach((p, i) => save(dir, `project-${p.slug}`, (t) => projectCard(t, p, i), { title: p.name, desc: p.pitch }));
  },
  async achievements(dir) {
    const { achievements } = await import('./art/achievements.mjs');
    save(dir, 'achievements', achievements, {
      title: 'Achievements',
      desc: profile.achievements.map((a) => `${a.title}: ${a.note}`).join('. '),
    });
  },
};

async function buildStatic(only) {
  const dir = path.join(here, '..', 'assets');
  console.log(`static -> ${dir}`);
  for (const name of only.length ? only : Object.keys(PARTS)) {
    if (!PARTS[name]) throw new Error(`unknown part "${name}" (have: ${Object.keys(PARTS).join(', ')})`);
    await PARTS[name](dir);
  }
}

async function buildStats(outDir) {
  const { summarize, statsCard, languagesCard, contributionsCard } = await import('./art/live.mjs');
  const dir = path.resolve(outDir ?? path.join(here, '..', 'dist'));
  console.log(`stats -> ${dir}`);
  const data = await fetchStats(profile.user);
  const sum = summarize(data);
  save(dir, 'stats', (t) => statsCard(t, data, sum), {
    title: 'GitHub stats',
    desc: `${sum.total} contributions all time, ${sum.current} day current streak, ${sum.longest} day longest streak, ${data.mergedPrs} merged pull requests.`,
  });
  save(dir, 'languages', (t) => languagesCard(t, data), { title: 'Languages I reach for' });
  save(dir, 'contributions', (t) => contributionsCard(t, data, sum), { title: 'Contribution calendar for the last year' });
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === 'static') await buildStatic(rest);
else if (mode === 'stats') await buildStats(rest[0]);
else {
  console.error('usage: node build.mjs static [part...] | stats [outDir]');
  process.exit(1);
}

// Draws every SVG used by the profile README, once per theme.
//
//   node build.mjs static        -> ../assets/{light,dark}/*.svg   (commit these)
//   node build.mjs stats [dir]   -> [dir]/{light,dark}/*.svg       (default ../dist; CI publishes it)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Sketch, THEMES } from './lib/sketch.mjs';
import { fetchStats } from './lib/github.mjs';
import * as profile from './profile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (d) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

function save(dir, name, render, meta) {
  for (const theme of Object.values(THEMES)) {
    const file = path.join(dir, theme.name, `${name}.svg`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${render(theme).toString(meta)}\n`);
  }
  console.log(`  ✓ ${name}.svg`);
}

// ---------------------------------------------------------------- header

function wireframe(s, x, y, w, h) {
  const t = s.t;
  s.frame(x, y, w, h, { overshoot: 16 });
  s.line(x, y + 24, x + w, y + 24, { strokeWidth: 1.2 });
  [14, 28, 42].forEach((dx) => s.circle(x + dx, y + 12, 8, { strokeWidth: 1.1 }));
  s.rect(x + 58, y + 6, w - 72, 12, { stroke: t.faint, strokeWidth: 1, roughness: 0.6 });

  // image placeholder, crossed out the way wireframes do it
  const [ix, iy, iw, ih] = [x + 14, y + 38, 104, 70];
  s.rect(ix, iy, iw, ih, { strokeWidth: 1.2 });
  s.line(ix, iy, ix + iw, iy + ih, { stroke: t.faint, strokeWidth: 1 });
  s.line(ix + iw, iy, ix, iy + ih, { stroke: t.faint, strokeWidth: 1 });

  [44, 57, 70].forEach((dy, i) =>
    s.squiggle(x + 132, y + dy, w - 150 - i * 22, { amp: 1.4, step: 7, o: { stroke: t.pencil, strokeWidth: 1.1 } }),
  );
  s.rect(x + 132, y + 84, 76, 24, { fill: t.marker, fillStyle: 'hachure', hachureGap: 3.5, fillWeight: 1.4, strokeWidth: 1.3 });
  s.raw(`<rect x="${x + 146}" y="${y + 89}" width="48" height="15" rx="4" fill="${t.paper}" opacity="0.9"/>`);
  s.text('ship it', x + 170, y + 101, { size: 13, anchor: 'middle' });

  const cw = (w - 28 - 16) / 3;
  for (let i = 0; i < 3; i++) {
    const cx = x + 14 + i * (cw + 8);
    s.rect(cx, y + 122, cw, h - 136, { strokeWidth: 1.1, stroke: t.pencil });
    s.line(cx + 8, y + 136, cx + cw - 14, y + 136, { stroke: t.faint, strokeWidth: 1 });
    s.line(cx + 8, y + 146, cx + cw - 26, y + 146, { stroke: t.faint, strokeWidth: 1 });
  }

  // dimension line across the top
  const dy = y - 30;
  s.line(x, dy, x + w, dy, { stroke: t.red, strokeWidth: 1, roughness: 0.4 });
  s.line(x, dy - 6, x, dy + 6, { stroke: t.red, strokeWidth: 1, roughness: 0.3 });
  s.line(x + w, dy - 6, x + w, dy + 6, { stroke: t.red, strokeWidth: 1, roughness: 0.3 });
  const label = '100% curiosity';
  const lw = s.measure(label, 'hand', 13);
  s.raw(`<rect x="${x + w / 2 - lw / 2 - 6}" y="${dy - 9}" width="${lw + 12}" height="18" fill="${t.paper}"/>`);
  s.text(label, x + w / 2, dy + 5, { size: 13, anchor: 'middle', fill: t.red });
}

function header(t) {
  const s = new Sketch({ width: 900, height: 300, theme: t, seed: 1 });
  s.paper();
  s.text('FIG. 01 — the developer, roughly to scale', 46, 44, { size: 13, fill: t.pencil });
  s.text("Hi there, I'm", 46, 98, { font: 'title', size: 44 });
  const nameW = s.measure('Akash Mhatre', 'title', 84);
  s.highlight(38, 128, nameW + 18, 44);
  s.text('Akash Mhatre', 46, 168, { font: 'title', size: 84 });
  s.text('Full-stack engineer · Pune, India', 48, 210, { size: 20 });
  s.text('I sketch ideas, then ship them: SaaS platforms,', 48, 244, { size: 15, fill: t.pencil });
  s.text('data pipelines, browser games & learning tools.', 48, 266, { size: 15, fill: t.pencil });

  wireframe(s, 590, 76, 270, 186);
  s.text('insert', 520, 186, { size: 14, fill: t.blue });
  s.text('idea here', 512, 204, { size: 14, fill: t.blue });
  s.arrow([[548, 168], [560, 140], [586, 118], [600, 112]], { stroke: t.blue });
  return s;
}

// ---------------------------------------------------------------- section titles

function sectionTitle(t, num, title, note) {
  const s = new Sketch({ width: 900, height: 76, theme: t, seed: 10 + num });
  s.ellipse(30, 40, 50, 42, { stroke: t.red, strokeWidth: 1.4 });
  s.text(String(num).padStart(2, '0'), 30, 49, { font: 'title', size: 26, anchor: 'middle', fill: t.red });
  const w = s.measure(title, 'title', 44);
  s.highlight(64, 36, w + 14, 24);
  s.text(title, 70, 56, { font: 'title', size: 44 });
  const noteW = s.measure(note, 'hand', 14);
  const from = 70 + w + 26;
  const to = 900 - noteW - 26;
  if (to - from > 40) {
    s.draw(s.gen.line(from, 47, to, 47, s.opts({ stroke: t.faint, strokeWidth: 1.2, roughness: 0.5 })), ' stroke-dasharray="6 7"');
  }
  s.text(note, 896, 52, { size: 14, fill: t.pencil, anchor: 'end' });
  return s;
}

// ---------------------------------------------------------------- toolbox

async function fetchIcons() {
  const icons = new Map();
  await Promise.all(
    profile.stack.flatMap((g) => g.items).map(async ([, icon]) => {
      const res = await fetch(`${DEVICON}${icon}.svg`);
      if (!res.ok) throw new Error(`devicon ${icon}: ${res.status}`);
      icons.set(icon, `data:image/svg+xml;base64,${Buffer.from(await res.text()).toString('base64')}`);
    }),
  );
  return icons;
}

function toolbox(t, icons) {
  const rowH = 94;
  const top = 30;
  const H = top + profile.stack.length * rowH + 24;
  const s = new Sketch({ width: 900, height: H, theme: t, seed: 30 });
  s.paper();
  s.frame(20, 18, 860, H - 36, { overshoot: 10, o: { stroke: t.pencil, strokeWidth: 1.2 } });

  profile.stack.forEach(({ group, items }, i) => {
    const y = top + i * rowH;
    const lw = s.measure(group, 'title', 30);
    s.text(group, 44, y + 52, { font: 'title', size: 30 });
    s.squiggle(44, y + 62, lw, { amp: 1.6, step: 8, o: { stroke: t.red, strokeWidth: 1.3 } });
    if (182 - (44 + lw + 10) > 14) s.arrow([[44 + lw + 10, y + 44], [182, y + 44]], { stroke: t.pencil, strokeWidth: 1.1, head: 7 });

    const colW = 84;
    items.forEach(([label, icon, mono], j) => {
      const cx = 196 + j * colW + colW / 2;
      s.image(icons.get(icon), cx - 21, y + 14, 42, 42, { mono: mono === 'mono' });
      s.text(label, cx, y + 76, { size: 12, anchor: 'middle', fill: t.pencil });
    });
    if (i < profile.stack.length - 1) {
      s.draw(s.gen.line(44, y + rowH + 2, 856, y + rowH + 2, s.opts({ stroke: t.faint, strokeWidth: 1, roughness: 0.4 })), ' stroke-dasharray="4 8"');
    }
  });
  return s;
}

// ---------------------------------------------------------------- project cards

const doodles = {
  versus(s, cx, cy) {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = i % 2 ? 26 : 42;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    s.polygon(pts, { fill: s.t.marker, fillStyle: 'hachure', hachureGap: 4, fillWeight: 1.3, strokeWidth: 1.4 });
    s.raw(`<ellipse cx="${cx}" cy="${cy - 1}" rx="22" ry="15" fill="${s.t.paper}"/>`);
    s.text('VS', cx, cy + 9, { font: 'title', size: 28, anchor: 'middle', fill: s.t.red });
  },
  terminal(s, cx, cy) {
    s.rect(cx - 42, cy - 32, 84, 64, { strokeWidth: 1.5 });
    s.line(cx - 42, cy - 18, cx + 42, cy - 18, { strokeWidth: 1.1 });
    [-34, -26, -18].forEach((dx) => s.circle(cx + dx, cy - 25, 5, { strokeWidth: 1 }));
    s.text('>>> py', cx - 34, cy + 4, { size: 14, fill: s.t.blue });
    s.text('hello!', cx - 34, cy + 22, { size: 13, fill: s.t.pencil });
  },
  book(s, cx, cy) {
    const page = { strokeWidth: 1.4, fill: s.t.paper, fillStyle: 'solid' };
    s.polygon([[cx - 44, cy - 24], [cx, cy - 16], [cx, cy + 30], [cx - 44, cy + 22]], page);
    s.polygon([[cx + 44, cy - 24], [cx, cy - 16], [cx, cy + 30], [cx + 44, cy + 22]], page);
    for (let i = 0; i < 4; i++) {
      s.line(cx - 36, cy - 10 + i * 9, cx - 8, cy - 5 + i * 9, { stroke: s.t.faint, strokeWidth: 1 });
      s.line(cx + 8, cy - 5 + i * 9, cx + 36, cy - 10 + i * 9, { stroke: s.t.faint, strokeWidth: 1 });
    }
    s.polygon([[cx - 22, cy - 46], [cx, cy - 22], [cx + 22, cy - 46], [cx + 12, cy - 46], [cx, cy - 32], [cx - 12, cy - 46]], {
      fill: s.t.green, fillStyle: 'hachure', hachureGap: 3, fillWeight: 1.1, strokeWidth: 1.2,
    });
  },
  database(s, cx, cy) {
    const x = cx - 10;
    s.line(x - 30, cy - 26, x - 30, cy + 24, { strokeWidth: 1.4 });
    s.line(x + 30, cy - 26, x + 30, cy + 24, { strokeWidth: 1.4 });
    s.ellipse(x, cy - 26, 60, 18, { strokeWidth: 1.4 });
    s.arc(x, cy, 60, 18, 0, Math.PI, { strokeWidth: 1.2 });
    s.arc(x, cy + 24, 60, 18, 0, Math.PI, { strokeWidth: 1.4 });
    s.polygon([[cx + 30, cy - 36], [cx + 18, cy - 4], [cx + 28, cy - 4], [cx + 20, cy + 26], [cx + 42, cy - 12], [cx + 31, cy - 12], [cx + 40, cy - 36]], {
      fill: s.t.marker, fillStyle: 'solid', stroke: s.t.ink, strokeWidth: 1.2,
    });
  },
  artillery(s, cx, cy) {
    s.squiggle(cx - 48, cy + 32, 96, { amp: 1.5, step: 12, o: { stroke: s.t.pencil, strokeWidth: 1.2 } });
    s.rect(cx - 46, cy + 14, 26, 14, { strokeWidth: 1.3, fill: s.t.blue, fillStyle: 'hachure', hachureGap: 3 });
    s.arc(cx - 33, cy + 14, 16, 14, Math.PI, Math.PI * 2, { strokeWidth: 1.3 });
    s.line(cx - 30, cy + 9, cx - 16, cy - 2, { strokeWidth: 2 });
    s.draw(s.gen.curve([[cx - 14, cy - 4], [cx + 2, cy - 30], [cx + 20, cy - 26], [cx + 34, cy + 14]], s.opts({ stroke: s.t.red, strokeWidth: 1.2, roughness: 0.6 })), ' stroke-dasharray="3 4"');
    const burst = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r = i % 2 ? 6 : 13;
      burst.push([cx + 36 + r * Math.cos(a), cy + 22 + r * Math.sin(a)]);
    }
    s.polygon(burst, { fill: s.t.red, fillStyle: 'solid', stroke: s.t.red, strokeWidth: 1 });
  },
  orbit(s, cx, cy) {
    s.circle(cx, cy, 46, { strokeWidth: 1.4, fill: s.t.blue, fillStyle: 'hachure', hachureGap: 4.5, fillWeight: 1 });
    s.group(`transform="rotate(-18 ${cx} ${cy})"`, () => {
      s.ellipse(cx, cy, 96, 28, { strokeWidth: 1.2 });
      s.circle(cx + 46, cy + 4, 10, { fill: s.t.marker, fillStyle: 'solid', strokeWidth: 1.1 });
    });
    [[-36, -30], [34, -34], [-40, 30]].forEach(([dx, dy]) => s.text('+', cx + dx, cy + dy, { size: 14, fill: s.t.pencil }));
  },
};

function wrapAround(s, text, size, widthFor) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && s.measure(next, 'hand', size) > widthFor(lines.length)) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function projectCard(t, p, i) {
  const s = new Sketch({ width: 460, height: 300, theme: t, seed: 100 + i * 7 });
  s.paper({ grid: 20 });
  s.frame(16, 16, 428, 268, { overshoot: 10 });
  s.text(`PROJ. ${String(i + 1).padStart(2, '0')}`, 32, 42, { size: 12, fill: t.pencil });
  s.text(`rev. ${p.date}`, 428, 42, { size: 12, fill: t.pencil, anchor: 'end' });

  let size = 36;
  while (s.measure(p.name, 'title', size) > 282) size -= 1;
  const tw = s.measure(p.name, 'title', size);
  s.highlight(28, 60, tw + 12, 20);
  s.text(p.name, 32, 78, { font: 'title', size });

  doodles[p.doodle](s, 382, 94);

  const lines = wrapAround(s, p.pitch, 14, (n) => (n < 3 ? 296 : 392)).slice(0, 5);
  lines.forEach((l, n) => s.text(l, 32, 108 + n * 20, { size: 14 }));
  s.text(p.facts, 32, 214, { size: 13, fill: t.blue });

  let x = 32;
  for (const tag of p.tags) {
    const w = s.measure(tag, 'hand', 12) + 16;
    s.rect(x, 226, w, 22, { stroke: t.pencil, strokeWidth: 1, roughness: 0.9 });
    s.text(tag, x + 8, 241.5, { size: 12 });
    x += w + 7;
  }

  const label = p.live ? 'live demo' : 'view source';
  const lw = s.measure(label, 'title', 22);
  s.text(label, 404, 270, { font: 'title', size: 22, anchor: 'end', fill: t.red });
  s.squiggle(404 - lw, 276, lw, { amp: 1.2, step: 7, o: { stroke: t.red, strokeWidth: 1.1 } });
  s.arrow([[409, 270], [418, 262], [428, 252]], { stroke: t.red, head: 7, strokeWidth: 1.3 });
  return s;
}

// ---------------------------------------------------------------- achievements

function medallion(s, cx, cy, a, k) {
  const t = s.t;
  const ribbon = k % 2 ? t.blue : t.red;
  const tail = { fill: ribbon, fillStyle: 'hachure', hachureGap: 3.2, fillWeight: 1.1, strokeWidth: 1.2 };
  s.polygon([[cx - 26, cy + 26], [cx - 38, cy + 80], [cx - 24, cy + 70], [cx - 12, cy + 84], [cx - 4, cy + 36]], tail);
  s.polygon([[cx + 26, cy + 26], [cx + 38, cy + 80], [cx + 24, cy + 70], [cx + 12, cy + 84], [cx + 4, cy + 36]], tail);
  s.circle(cx, cy, 98, { fill: t.paper, fillStyle: 'solid', strokeWidth: 1.6 });
  s.circle(cx, cy, 80, { stroke: t.pencil, strokeWidth: 1, roughness: 1.4 });
  if (a.glyph === 'fin') {
    s.path(`M ${cx - 20} ${cy + 10} Q ${cx - 2} ${cy - 2} ${cx + 6} ${cy - 26} Q ${cx + 10} ${cy - 4} ${cx + 20} ${cy + 10} Z`, {
      fill: t.blue, fillStyle: 'hachure', hachureGap: 3, strokeWidth: 1.4,
    });
    s.squiggle(cx - 26, cy + 14, 52, { amp: 2, step: 8, o: { stroke: t.blue, strokeWidth: 1.3 } });
  } else {
    let size = 40;
    while (s.measure(a.glyph, 'title', size) > 58) size -= 1;
    s.text(a.glyph, cx, cy + size * 0.32, { font: 'title', size, anchor: 'middle' });
  }
  s.text(a.title, cx, cy + 116, { font: 'title', size: 26, anchor: 'middle' });
  s.text(a.note, cx, cy + 136, { size: 12.5, anchor: 'middle', fill: t.pencil });
}

function achievements(t) {
  const s = new Sketch({ width: 900, height: 264, theme: t, seed: 60 });
  s.paper();
  s.frame(20, 18, 860, 228, { overshoot: 10, o: { stroke: t.pencil, strokeWidth: 1.2 } });
  profile.achievements.forEach((a, k) => medallion(s, 98 + k * 176, 88, a, k));
  return s;
}

// ---------------------------------------------------------------- buttons & footer

function button(t, l, i) {
  const s = new Sketch({ width: 200, height: 64, theme: t, seed: 80 + i });
  s.rect(6, 6, 188, 52, { fill: t.paper, fillStyle: 'solid', strokeWidth: 1.6 });
  s.rect(12, 12, 176, 40, { stroke: 'none', fill: l.color, fillStyle: 'hachure', hachureGap: 5, fillWeight: 1.4, roughness: 1.4 });
  const w = s.measure(l.label, 'title', 28);
  const x = (200 - w - 22) / 2;
  s.raw(`<rect x="${x - 8}" y="17" width="${w + 38}" height="30" rx="6" fill="${t.paper}" opacity="0.9"/>`);
  s.text(l.label, x, 41, { font: 'title', size: 28 });
  s.arrow([[x + w + 8, 40], [x + w + 21, 26]], { strokeWidth: 1.3, head: 6 });
  return s;
}

function footer(t) {
  const s = new Sketch({ width: 900, height: 150, theme: t, seed: 90 });
  s.text('Thanks for dropping by!', 450, 62, { font: 'title', size: 44, anchor: 'middle' });
  s.text('— Akash', 640, 104, { font: 'script', size: 32, fill: t.pencil });
  s.squiggle(640, 112, 82, { amp: 2, step: 10, o: { stroke: t.red, strokeWidth: 1.3 } });
  // paper plane on a dotted flight path
  s.draw(s.gen.curve([[40, 118], [96, 96], [140, 116], [186, 84], [222, 70]], s.opts({ stroke: t.pencil, strokeWidth: 1.2, roughness: 0.6 })), ' stroke-dasharray="4 6"');
  const [px, py] = [222, 64];
  s.polygon([[px - 18, py + 4], [px + 26, py - 14], [px - 2, py + 14]], { fill: t.paper, fillStyle: 'solid', strokeWidth: 1.4 });
  s.polygon([[px - 2, py + 14], [px + 26, py - 14], [px + 2, py + 24]], { fill: t.blue, fillStyle: 'hachure', hachureGap: 3, strokeWidth: 1.4 });
  s.text('drawn in code with rough.js, refreshed by GitHub Actions', 450, 140, { size: 12.5, anchor: 'middle', fill: t.pencil });
  return s;
}

// ---------------------------------------------------------------- live cards

const isoDay = (d) => d.toISOString().slice(0, 10);

function summarize(data) {
  const today = new Date();
  const dates = [...data.days.keys()].filter((d) => d <= isoDay(today)).sort();
  let longest = 0;
  let run = 0;
  for (const d of dates) {
    run = data.days.get(d) > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const n = data.days.get(dates[i]);
    if (n > 0) current++;
    else if (i === dates.length - 1) continue; // today may still be empty
    else break;
  }
  const year = String(today.getUTCFullYear());
  const total = dates.reduce((sum, d) => sum + data.days.get(d), 0);
  const thisYear = dates.filter((d) => d.startsWith(year)).reduce((sum, d) => sum + data.days.get(d), 0);
  return { today, total, thisYear, year, current, longest };
}

function statsCard(t, data, sum) {
  const s = new Sketch({ width: 460, height: 300, theme: t, seed: 200 });
  s.paper({ grid: 20 });
  s.frame(16, 16, 428, 268, { overshoot: 10 });
  const title = 'By the numbers';
  s.highlight(28, 44, s.measure(title, 'title', 34) + 12, 20);
  s.text(title, 32, 62, { font: 'title', size: 34 });
  const cells = [
    [sum.total, 'contributions, all time'],
    [sum.thisYear, `contributions in ${sum.year}`],
    [sum.current, sum.current === 1 ? 'day current streak' : 'days current streak'],
    [sum.longest, 'days longest streak'],
    [data.mergedPrs, 'pull requests merged'],
    [data.user.public_repos, 'public repositories'],
  ];
  cells.forEach(([n, label], k) => {
    const x = 34 + (k % 2) * 206;
    const y = 82 + Math.floor(k / 2) * 62;
    s.text(n.toLocaleString('en-US'), x, y + 34, { font: 'title', size: 40, fill: k === 2 ? t.red : t.ink });
    s.text(label, x, y + 52, { size: 12.5, fill: t.pencil });
  });
  s.draw(s.gen.line(232, 88, 232, 262, s.opts({ stroke: t.faint, strokeWidth: 1, roughness: 0.4 })), ' stroke-dasharray="4 7"');
  s.text(`updated ${fmtDate(sum.today)}`, 428, 276, { size: 11, fill: t.pencil, anchor: 'end' });
  return s;
}

function languagesCard(t, data) {
  const counts = new Map();
  data.languages.forEach((langs) => {
    for (const [name, bytes] of Object.entries(langs)) {
      if (profile.ignoredLanguages.includes(name)) continue;
      const c = counts.get(name) ?? { repos: 0, bytes: 0 };
      counts.set(name, { repos: c.repos + 1, bytes: c.bytes + bytes });
    }
  });
  const top = [...counts.entries()].sort((a, b) => b[1].repos - a[1].repos || b[1].bytes - a[1].bytes).slice(0, 7);
  const max = top[0]?.[1].repos ?? 1;

  const s = new Sketch({ width: 460, height: 300, theme: t, seed: 210 });
  s.paper({ grid: 20 });
  s.frame(16, 16, 428, 268, { overshoot: 10 });
  const title = 'Languages I reach for';
  s.highlight(28, 44, s.measure(title, 'title', 34) + 12, 20);
  s.text(title, 32, 62, { font: 'title', size: 34 });
  top.forEach(([name, { repos }], k) => {
    const y = 84 + k * 26;
    s.text(name, 34, y + 15, { size: 14 });
    const w = Math.max(10, (repos / max) * 210);
    const color = profile.languageColors[name] ?? t.pencil;
    s.rect(128, y + 2, w, 15, { fill: color, fillStyle: 'hachure', hachureGap: 3.6, fillWeight: 1.3, strokeWidth: 1.1, roughness: 0.9 });
    s.text(`${repos} repo${repos === 1 ? '' : 's'}`, 128 + w + 10, y + 15, { size: 12, fill: t.pencil });
  });
  s.text(`across ${data.repos.length} public repos`, 428, 276, { size: 11, fill: t.pencil, anchor: 'end' });
  return s;
}

function contributionsCard(t, data, sum) {
  const s = new Sketch({ width: 900, height: 250, theme: t, seed: 220 });
  s.paper();
  s.frame(20, 18, 860, 214, { overshoot: 10, o: { stroke: t.pencil, strokeWidth: 1.2 } });

  const end = new Date(Date.UTC(sum.today.getUTCFullYear(), sum.today.getUTCMonth(), sum.today.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 52 * 7 - end.getUTCDay());
  const cells = [];
  for (let d = new Date(start), i = 0; d <= end; d.setUTCDate(d.getUTCDate() + 1), i++) {
    cells.push({ date: isoDay(d), n: data.days.get(isoDay(d)) ?? 0, col: Math.floor(i / 7), row: d.getUTCDay(), month: d.getUTCMonth(), dom: d.getUTCDate() });
  }
  const yearTotal = cells.reduce((a, c) => a + c.n, 0);
  const active = cells.map((c) => c.n).filter(Boolean).sort((a, b) => a - b);
  const quartiles = [0.25, 0.5, 0.75].map((q) => active[Math.floor(q * (active.length - 1))] ?? 0);

  const title = 'A year of commits, shaded in pencil';
  s.highlight(40, 44, s.measure(title, 'title', 30) + 12, 18);
  s.text(title, 44, 60, { font: 'title', size: 30 });
  s.text(`${yearTotal.toLocaleString('en-US')} contributions in the last year`, 856, 58, { size: 14, anchor: 'end', fill: t.pencil });

  const [x0, y0, step, size] = [78, 92, 14.6, 11];
  ['Mon', 'Wed', 'Fri'].forEach((d, k) => s.text(d, 44, y0 + (1 + k * 2) * step + 9, { size: 10.5, fill: t.pencil }));
  let lastMonth = -1;
  for (const c of cells) {
    if (c.row === 0 && c.month !== lastMonth && c.dom <= 7 && c.col < 52) {
      s.text(MONTHS[c.month], x0 + c.col * step, y0 - 8, { size: 11, fill: t.pencil });
      lastMonth = c.month;
    }
  }
  const gaps = [0, 4.4, 3.2, 2.2, 1.5];
  const level = (n) => (n === 0 ? 0 : 1 + quartiles.filter((q) => n > q).length);
  const cell = (x, y, lv) => {
    if (lv === 0) return s.raw(`<circle cx="${x + size / 2}" cy="${y + size / 2}" r="1.3" fill="${t.faint}"/>`);
    s.rect(x, y, size, size, {
      stroke: t.ink, strokeWidth: 0.8, roughness: 0.5, bowing: 0.3, disableMultiStroke: true,
      fill: t.ink, fillStyle: lv === 4 ? 'cross-hatch' : 'hachure', hachureGap: gaps[lv], fillWeight: 0.8,
    });
  };
  for (const c of cells) cell(x0 + c.col * step, y0 + c.row * step, level(c.n));

  const ly = y0 + 7 * step + 18;
  s.text('less', x0, ly + 9, { size: 11, fill: t.pencil });
  [0, 1, 2, 3, 4].forEach((lv) => cell(x0 + 32 + lv * step, ly, lv));
  s.text('more', x0 + 32 + 5 * step + 4, ly + 9, { size: 11, fill: t.pencil });

  const best = cells.reduce((a, c) => (c.n > a.n ? c : a), cells[0]);
  if (best.n > 0) {
    const bx = x0 + best.col * step + size / 2;
    const by = y0 + best.row * step + size + 2;
    const note = `best day: ${best.n} on ${fmtDate(new Date(best.date))}`;
    const nw = s.measure(note, 'hand', 13);
    const nx = Math.min(Math.max(bx - nw / 2, 330), 856 - nw);
    s.text(note, nx, ly + 14, { size: 13, fill: t.red });
    const sx = Math.min(Math.max(bx, nx + 10), nx + nw - 10);
    s.arrow([[sx, ly - 1], [(sx + bx) / 2 - 8, (ly + by) / 2], [bx, by + 3]], { stroke: t.red, head: 7, strokeWidth: 1.2 });
  }
  return s;
}

// ---------------------------------------------------------------- main

async function buildStatic() {
  const dir = path.join(here, '..', 'assets');
  console.log(`static -> ${dir}`);
  save(dir, 'header', header, { title: "Hi there, I'm Akash Mhatre", desc: 'Full-stack engineer from Pune, India, drawn as a pencil sketch next to a website wireframe.' });
  const sections = [
    ['about', 'About me', 'the short version'],
    ['toolbox', 'Toolbox', 'languages & tools I use'],
    ['projects', "Things I've built", 'click a card to open it'],
    ['achievements', 'Achievements', 'small wins, proudly framed'],
    ['activity', 'Contributions', 'auto-updated twice a day'],
    ['contact', "Let's talk", 'say hi, I reply'],
  ];
  sections.forEach(([id, title, note], i) => save(dir, `section-${id}`, (t) => sectionTitle(t, i + 1, title, note), { title }));
  const icons = await fetchIcons();
  save(dir, 'toolbox', (t) => toolbox(t, icons), {
    title: 'Toolbox',
    desc: profile.stack.map((g) => `${g.group}: ${g.items.map((i) => i[0]).join(', ')}`).join('. '),
  });
  profile.projects.forEach((p, i) => save(dir, `project-${p.slug}`, (t) => projectCard(t, p, i), { title: p.name, desc: p.pitch }));
  save(dir, 'achievements', achievements, {
    title: 'Achievements',
    desc: profile.achievements.map((a) => `${a.title}: ${a.note}`).join('. '),
  });
  profile.links.forEach((l, i) => save(dir, `button-${l.id}`, (t) => button(t, l, i), { title: l.label }));
  save(dir, 'footer', footer, { title: 'Thanks for dropping by!' });
}

async function buildStats(outDir) {
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

const [mode, out] = process.argv.slice(2);
if (mode === 'static') await buildStatic();
else if (mode === 'stats') await buildStats(out);
else {
  console.error('usage: node build.mjs static | stats [outDir]');
  process.exit(1);
}

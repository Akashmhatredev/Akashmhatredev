// Cards redrawn from live GitHub data (stats, languages, contribution calendar).
import { Sketch } from '../lib/sketch.mjs';
import * as profile from '../profile.mjs';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (d) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

const isoDay = (d) => d.toISOString().slice(0, 10);

export function summarize(data) {
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

// Top-to-bottom reveal: the vertical twin of Sketch.write, for upright lines.
function reveal(s, [x, y, w, h], d, t, fn) {
  const id = `v${++s.uid}`;
  const k = (d / (d + t)).toFixed(3);
  s.defs.push(
    `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"><animate attributeName="height" values="0;0;${h}" keyTimes="0;${k};1" dur="${d + t}s" fill="freeze"/></rect></clipPath>`,
  );
  s.css.push(`.${id}{clip-path:url(#${id})}`);
  return s.group(`class="${id}"`, fn);
}

// Frame, highlighter and title shared by the two small cards.
function cardTitle(s, title) {
  s.drawIn(0, 1, () => s.frame(16, 16, 428, 268, { overshoot: 10 }));
  s.g({ cls: 'swipe', d: 0.7, t: 0.5 }, () => s.highlight(28, 44, s.measure(title, 'title', 34) + 12, 20));
  s.writeText(title, 32, 62, { font: 'title', size: 34 }, 0.3, 0.8);
}

function flame(s, x, y) {
  const t = s.t;
  s.loop('flicker', 0.9, 0, () => {
    s.path(`M ${x} ${y} C ${x - 10} ${y - 2} ${x - 9} ${y - 14} ${x - 1} ${y - 26} C ${x + 1} ${y - 16} ${x + 10} ${y - 12} ${x + 8} ${y - 4} C ${x + 6} ${y} ${x + 3} ${y} ${x} ${y} Z`, {
      stroke: t.red, strokeWidth: 1.2, roughness: 0.7, fill: t.red, fillStyle: 'hachure', hachureGap: 2.6, fillWeight: 1,
    });
    s.path(`M ${x} ${y - 2} C ${x - 4} ${y - 3} ${x - 4} ${y - 9} ${x} ${y - 14} C ${x + 2} ${y - 9} ${x + 5} ${y - 6} ${x} ${y - 2} Z`, {
      stroke: 'none', fill: t.marker, fillStyle: 'solid', roughness: 0.5,
    });
  }, '50% 100%');
}

export function statsCard(t, data, sum) {
  const s = new Sketch({ width: 460, height: 300, theme: t, seed: 200 });
  s.paper({ grid: 20 });
  cardTitle(s, 'By the numbers');
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
    const num = n.toLocaleString('en-US');
    s.g({ cls: 'rise', d: 0.9 + k * 0.15, t: 0.5 }, () => {
      s.text(num, x, y + 34, { font: 'title', size: 40, fill: k === 2 ? t.red : t.ink });
      if (k === 2) flame(s, x + s.measure(num, 'title', 40) + 22, y + 32);
    });
    s.g({ cls: 'fade', d: 1.1 + k * 0.15, t: 0.5 }, () => s.text(label, x, y + 52, { size: 12.5, fill: t.pencil }));
  });
  reveal(s, [228, 84, 10, 182], 1, 0.8, () =>
    s.draw(s.gen.line(232, 88, 232, 262, s.opts({ stroke: t.faint, strokeWidth: 1, roughness: 0.4 })), ' stroke-dasharray="4 7"'),
  );
  s.g({ cls: 'fade', d: 2 }, () => s.text(`updated ${fmtDate(sum.today)}`, 428, 276, { size: 11, fill: t.pencil, anchor: 'end' }));
  return s;
}

export function languagesCard(t, data) {
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
  cardTitle(s, 'Languages I reach for');
  top.forEach(([name, { repos }], k) => {
    const y = 84 + k * 26;
    const d = 0.8 + k * 0.12;
    s.writeText(name, 34, y + 15, { size: 14 }, d - 0.1, 0.4);
    const w = Math.max(10, (repos / max) * 210);
    const color = profile.languageColors[name] ?? t.pencil;
    s.g({ cls: 'swipe', d, t: 0.7 }, () =>
      s.rect(128, y + 2, w, 15, { fill: color, fillStyle: 'hachure', hachureGap: 3.6, fillWeight: 1.3, strokeWidth: 1.1, roughness: 0.9 }),
    );
    s.g({ cls: 'fade', d: d + 0.6, t: 0.4 }, () =>
      s.text(`${repos} repo${repos === 1 ? '' : 's'}`, 128 + w + 10, y + 15, { size: 12, fill: t.pencil }),
    );
  });
  s.g({ cls: 'fade', d: 2.2 }, () => s.text(`across ${data.repos.length} public repos`, 428, 276, { size: 11, fill: t.pencil, anchor: 'end' }));
  return s;
}

export function contributionsCard(t, data, sum) {
  const s = new Sketch({ width: 900, height: 250, theme: t, seed: 220 });
  s.css.push('@keyframes breathe{0%,100%{transform:none}50%{transform:scale(1.1)}}');
  s.paper();
  s.drawIn(0, 1.2, () => s.frame(20, 18, 860, 214, { overshoot: 10, o: { stroke: t.pencil, strokeWidth: 1.2 } }));

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
  s.g({ cls: 'swipe', d: 0.6, t: 0.5 }, () => s.highlight(40, 44, s.measure(title, 'title', 30) + 12, 18));
  s.writeText(title, 44, 60, { font: 'title', size: 30 }, 0.2, 0.9);
  s.g({ cls: 'fade', d: 0.8 }, () =>
    s.text(`${yearTotal.toLocaleString('en-US')} contributions in the last year`, 856, 58, { size: 14, anchor: 'end', fill: t.pencil }),
  );

  const [x0, y0, step, size] = [78, 92, 14.6, 11];
  s.g({ cls: 'fade', d: 0.4 }, () => {
    ['Mon', 'Wed', 'Fri'].forEach((d, k) => s.text(d, 44, y0 + (1 + k * 2) * step + 9, { size: 10.5, fill: t.pencil }));
    let lastMonth = -1;
    for (const c of cells) {
      if (c.row === 0 && c.month !== lastMonth && c.dom <= 7 && c.col < 52) {
        s.text(MONTHS[c.month], x0 + c.col * step, y0 - 8, { size: 11, fill: t.pencil });
        lastMonth = c.month;
      }
    }
  });
  const gaps = [0, 4.4, 3.2, 2.2, 1.5];
  const level = (n) => (n === 0 ? 0 : 1 + quartiles.filter((q) => n > q).length);
  const dot = (x, y) => s.raw(`<circle cx="${x + size / 2}" cy="${y + size / 2}" r="1.3" fill="${t.faint}"/>`);
  const cell = (x, y, lv) => {
    if (lv === 0) return dot(x, y);
    s.rect(x, y, size, size, {
      stroke: t.ink, strokeWidth: 0.8, roughness: 0.5, bowing: 0.3, disableMultiStroke: true,
      fill: t.ink, fillStyle: lv === 4 ? 'cross-hatch' : 'hachure', hachureGap: gaps[lv], fillWeight: 0.8,
    });
  };
  // Sweep left to right: one fade group of empty-day dots per week, and each
  // active day pops in on its week's beat.
  const weeks = Math.max(...cells.map((c) => c.col)) + 1;
  for (let col = 0; col < weeks; col++) {
    const d = +(0.5 + col * 0.028).toFixed(3);
    const week = cells.filter((c) => c.col === col);
    s.g({ cls: 'fade', d, t: 0.3 }, () => week.filter((c) => !c.n).forEach((c) => dot(x0 + c.col * step, y0 + c.row * step)));
    for (const c of week.filter((w) => w.n)) s.g({ cls: 'pop', d, t: 0.45 }, () => cell(x0 + c.col * step, y0 + c.row * step, level(c.n)));
  }

  const ly = y0 + 7 * step + 18;
  s.g({ cls: 'fade', d: 2 }, () => {
    s.text('less', x0, ly + 9, { size: 11, fill: t.pencil });
    [0, 1, 2, 3, 4].forEach((lv) => cell(x0 + 32 + lv * step, ly, lv));
    s.text('more', x0 + 32 + 5 * step + 4, ly + 9, { size: 11, fill: t.pencil });
  });

  const best = cells.reduce((a, c) => (c.n > a.n ? c : a), cells[0]);
  if (best.n > 0) {
    const cx = x0 + best.col * step + size / 2;
    const cy = y0 + best.row * step + size / 2;
    s.loop('breathe', 2.2, 2.8, () => s.drawIn(2.1, 0.6, () => s.ellipse(cx, cy, 26, 22, { stroke: t.red, strokeWidth: 1.3, roughness: 1.6 })));
    const by = cy + size / 2 + 2;
    const note = `best day: ${best.n} on ${fmtDate(new Date(best.date))}`;
    const nw = s.measure(note, 'hand', 13);
    const nx = Math.min(Math.max(cx - nw / 2, 330), 856 - nw);
    s.writeText(note, nx, ly + 14, { size: 13, fill: t.red }, 2.4, 0.8);
    const sx = Math.min(Math.max(cx, nx + 10), nx + nw - 10);
    s.drawIn(2.5, 0.6, () => s.arrow([[sx, ly - 1], [(sx + cx) / 2 - 8, (ly + by) / 2], [cx, by + 3]], { stroke: t.red, head: 7, strokeWidth: 1.2 }));
  }
  return s;
}

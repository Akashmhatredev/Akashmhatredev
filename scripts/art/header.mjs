// Hero banner at the top of the README.
//
// Timeline: the name and notes write themselves in (a pencil follows the
// name), the wireframe draws on, and the hobby doodles drop in by ~3.4s.
// After that an 8s story loops in the wireframe: an idea (lightbulb) lands
// in the image box, a cursor clicks "ship it", and a "shipped!" note pops up.
import { Sketch } from '../lib/sketch.mjs';

const STORY = '8s ease-in-out 3.4s infinite';
const HEADER_CSS = `
.cursor,.press,.shipped,.bulb{transform-box:fill-box}
.cursor{transform-origin:0 0;animation:h-cursor ${STORY} both}
.press{transform-origin:50% 50%;animation:h-press ${STORY}}
.shipped{transform-origin:50% 100%;animation:h-shipped ${STORY} both}
.bulb{transform-origin:50% 80%;animation:h-bulb ${STORY} both}
.xcross{animation:h-cross ${STORY}}
@keyframes h-bulb{0%,8%{opacity:0;transform:scale(.3)}16%{opacity:1;transform:scale(1.15)}20%,84%{opacity:1;transform:none}92%,100%{opacity:0;transform:scale(.3)}}
@keyframes h-cross{0%,8%,92%,100%{opacity:1}16%,84%{opacity:.12}}
@keyframes h-cursor{0%,22%{opacity:0;transform:translate(110px,70px)}28%{opacity:1}40%{transform:none}43%{transform:scale(.8)}46%{transform:none}80%{opacity:1;transform:none}90%,100%{opacity:0;transform:translate(50px,70px)}}
@keyframes h-press{0%,41%,47%,100%{transform:none}43.5%{transform:scale(.9)}}
@keyframes h-shipped{0%,44%{opacity:0;transform:translateY(8px) scale(.4)}50%{opacity:1;transform:translateY(-2px) scale(1.1)}54%,82%{opacity:1;transform:none}90%,100%{opacity:0;transform:translateY(-10px)}}
`.replace(/\n/g, '');

const r1 = (n) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------- wireframe

function bulb(s, cx, cy) {
  const t = s.t;
  s.circle(cx, cy - 6, 34, { stroke: 'none', fill: t.paper, fillStyle: 'solid' });
  s.loop('blip', 1.2, 0, () => {
    for (const a of [-150, -115, -90, -65, -30]) {
      const rad = (a * Math.PI) / 180;
      s.line(cx + 21 * Math.cos(rad), cy - 6 + 21 * Math.sin(rad), cx + 28 * Math.cos(rad), cy - 6 + 28 * Math.sin(rad), {
        stroke: t.red, strokeWidth: 1.3, roughness: 0.5,
      });
    }
  });
  s.circle(cx, cy - 6, 30, { fill: t.marker, fillStyle: 'hachure', hachureGap: 3.4, fillWeight: 1.2, strokeWidth: 1.4 });
  s.linear([[cx - 5, cy - 2], [cx - 2, cy - 9], [cx + 2, cy - 2], [cx + 5, cy - 9]], { stroke: t.red, strokeWidth: 1.1, roughness: 0.4 });
  s.rect(cx - 7, cy + 9, 14, 10, { strokeWidth: 1.2, roughness: 0.6 });
  s.line(cx - 7, cy + 13, cx + 7, cy + 13, { strokeWidth: 1, roughness: 0.4 });
}

function cursor(s, x, y) {
  const pts = [[0, 0], [0, 22], [6, 17], [10, 26], [14, 24], [10, 15], [17, 15]].map(([dx, dy]) => [x + dx, y + dy]);
  s.polygon(pts, { fill: s.t.paper, fillStyle: 'solid', strokeWidth: 1.4, roughness: 0.6 });
}

function wireframe(s, x, y, w, h) {
  const t = s.t;
  s.drawIn(0.4, 1.0, () => s.frame(x, y, w, h, { overshoot: 16 }));
  s.drawIn(1.2, 0.5, () => {
    s.line(x, y + 24, x + w, y + 24, { strokeWidth: 1.2 });
    [14, 28, 42].forEach((dx) => s.circle(x + dx, y + 12, 8, { strokeWidth: 1.1 }));
    s.rect(x + 58, y + 6, w - 72, 12, { stroke: t.faint, strokeWidth: 1, roughness: 0.6 });
  });

  // image placeholder, crossed out the way wireframes do it, until an idea lands
  const [ix, iy, iw, ih] = [x + 14, y + 38, 104, 70];
  s.drawIn(1.4, 0.5, () => s.rect(ix, iy, iw, ih, { strokeWidth: 1.2 }));
  s.g({ cls: 'xcross' }, () =>
    s.drawIn(1.7, 0.4, () => {
      s.line(ix, iy, ix + iw, iy + ih, { stroke: t.faint, strokeWidth: 1 });
      s.line(ix + iw, iy, ix, iy + ih, { stroke: t.faint, strokeWidth: 1 });
    }),
  );
  s.g({ cls: 'bulb' }, () => bulb(s, ix + iw / 2, iy + ih / 2 + 2));

  [44, 57, 70].forEach((dy, i) =>
    s.drawIn(1.7 + i * 0.15, 0.45, () =>
      s.squiggle(x + 132, y + dy, w - 150 - i * 22, { amp: 1.4, step: 7, o: { stroke: t.pencil, strokeWidth: 1.1 } }),
    ),
  );

  const [bx, by] = [x + 132, y + 84];
  s.g({ cls: 'press' }, () => {
    s.drawIn(2.0, 0.5, () =>
      s.rect(bx, by, 76, 24, { fill: t.marker, fillStyle: 'hachure', hachureGap: 3.5, fillWeight: 1.4, strokeWidth: 1.3 }),
    );
    s.g({ cls: 'fade', d: 2.35, t: 0.4 }, () => {
      s.raw(`<rect x="${bx + 14}" y="${by + 5}" width="48" height="15" rx="4" fill="${t.paper}" opacity="0.9"/>`);
      s.text('ship it', bx + 38, by + 17, { size: 13, anchor: 'middle' });
    });
  });

  const cw = (w - 28 - 16) / 3;
  for (let i = 0; i < 3; i++) {
    const cx = x + 14 + i * (cw + 8);
    s.drawIn(2.2 + i * 0.12, 0.5, () => {
      s.rect(cx, y + 122, cw, h - 136, { strokeWidth: 1.1, stroke: t.pencil });
      s.line(cx + 8, y + 136, cx + cw - 14, y + 136, { stroke: t.faint, strokeWidth: 1 });
      s.line(cx + 8, y + 146, cx + cw - 26, y + 146, { stroke: t.faint, strokeWidth: 1 });
    });
  }

  // dimension line across the top
  const dy = y - 30;
  s.drawIn(2.6, 0.5, () => {
    s.line(x, dy, x + w, dy, { stroke: t.red, strokeWidth: 1, roughness: 0.4 });
    s.line(x, dy - 6, x, dy + 6, { stroke: t.red, strokeWidth: 1, roughness: 0.3 });
    s.line(x + w, dy - 6, x + w, dy + 6, { stroke: t.red, strokeWidth: 1, roughness: 0.3 });
  });
  const label = '100% curiosity';
  const lw = s.measure(label, 'hand', 13);
  s.g({ cls: 'fade', d: 2.9, t: 0.4 }, () => {
    s.raw(`<rect x="${x + w / 2 - lw / 2 - 6}" y="${dy - 9}" width="${lw + 12}" height="18" fill="${t.paper}"/>`);
    s.text(label, x + w / 2, dy + 5, { size: 13, anchor: 'middle', fill: t.red });
  });

  // "shipped!" note that pops up when the cursor clicks
  s.g({ cls: 'shipped' }, () => {
    const [nx, ny, nw, nh] = [bx - 4, by - 34, 92, 26];
    s.rect(nx, ny, nw, nh, { fill: t.paper, fillStyle: 'solid', stroke: t.green, strokeWidth: 1.3, roughness: 0.8 });
    s.linear([[nx + 9, ny + 13], [nx + 13, ny + 18], [nx + 21, ny + 7]], { stroke: t.green, strokeWidth: 1.8, roughness: 0.4 });
    s.text('shipped!', nx + 26, ny + 19, { font: 'title', size: 20, fill: t.green });
    for (const [x1, y1, x2, y2] of [[bx - 4, by + 6, bx - 13, by + 1], [bx - 4, by + 18, bx - 13, by + 23], [bx + 80, by + 6, bx + 89, by + 1], [bx + 80, by + 18, bx + 89, by + 23]]) {
      s.line(x1, y1, x2, y2, { stroke: t.green, strokeWidth: 1.3, roughness: 0.4 });
    }
  });

  s.g({ cls: 'cursor' }, () => cursor(s, bx + 58, by + 15));
}

// ---------------------------------------------------------------- the pencil

// A yellow pencil that follows the name as it is written, then lifts away.
function pencil(s, x0, x1, top, bottom, d, t) {
  const total = d + t + 0.5;
  const k = (sec) => (sec / total).toFixed(3);
  const steps = 14;
  const values = [[x0 - 14, top - 50], [x0, top - 4]];
  const times = [0, k(d - 0.05)];
  for (let i = 0; i <= steps; i++) {
    values.push([x0 + ((x1 - x0) * i) / steps, i % 2 ? top : bottom]);
    times.push(k(d + (t * i) / steps));
  }
  values.push([x1 + 40, top - 50]);
  times.push(1);

  const ink = s.t.ink;
  s.raw(
    `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${k(d - 0.4)};${k(d - 0.15)};${k(d + t + 0.1)};1" dur="${r1(total)}s" fill="freeze"/>` +
      `<animateTransform attributeName="transform" type="translate" values="${values.map(([x, y]) => `${r1(x)},${r1(y)}`).join(';')}" keyTimes="${times.join(';')}" dur="${r1(total)}s" fill="freeze"/>`,
  );
  s.group('transform="rotate(-40)"', () => {
    const o = { stroke: ink, strokeWidth: 1.1, roughness: 0.5, fillStyle: 'solid' };
    s.rect(15, -5.5, 54, 11, { ...o, fill: '#F6C945' });
    s.line(17, 0, 67, 0, { stroke: '#C99A1E', strokeWidth: 0.9, roughness: 0.4 });
    s.rect(69, -5.5, 7, 11, { ...o, fill: '#B9BDC4' });
    s.rect(76, -5.5, 9, 11, { ...o, fill: '#E88C8C' });
    s.polygon([[0, 0], [15, -5.5], [15, 5.5]], { ...o, fill: '#E9CFA6' });
    s.polygon([[0, 0], [5, -1.9], [5, 1.9]], { ...o, fill: '#3A3A3A', stroke: '#3A3A3A' });
  });
  s.raw('</g>');
}

// ---------------------------------------------------------------- hobby strip

const hobbies = [
  ['chess', (s, cx, by) => s.loop('hop', 2.6, 3.8, () => {
    const p = { fill: s.t.pencil, fillStyle: 'hachure', hachureGap: 3.2, fillWeight: 0.9, strokeWidth: 1.3 };
    s.circle(cx, by - 40, 14, p);
    s.ellipse(cx, by - 31, 18, 5, { strokeWidth: 1.2 });
    s.polygon([[cx - 6, by - 30], [cx + 6, by - 30], [cx + 11, by - 9], [cx - 11, by - 9]], p);
    s.rect(cx - 15, by - 9, 30, 9, { strokeWidth: 1.3 });
  }, '50% 100%')],
  ['puzzles', (s, cx, by) => s.loop('wiggle', 3, 3.9, () => {
    const [x, y] = [cx - 20, by - 34];
    s.path(`M ${x} ${y} h 12 a 6 6 0 1 1 12 0 h 12 v 11 a 6 6 0 1 1 0 12 v 11 h -36 Z`, {
      fill: s.t.blue, fillStyle: 'hachure', hachureGap: 3.4, fillWeight: 1, strokeWidth: 1.3,
    });
  })],
  ['treks', (s, cx, by) => {
    s.polygon([[cx - 34, by], [cx - 12, by - 28], [cx - 3, by - 17], [cx + 10, by - 38], [cx + 34, by]], {
      fill: s.t.pencil, fillStyle: 'hachure', hachureGap: 5, fillWeight: 0.7, strokeWidth: 1.3,
    });
    s.linear([[cx + 3, by - 29], [cx + 7, by - 25], [cx + 10, by - 29], [cx + 13, by - 25], [cx + 17, by - 30]], { strokeWidth: 1 });
    s.line(cx + 10, by - 38, cx + 10, by - 60, { strokeWidth: 1.3, roughness: 0.4 });
    s.loop('flag', 1.1, 3.9, () =>
      s.polygon([[cx + 10, by - 60], [cx + 27, by - 55], [cx + 10, by - 50]], { fill: s.t.red, fillStyle: 'solid', stroke: s.t.red, strokeWidth: 1 }),
    '0 50%');
  }],
  ['games', (s, cx, by) => s.loop('bob', 2.2, 3.9, () => {
    s.path(`M ${cx - 16} ${by - 30} h 32 a 13 13 0 0 1 0 26 h -32 a 13 13 0 0 1 0 -26 Z`, { strokeWidth: 1.4 });
    s.line(cx - 22, by - 17, cx - 10, by - 17, { strokeWidth: 1.6, roughness: 0.4 });
    s.line(cx - 16, by - 23, cx - 16, by - 11, { strokeWidth: 1.6, roughness: 0.4 });
    s.loop('blip', 1.2, 3.9, () => s.circle(cx + 11, by - 21, 7, { fill: s.t.red, fillStyle: 'solid', strokeWidth: 1 }));
    s.loop('blip', 1.2, 4.5, () => s.circle(cx + 19, by - 13, 7, { fill: s.t.blue, fillStyle: 'solid', strokeWidth: 1 }));
  })],
  ['fuel', (s, cx, by) => {
    s.line(cx - 22, by, cx + 24, by, { strokeWidth: 1.2, roughness: 0.6 });
    s.rect(cx - 14, by - 30, 26, 29, { fill: s.t.blue, fillStyle: 'hachure', hachureGap: 4, fillWeight: 0.9, strokeWidth: 1.4 });
    s.arc(cx + 12, by - 15, 16, 16, -Math.PI / 2, Math.PI / 2, { strokeWidth: 1.4 });
    [-8, -1, 6].forEach((dx, i) =>
      s.loop('steam', 2.4, 3.4 + i * 0.8, () =>
        s.curve([[cx + dx, by - 36], [cx + dx + 3, by - 41], [cx + dx - 2, by - 46], [cx + dx + 2, by - 52]], { stroke: s.t.pencil, strokeWidth: 1.2, roughness: 0.6 }),
      ),
    );
  }],
];

function hobbyStrip(s, y) {
  const t = s.t;
  s.write([36, y - 8, 834, 16], 2.8, 0.8, () =>
    s.draw(s.gen.line(40, y, 860, y, s.opts({ stroke: t.faint, strokeWidth: 1.2, roughness: 0.5 })), ' stroke-dasharray="6 7"'),
  );
  const by = y + 54;
  const label = 'off the clock';
  const lw = s.measure(label, 'title', 26);
  s.writeText(label, 46, by - 14, { font: 'title', size: 26, fill: t.pencil }, 3.0, 0.5);
  s.drawIn(3.3, 0.4, () => s.arrow([[46 + lw + 10, by - 22], [196, by - 22]], { stroke: t.pencil, strokeWidth: 1.1, head: 7 }));

  hobbies.forEach(([name, doodle], i) => {
    const cx = 262 + i * 142;
    s.g({ cls: 'drop', d: 3.1 + i * 0.12, t: 0.7 }, () => {
      doodle(s, cx, by);
      s.text(name, cx, by + 20, { size: 12.5, anchor: 'middle', fill: t.pencil });
    });
  });
}

// ---------------------------------------------------------------- header

function star(s, x, y, d) {
  const pts = [[0, -7], [2, -2], [7, 0], [2, 2], [0, 7], [-2, 2], [-7, 0], [-2, -2]].map(([dx, dy]) => [x + dx, y + dy]);
  s.loop('twinkle', 2.2, d, () => s.polygon(pts, { fill: s.t.marker, fillStyle: 'solid', strokeWidth: 0.9, roughness: 0.4 }));
}

export function header(t) {
  const s = new Sketch({ width: 900, height: 384, theme: t, seed: 1 });
  s.css.push(HEADER_CSS);
  s.paper();

  s.writeText('FIG. 01 — the developer, roughly to scale', 46, 44, { size: 13, fill: t.pencil }, 0.1, 0.5);
  s.writeText("Hi there, I'm", 46, 98, { font: 'title', size: 44 }, 0.3, 0.6);
  const nameW = s.measure('Akash Mhatre', 'title', 84);
  s.g({ cls: 'swipe', d: 0.8, t: 0.45 }, () => s.highlight(38, 128, nameW + 18, 44));
  s.writeText('Akash Mhatre', 46, 168, { font: 'title', size: 84 }, 0.95, 1.25);
  s.writeText('Full-stack engineer · Pune, India', 48, 210, { size: 20 }, 2.1, 0.6);
  s.writeText('I sketch ideas, then ship them: SaaS platforms,', 48, 244, { size: 15, fill: t.pencil }, 2.4, 0.6);
  s.writeText('data pipelines, browser games & learning tools.', 48, 266, { size: 15, fill: t.pencil }, 2.6, 0.6);

  const hiW = s.measure("Hi there, I'm", 'title', 44);
  star(s, 46 + hiW + 22, 70, 2.4);
  star(s, 46 + nameW + 14, 112, 2.9);
  star(s, 46 + nameW + 34, 140, 3.4);

  s.boil(() => wireframe(s, 590, 76, 270, 186), 1.6);
  s.writeText('insert', 520, 186, { size: 14, fill: t.blue }, 2.9, 0.4);
  s.writeText('idea here', 512, 204, { size: 14, fill: t.blue }, 3.05, 0.45);
  s.drawIn(3.1, 0.4, () => s.arrow([[548, 168], [560, 140], [586, 118], [600, 112]], { stroke: t.blue }));

  hobbyStrip(s, 296);

  // drawn last so it sits on top of the name it is writing
  pencil(s, 46, 46 + nameW, 134, 158, 0.95, 1.25);
  return s;
}

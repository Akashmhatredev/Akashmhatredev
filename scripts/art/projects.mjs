// Project cards, each with its own doodle. Each card draws itself on in
// about three seconds, then its doodle keeps a small loop going.
import { Sketch, smoothPath } from '../lib/sketch.mjs';
import * as profile from '../profile.mjs';

// When the doodle starts drawing, and when its loops kick in.
const DOODLE_AT = 0.7;
const LOOP_AT = 2.2;

const r1 = (n) => Math.round(n * 10) / 10;

const doodles = {
  versus(s, cx, cy) {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = i % 2 ? 26 : 42;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    s.loop('throb', 1.8, LOOP_AT, () => {
      s.drawIn(DOODLE_AT, 0.9, () =>
        s.polygon(pts, { fill: s.t.marker, fillStyle: 'hachure', hachureGap: 4, fillWeight: 1.3, strokeWidth: 1.4 }),
      );
    });
    s.g({ cls: 'pop', d: DOODLE_AT + 0.6 }, () =>
      s.loop('shake', 2.2, LOOP_AT + 0.4, () => {
        s.raw(`<ellipse cx="${cx}" cy="${cy - 1}" rx="22" ry="15" fill="${s.t.paper}"/>`);
        s.text('VS', cx, cy + 9, { font: 'title', size: 28, anchor: 'middle', fill: s.t.red });
      }),
    );
  },
  terminal(s, cx, cy) {
    s.drawIn(DOODLE_AT, 0.9, () => {
      s.rect(cx - 42, cy - 32, 84, 64, { strokeWidth: 1.5 });
      s.line(cx - 42, cy - 18, cx + 42, cy - 18, { strokeWidth: 1.1 });
      [-34, -26, -18].forEach((dx) => s.circle(cx + dx, cy - 25, 5, { strokeWidth: 1 }));
    });
    const prompt = s.writeText('>>> py', cx - 34, cy + 4, { size: 14, fill: s.t.blue }, DOODLE_AT + 0.6, 0.4);
    s.loop('blink', 1.1, LOOP_AT, () =>
      s.raw(`<rect x="${r1(prompt.x + prompt.width + 3)}" y="${cy - 7}" width="6" height="12" fill="${s.t.blue}"/>`),
    );
    // "hello!" types itself again and again
    const [hx, hy] = [cx - 34, cy + 22];
    const hw = s.measure('hello!', 'hand', 13) + 6;
    const id = `c${++s.uid}`;
    s.defs.push(
      `<clipPath id="${id}"><rect x="${hx - 3}" y="${hy - 15}" width="${r1(hw)}" height="20">` +
        `<set attributeName="width" to="0" begin="0s" end="${DOODLE_AT + 1}s"/>` +
        `<animate attributeName="width" values="0;0;${r1(hw)};${r1(hw)};0" keyTimes="0;.12;.4;.88;1" dur="3.4s" begin="${DOODLE_AT + 1}s" repeatCount="indefinite"/>` +
        '</rect></clipPath>',
    );
    s.group(`clip-path="url(#${id})"`, () => s.text('hello!', hx, hy, { size: 13, fill: s.t.pencil }));
  },
  book(s, cx, cy) {
    const page = { strokeWidth: 1.4, fill: s.t.paper, fillStyle: 'solid' };
    // the turning page reuses the right page's exact strokes, so at rest they overlap perfectly
    const right = s.gen.polygon([[cx + 44, cy - 24], [cx, cy - 16], [cx, cy + 30], [cx + 44, cy + 22]], s.opts(page));
    s.drawIn(DOODLE_AT, 0.9, () => {
      s.polygon([[cx - 44, cy - 24], [cx, cy - 16], [cx, cy + 30], [cx - 44, cy + 22]], page);
      s.draw(right);
      for (let i = 0; i < 4; i++) {
        s.line(cx - 36, cy - 10 + i * 9, cx - 8, cy - 5 + i * 9, { stroke: s.t.faint, strokeWidth: 1 });
        s.line(cx + 8, cy - 5 + i * 9, cx + 36, cy - 10 + i * 9, { stroke: s.t.faint, strokeWidth: 1 });
      }
    });
    // a blank page that turns over the spine, then fades into the left page
    s.css.push(
      '@keyframes pageturn{0%,30%{opacity:0;transform:none}36%{opacity:1;transform:none}72%{opacity:1;transform:scaleX(-1)}84%,100%{opacity:0;transform:scaleX(-1)}}',
    );
    s.loop('pageturn', 3.6, LOOP_AT, () => s.draw(right), '0 50%');
    s.loop('bob', 2.4, LOOP_AT, () =>
      s.drawIn(DOODLE_AT + 0.4, 0.6, () =>
        s.polygon([[cx - 22, cy - 46], [cx, cy - 22], [cx + 22, cy - 46], [cx + 12, cy - 46], [cx, cy - 32], [cx - 12, cy - 46]], {
          fill: s.t.green, fillStyle: 'hachure', hachureGap: 3, fillWeight: 1.1, strokeWidth: 1.2,
        }),
      ),
    );
  },
  database(s, cx, cy) {
    const x = cx - 10;
    s.drawIn(DOODLE_AT, 0.9, () => {
      s.line(x - 30, cy - 26, x - 30, cy + 24, { strokeWidth: 1.4 });
      s.line(x + 30, cy - 26, x + 30, cy + 24, { strokeWidth: 1.4 });
      s.ellipse(x, cy - 26, 60, 18, { strokeWidth: 1.4 });
      s.arc(x, cy, 60, 18, 0, Math.PI, { strokeWidth: 1.2 });
      s.arc(x, cy + 24, 60, 18, 0, Math.PI, { strokeWidth: 1.4 });
    });
    s.g({ cls: 'pop', d: DOODLE_AT + 0.7 }, () =>
      s.loop('flash', 2.4, LOOP_AT, () =>
        s.polygon([[cx + 30, cy - 36], [cx + 18, cy - 4], [cx + 28, cy - 4], [cx + 20, cy + 26], [cx + 42, cy - 12], [cx + 31, cy - 12], [cx + 40, cy - 36]], {
          fill: s.t.marker, fillStyle: 'solid', stroke: s.t.ink, strokeWidth: 1.2,
        }),
      ),
    );
  },
  artillery(s, cx, cy) {
    s.drawIn(DOODLE_AT, 0.8, () => {
      s.squiggle(cx - 48, cy + 32, 96, { amp: 1.5, step: 12, o: { stroke: s.t.pencil, strokeWidth: 1.2 } });
      s.rect(cx - 46, cy + 14, 26, 14, { strokeWidth: 1.3, fill: s.t.blue, fillStyle: 'hachure', hachureGap: 3 });
      s.arc(cx - 33, cy + 14, 16, 14, Math.PI, Math.PI * 2, { strokeWidth: 1.3 });
      s.line(cx - 30, cy + 9, cx - 16, cy - 2, { strokeWidth: 2 });
    });
    // The dashed arc keeps its own dash pattern, so it is revealed with a wipe.
    const arc = [[cx - 14, cy - 4], [cx + 2, cy - 30], [cx + 20, cy - 26], [cx + 34, cy + 14]];
    s.write([cx - 18, cy - 36, 60, 56], DOODLE_AT + 0.5, 0.6, () =>
      s.draw(s.gen.curve(arc, s.opts({ stroke: s.t.red, strokeWidth: 1.2, roughness: 0.6 })), ' stroke-dasharray="3 4"'),
    );

    // One shot every 2.6s: wait, fly along the arc, burst on impact.
    const begin = `${LOOP_AT}s`;
    const cycle = 'dur="2.6s" repeatCount="indefinite"';
    const [ax, ay] = arc[0];
    const flight = smoothPath(arc.map(([x, y]) => [r1(x - ax), r1(y - ay)]));
    s.raw(
      `<g transform="translate(${ax} ${ay})" opacity="0">` +
        `<animate attributeName="opacity" values="0;1;0" keyTimes="0;.3;.68" calcMode="discrete" begin="${begin}" ${cycle}/>` +
        `<animateMotion path="${flight}" keyPoints="0;0;1;1" keyTimes="0;.3;.68;1" calcMode="linear" begin="${begin}" ${cycle}/>`,
    );
    s.circle(0, 0, 6, { fill: s.t.ink, fillStyle: 'solid', strokeWidth: 1 });
    s.raw('</g>');

    const burst = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r = i % 2 ? 6 : 13;
      burst.push([r1(r * Math.cos(a)), r1(r * Math.sin(a))]);
    }
    s.raw(
      `<g transform="translate(${cx + 36} ${cy + 22})"><g>` +
        `<animateTransform attributeName="transform" type="scale" values=".2;.2;1.35;1;1" keyTimes="0;.68;.74;.82;1" begin="${begin}" ${cycle}/>` +
        `<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.68;.69;.9;1" begin="${begin}" ${cycle}/>`,
    );
    s.g({ cls: 'pop', d: DOODLE_AT + 1 }, () => s.polygon(burst, { fill: s.t.red, fillStyle: 'solid', stroke: s.t.red, strokeWidth: 1 }));
    s.raw('</g></g>');
  },
  orbit(s, cx, cy) {
    s.drawIn(DOODLE_AT, 0.9, () =>
      s.circle(cx, cy, 46, { strokeWidth: 1.4, fill: s.t.blue, fillStyle: 'hachure', hachureGap: 4.5, fillWeight: 1 }),
    );
    s.group(`transform="rotate(-18 ${cx} ${cy})"`, () => {
      s.drawIn(DOODLE_AT + 0.4, 0.8, () => s.ellipse(cx, cy, 96, 28, { strokeWidth: 1.2 }));
      // the moon rides the ellipse: front half right-to-left, back half left-to-right
      s.raw(
        `<g transform="translate(${cx + 48} ${cy})">` +
          `<animateMotion path="M 0 0 a 48 14 0 1 1 -96 0 a 48 14 0 1 1 96 0" dur="5s" begin="${LOOP_AT}s" repeatCount="indefinite"/>`,
      );
      s.g({ cls: 'pop', d: DOODLE_AT + 1 }, () => s.circle(0, 0, 10, { fill: s.t.marker, fillStyle: 'solid', strokeWidth: 1.1 }));
      s.raw('</g>');
    });
    [[-36, -30], [34, -34], [-40, 30]].forEach(([dx, dy], k) =>
      s.loop('twinkle', 2.4, LOOP_AT - k * 0.8, () => s.text('+', cx + dx, cy + dy, { size: 14, fill: s.t.pencil })),
    );
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

export function projectCard(t, p, i) {
  const s = new Sketch({ width: 460, height: 300, theme: t, seed: 100 + i * 7 });
  s.paper({ grid: 20 });
  s.drawIn(0, 1, () => s.frame(16, 16, 428, 268, { overshoot: 10 }));
  s.g({ cls: 'fade', d: 0.3 }, () => {
    s.text(`PROJ. ${String(i + 1).padStart(2, '0')}`, 32, 42, { size: 12, fill: t.pencil });
    s.text(`rev. ${p.date}`, 428, 42, { size: 12, fill: t.pencil, anchor: 'end' });
  });

  let size = 36;
  while (s.measure(p.name, 'title', size) > 282) size -= 1;
  const tw = s.measure(p.name, 'title', size);
  s.g({ cls: 'swipe', d: 0.5, t: 0.5 }, () => s.highlight(28, 60, tw + 12, 20));
  s.writeText(p.name, 32, 78, { font: 'title', size }, 0.3, 0.8);

  doodles[p.doodle](s, 382, 94);

  const lines = wrapAround(s, p.pitch, 14, (n) => (n < 3 ? 296 : 392)).slice(0, 5);
  lines.forEach((l, n) => s.writeText(l, 32, 108 + n * 20, { size: 14 }, 0.9 + n * 0.22, 0.5));
  s.g({ cls: 'fade', d: 2.1 }, () => s.text(p.facts, 32, 214, { size: 13, fill: t.blue }));

  let x = 32;
  p.tags.forEach((tag, k) => {
    const w = s.measure(tag, 'hand', 12) + 16;
    s.g({ cls: 'pop', d: 2.2 + k * 0.08 }, () => {
      s.rect(x, 226, w, 22, { stroke: t.pencil, strokeWidth: 1, roughness: 0.9 });
      s.text(tag, x + 8, 241.5, { size: 12 });
    });
    x += w + 7;
  });

  const label = p.live ? 'live demo' : 'view source';
  const lw = s.measure(label, 'title', 22);
  s.writeText(label, 404, 270, { font: 'title', size: 22, anchor: 'end', fill: t.red }, 2.35, 0.45);
  s.drawIn(2.7, 0.3, () => s.squiggle(404 - lw, 276, lw, { amp: 1.2, step: 7, o: { stroke: t.red, strokeWidth: 1.1 } }));
  s.loop('nudge', 1.6, 3, () =>
    s.drawIn(2.8, 0.25, () => s.arrow([[409, 270], [418, 262], [428, 252]], { stroke: t.red, head: 7, strokeWidth: 1.3 })),
  );
  return s;
}

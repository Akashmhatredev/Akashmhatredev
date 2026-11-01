// Section titles, nav tabs, contact buttons and the footer.
import { Sketch, smoothPath } from '../lib/sketch.mjs';

export function sectionTitle(t, num, title, note) {
  const s = new Sketch({ width: 900, height: 76, theme: t, seed: 10 + num });
  s.boil(() => s.drawIn(0, 0.7, () => s.ellipse(30, 40, 50, 42, { stroke: t.red, strokeWidth: 1.4 })), 1.6);
  s.g({ cls: 'fade', d: 0.35, t: 0.4 }, () =>
    s.text(String(num).padStart(2, '0'), 30, 49, { font: 'title', size: 26, anchor: 'middle', fill: t.red }),
  );
  const w = s.measure(title, 'title', 44);
  s.g({ cls: 'swipe', d: 0.3, t: 0.5 }, () => s.highlight(64, 36, w + 14, 24));
  s.writeText(title, 70, 56, { font: 'title', size: 44 }, 0.2, 0.8);
  const noteW = s.measure(note, 'hand', 14);
  const from = 70 + w + 26;
  const to = 900 - noteW - 26;
  if (to - from > 40) {
    s.write([from - 4, 38, to - from + 8, 18], 0.9, 0.6, () =>
      s.draw(s.gen.line(from, 47, to, 47, s.opts({ stroke: t.faint, strokeWidth: 1.2, roughness: 0.5 })), ' stroke-dasharray="6 7"'),
    );
  }
  s.writeText(note, 896, 52, { size: 14, fill: t.pencil, anchor: 'end' }, 1.3, 0.6);
  return s;
}

// Folder-style index tab; the row of them sits on one shared pencil line.
export function tab(t, sec, i) {
  const s = new Sketch({ width: 150, height: 52, theme: t, seed: 70 + i });
  const color = [t.marker, t.blue, t.red, t.green][i % 4];
  s.g({ cls: 'drop', d: i * 0.12, t: 0.7 }, () => {
    const shape = [[8, 47], [17, 7], [133, 7], [142, 47]];
    s.polygon(shape, { stroke: 'none', fill: t.paper, fillStyle: 'solid' });
    s.boil(() => s.polygon(shape, { stroke: 'none', fill: color, fillStyle: 'hachure', hachureGap: 4.5, fillWeight: 1.3, roughness: 1.3 }), 1.5);
    s.polygon(shape, { strokeWidth: 1.5 });

    s.circle(33, 28, 25, { fill: t.paper, fillStyle: 'solid', stroke: t.red, strokeWidth: 1.3 });
    s.text(String(i + 1).padStart(2, '0'), 33, 33.5, { font: 'title', size: 16, anchor: 'middle', fill: t.red });

    let size = 24;
    while (s.measure(sec.tab, 'title', size) > 76) size -= 1;
    const w = s.measure(sec.tab, 'title', size);
    const cx = 90;
    s.raw(`<rect x="${cx - w / 2 - 7}" y="15" width="${w + 14}" height="26" rx="6" fill="${t.paper}" opacity="0.9"/>`);
    s.text(sec.tab, cx, 35, { font: 'title', size, anchor: 'middle' });
  });
  s.line(0, 47, 150, 47, { stroke: t.pencil, strokeWidth: 1.2, roughness: 0.6 });
  return s;
}

export function button(t, l, i) {
  const s = new Sketch({ width: 200, height: 64, theme: t, seed: 80 + i });
  s.drawIn(0, 0.6, () => s.rect(6, 6, 188, 52, { fill: t.paper, fillStyle: 'solid', strokeWidth: 1.6 }));
  s.boil(() =>
    s.drawIn(0.3, 0.7, () =>
      s.rect(12, 12, 176, 40, { stroke: 'none', fill: l.color, fillStyle: 'hachure', hachureGap: 5, fillWeight: 1.4, roughness: 1.4 }),
    ), 1.4);
  const w = s.measure(l.label, 'title', 28);
  const x = (200 - w - 22) / 2;
  s.g({ cls: 'pop', d: 0.6, t: 0.5 }, () => {
    s.raw(`<rect x="${x - 8}" y="17" width="${w + 38}" height="30" rx="6" fill="${t.paper}" opacity="0.9"/>`);
    s.text(l.label, x, 41, { font: 'title', size: 28 });
  });
  s.loop('nudge', 1.6, 1.3, () => s.drawIn(0.9, 0.35, () => s.arrow([[x + w + 8, 40], [x + w + 21, 26]], { strokeWidth: 1.3, head: 6 })));
  return s;
}

// Paper plane drawn pointing +x, nose at the origin's right.
function plane(s) {
  s.polygon([[-16, -9], [22, 0], [-4, 3]], { fill: s.t.paper, fillStyle: 'solid', strokeWidth: 1.4 });
  s.polygon([[-4, 3], [22, 0], [-9, 12]], { fill: s.t.blue, fillStyle: 'hachure', hachureGap: 3, strokeWidth: 1.4 });
}

export function footer(t) {
  const s = new Sketch({ width: 900, height: 172, theme: t, seed: 90 });
  const flight = [[-40, 140], [40, 128], [100, 104], [150, 122], [200, 92], [260, 56], [340, 28], [450, 16], [560, 24], [660, 44], [750, 34], [840, 16], [950, 0]];

  s.write([0, 30, 280, 120], 0, 1.0, () =>
    s.raw(`<path d="${smoothPath(flight.slice(0, 6))}" fill="none" stroke="${t.pencil}" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="4 6"/>`),
  );
  s.writeText('Thanks for dropping by!', 450, 88, { font: 'title', size: 44, anchor: 'middle' }, 0.3, 1.4);
  s.writeText('— Akash', 640, 128, { font: 'script', size: 32, fill: t.pencil }, 1.8, 0.7);
  s.drawIn(2.5, 0.5, () => s.squiggle(640, 136, 82, { amp: 2, step: 10, o: { stroke: t.red, strokeWidth: 1.3 } }));
  s.g({ cls: 'fade', d: 2.8, t: 0.8 }, () =>
    s.text('drawn in code with rough.js, refreshed by GitHub Actions', 450, 164, { size: 12.5, anchor: 'middle', fill: t.pencil }),
  );

  // The plane flies the whole path, then waits off-canvas before the next lap.
  // Reduced-motion viewers get a parked plane at the end of the trail instead.
  s.raw(`<g class="fly"><animateMotion path="${smoothPath(flight)}" dur="9s" begin="0s" repeatCount="indefinite" rotate="auto" calcMode="linear" keyPoints="0;1;1" keyTimes="0;0.75;1"/>`);
  plane(s);
  s.raw('</g>');
  s.group('class="still" transform="translate(262 56) rotate(-30)"', () => plane(s));
  s.css.push('.still{display:none}');
  s.raw('<style>@media (prefers-reduced-motion:reduce){.fly{display:none}}</style>');
  return s;
}

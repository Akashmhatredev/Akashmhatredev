// Achievement medals, hanging from pins on the board.
import { Sketch } from '../lib/sketch.mjs';
import * as profile from '../profile.mjs';

const PIN_Y = 30;

function medallion(s, cx, cy, a, k) {
  const t = s.t;
  const drop = 0.4 + k * 0.18;
  const ribbon = k % 2 ? t.blue : t.red;
  const tail = { fill: ribbon, fillStyle: 'hachure', hachureGap: 3.2, fillWeight: 1.1, strokeWidth: 1.2 };

  s.g({ cls: 'drop', d: drop, t: 0.8 }, () =>
    // pivot is the top of this group's box: where the cord meets the pin
    s.loop('sway', 3.6 + (k % 2) * 0.5, -k * 0.7, () => {
      s.linear([[cx - 15, cy - 46], [cx, PIN_Y], [cx + 15, cy - 46]], { stroke: t.pencil, strokeWidth: 1.1, roughness: 0.6 });
      s.polygon([[cx - 26, cy + 26], [cx - 38, cy + 80], [cx - 24, cy + 70], [cx - 12, cy + 84], [cx - 4, cy + 36]], tail);
      s.polygon([[cx + 26, cy + 26], [cx + 38, cy + 80], [cx + 24, cy + 70], [cx + 12, cy + 84], [cx + 4, cy + 36]], tail);
      s.circle(cx, cy, 98, { fill: t.paper, fillStyle: 'solid', strokeWidth: 1.6 });
      s.circle(cx, cy, 80, { stroke: t.pencil, strokeWidth: 1, roughness: 1.4 });

      // a soft shine that sweeps across the face now and then; it rests
      // outside the clip, so the still drawing has no stripe
      const id = `shine${k}`;
      const glint = t.name === 'light' ? t.marker : '#FFFFFF';
      s.defs.push(`<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="47"/></clipPath>`);
      s.group(`clip-path="url(#${id})"`, () =>
        s.group(`transform="rotate(20 ${cx} ${cy})"`, () =>
          s.loop('shine', 5, 2.4 + k * 0.6, () =>
            s.raw(`<g fill="${glint}" opacity="${t.name === 'light' ? 0.55 : 0.28}"><rect x="${cx - 152}" y="${cy - 70}" width="14" height="140"/><rect x="${cx - 132}" y="${cy - 70}" width="5" height="140"/></g>`),
          ),
        ),
      );

      if (a.glyph === 'fin') {
        s.loop('swim', 3, -k * 0.4, () =>
          s.path(`M ${cx - 20} ${cy + 10} Q ${cx - 2} ${cy - 2} ${cx + 6} ${cy - 26} Q ${cx + 10} ${cy - 4} ${cx + 20} ${cy + 10} Z`, {
            fill: t.blue, fillStyle: 'hachure', hachureGap: 3, strokeWidth: 1.4,
          }),
        );
        s.loop('bob', 1.6, 0, () => s.squiggle(cx - 26, cy + 14, 52, { amp: 2, step: 8, o: { stroke: t.blue, strokeWidth: 1.3 } }));
      } else {
        let size = 40;
        while (s.measure(a.glyph, 'title', size) > 58) size -= 1;
        s.text(a.glyph, cx, cy + size * 0.32, { font: 'title', size, anchor: 'middle' });
      }
    }, '50% 0'),
  );
  s.g({ cls: 'pop', d: drop - 0.15, t: 0.4 }, () => {
    s.circle(cx, PIN_Y, 8, { fill: t.red, fillStyle: 'solid', stroke: t.ink, strokeWidth: 1 });
  });
  s.g({ cls: 'fade', d: drop + 0.6, t: 0.5 }, () => {
    s.text(a.title, cx, cy + 116, { font: 'title', size: 26, anchor: 'middle' });
    s.text(a.note, cx, cy + 136, { size: 12.5, anchor: 'middle', fill: t.pencil });
  });
}

export function achievements(t) {
  const s = new Sketch({ width: 900, height: 264, theme: t, seed: 60 });
  s.css.push(
    '@keyframes sway{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}',
    '@keyframes shine{0%,55%{transform:none}100%{transform:translateX(300px)}}',
  );
  s.paper();
  s.drawIn(0, 1, () => s.frame(20, 18, 860, 228, { overshoot: 10, o: { stroke: t.pencil, strokeWidth: 1.2 } }));
  profile.achievements.forEach((a, k) => medallion(s, 98 + k * 176, 96, a, k));
  return s;
}

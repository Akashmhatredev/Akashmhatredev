// The languages & tools board.
import { Sketch } from '../lib/sketch.mjs';
import * as profile from '../profile.mjs';

const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';

export async function fetchIcons() {
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

// Timeline: the frame draws on, then each row writes its label, pops its
// icons in left to right, and wipes in the separator below it. Afterwards a
// small hop ripples across the icons every 7 seconds.
export function toolbox(t, icons) {
  const rowH = 94;
  const top = 30;
  const H = top + profile.stack.length * rowH + 24;
  const s = new Sketch({ width: 900, height: H, theme: t, seed: 30 });
  s.paper();
  s.drawIn(0, 1.2, () => s.frame(20, 18, 860, H - 36, { overshoot: 10, o: { stroke: t.pencil, strokeWidth: 1.2 } }));

  profile.stack.forEach(({ group, items }, i) => {
    const y = top + i * rowH;
    const at = 0.3 + i * 0.35;
    const lw = s.measure(group, 'title', 30);
    s.writeText(group, 44, y + 52, { font: 'title', size: 30 }, at, 0.5);
    s.drawIn(at + 0.4, 0.4, () => s.squiggle(44, y + 62, lw, { amp: 1.6, step: 8, o: { stroke: t.red, strokeWidth: 1.3 } }));
    if (182 - (44 + lw + 10) > 14) {
      s.drawIn(at + 0.5, 0.4, () => s.arrow([[44 + lw + 10, y + 44], [182, y + 44]], { stroke: t.pencil, strokeWidth: 1.1, head: 7 }));
    }

    const colW = 84;
    items.forEach(([label, icon, mono], j) => {
      const cx = 196 + j * colW + colW / 2;
      const d = at + 0.3 + j * 0.07;
      s.g({ cls: 'pop', d, t: 0.5 }, () =>
        s.loop('wave', 7, 4 + i * 0.35 + j * 0.08, () => s.image(icons.get(icon), cx - 21, y + 14, 42, 42, { mono: mono === 'mono' })),
      );
      s.g({ cls: 'fade', d: d + 0.15, t: 0.4 }, () => s.text(label, cx, y + 76, { size: 12, anchor: 'middle', fill: t.pencil }));
    });
    if (i < profile.stack.length - 1) {
      s.write([40, y + rowH - 4, 820, 12], at + 0.6, 0.8, () =>
        s.draw(s.gen.line(44, y + rowH + 2, 856, y + rowH + 2, s.opts({ stroke: t.faint, strokeWidth: 1, roughness: 0.4 })), ' stroke-dasharray="4 8"'),
      );
    }
  });
  return s;
}

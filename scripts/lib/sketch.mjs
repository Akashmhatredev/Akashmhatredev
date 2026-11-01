// Tiny drawing kit for the "conceptual sketch" look: rough.js for pencil
// strokes, opentype.js to turn handwritten fonts into plain SVG paths (so the
// images render the same everywhere, with no web fonts to load).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';
import rough from 'roughjs';

const require = createRequire(import.meta.url);

function loadFont(file) {
  const buf = fs.readFileSync(require.resolve(file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

export const FONTS = {
  title: loadFont('@fontsource/caveat/files/caveat-latin-700-normal.woff'),
  script: loadFont('@fontsource/caveat/files/caveat-latin-400-normal.woff'),
  hand: loadFont('@fontsource/architects-daughter/files/architects-daughter-latin-400-normal.woff'),
};

// Light: graphite on cream paper. Dark: white pencil on charcoal paper.
export const THEMES = {
  light: {
    name: 'light',
    paper: '#FBF8F1',
    grid: '#EDE6D7',
    ink: '#2B2A28',
    pencil: '#6F6A62',
    faint: '#C9C1B2',
    marker: '#FFD84D',
    markerOpacity: 0.6,
    blue: '#2F5DA8',
    red: '#C8442F',
    green: '#2F8A57',
  },
  dark: {
    name: 'dark',
    paper: '#161B22',
    grid: '#212831',
    ink: '#ECE7DC',
    pencil: '#A2ABB6',
    faint: '#46505C',
    marker: '#D9A72E',
    markerOpacity: 0.42,
    blue: '#86AEF5',
    red: '#F08A76',
    green: '#6CCB8F',
  },
};

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (n) => Math.round(n * 10) / 10;

// Shared motion vocabulary. Everything sits behind prefers-reduced-motion,
// and the un-animated state is always the finished drawing.
const MOTION_CSS = `
.dr [pathLength]{stroke-dasharray:1 1;animation:draw var(--t,1s) cubic-bezier(.55,.1,.35,1) var(--d,0s) both}
.fade{animation:fade var(--t,.6s) ease var(--d,0s) both}
.pop{animation:pop var(--t,.55s) cubic-bezier(.3,1.6,.5,1) var(--d,0s) both}
.swipe{animation:swipe var(--t,.5s) cubic-bezier(.5,0,.3,1) var(--d,0s) both;transform-origin:0 50%}
.rise{animation:rise var(--t,.6s) ease-out var(--d,0s) both}
.drop{animation:drop var(--t,.7s) cubic-bezier(.3,1.4,.5,1) var(--d,0s) both}
.loop{animation:var(--a) var(--t,3s) ease-in-out var(--d,0s) infinite both}
.pop,.swipe,.loop,.drop{transform-box:fill-box}
.pop,.loop{transform-origin:50% 50%}
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes fade{from{opacity:0}}
@keyframes pop{from{opacity:0;transform:scale(.3)}}
@keyframes swipe{from{transform:scaleX(0)}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}}
@keyframes drop{from{opacity:0;transform:translateY(-24px) rotate(-6deg)}}
@keyframes bob{50%{transform:translateY(-4px)}}
@keyframes hop{0%,62%,100%{transform:none}72%{transform:translateY(-9px)}82%{transform:scale(1.1,.9)}90%{transform:none}}
@keyframes wave{0%,6%,100%{transform:none}3%{transform:translateY(-6px)}}
@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}75%{transform:rotate(9deg)}}
@keyframes swing{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes flag{0%,100%{transform:none}50%{transform:scaleX(.75) skewY(-8deg)}}
@keyframes blip{0%,100%{opacity:1}50%{opacity:.15}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes steam{0%{opacity:0;transform:translateY(5px)}40%{opacity:1}100%{opacity:0;transform:translateY(-12px)}}
@keyframes twinkle{0%,100%{opacity:.2;transform:scale(.5)}50%{opacity:1;transform:scale(1.1) rotate(45deg)}}
@keyframes throb{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.12) rotate(10deg)}}
@keyframes shake{0%,100%{transform:none}20%{transform:translate(-1.5px,1px) rotate(-4deg)}40%{transform:translate(1.5px,-1px) rotate(4deg)}60%{transform:translate(-1px,0)}}
@keyframes nudge{0%,100%{transform:none}50%{transform:translate(3px,-3px)}}
@keyframes flicker{0%,100%{transform:none}30%{transform:scale(.9,1.12) skewX(4deg)}60%{transform:scale(1.06,.94) skewX(-4deg)}}
@keyframes flash{0%,40%,52%,64%,100%{opacity:1}46%,58%{opacity:.2}}
@keyframes flip{0%,30%{transform:none}70%,100%{transform:scaleX(-1)}}
@keyframes pulse{0%,100%{transform:none}50%{transform:scale(1.18)}}
@keyframes sweep{0%,55%{transform:translateX(-130px)}100%{transform:translateX(130px)}}
@keyframes swim{0%,100%{transform:translateX(-7px)}50%{transform:translateX(7px)}}
`.replace(/\n/g, '');

// Smooth Catmull-Rom curve through points, for motion paths.
export function smoothPath(pts) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export class Sketch {
  constructor({ width, height, theme, seed = 1 }) {
    this.w = width;
    this.h = height;
    this.t = theme;
    this.gen = rough.generator();
    this.rand = mulberry32(seed * 9973);
    this.seed = seed * 1000;
    this.defs = [];
    this.glyphs = new Map();
    this.body = [];
    this.css = [];
    this.uid = 0;
    this.dashing = false;
  }

  opts(o = {}) {
    return {
      seed: ++this.seed,
      roughness: 1.1,
      bowing: 1,
      strokeWidth: 1.4,
      stroke: this.t.ink,
      fixedDecimalPlaceDigits: 1,
      ...o,
    };
  }

  draw(drawable, extra = '') {
    for (const p of this.gen.toPaths(drawable)) {
      const fill = p.fill && p.fill !== 'none' ? p.fill : 'none';
      const len = this.dashing && p.stroke !== 'none' ? ' pathLength="1"' : '';
      this.body.push(
        `<path d="${p.d}" fill="${fill}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${len}${extra}/>`,
      );
    }
    return this;
  }

  group(attrs, fn) {
    this.body.push(`<g ${attrs}>`);
    fn();
    this.body.push('</g>');
    return this;
  }

  // ------------------------------------------------------------ animation
  // CSS classes (see MOTION_CSS) driven by --d (delay), --t (duration) and,
  // for looping groups, --a (keyframes name).
  g({ cls, d, t, a, origin, attrs } = {}, fn) {
    const style = [
      d != null && `--d:${d}s`,
      t != null && `--t:${t}s`,
      a && `--a:${a}`,
      origin && `transform-origin:${origin}`,
    ].filter(Boolean).join(';');
    this.body.push(`<g${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''}${attrs ? ` ${attrs}` : ''}>`);
    fn();
    this.body.push('</g>');
    return this;
  }

  loop(a, t, d, fn, origin) {
    return this.g({ cls: 'loop', a, t, d, origin }, fn);
  }

  // Pencil strokes that draw themselves on.
  drawIn(d, t, fn) {
    const prev = this.dashing;
    this.g({ cls: 'dr', d, t }, () => {
      this.dashing = true;
      fn();
      this.dashing = prev;
    });
    return this;
  }

  // Left-to-right reveal, like ink going down. The clip is SMIL (so it also
  // plays in browsers that skip CSS animation inside clip paths), but it is
  // only attached through CSS, so reduced-motion viewers just see the text.
  write([x, y, w, h], d, t, fn) {
    const id = `c${++this.uid}`;
    const k = (d / (d + t)).toFixed(3);
    this.defs.push(
      `<clipPath id="${id}"><rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"><animate attributeName="width" values="0;0;${r1(w)}" keyTimes="0;${k};1" dur="${r1(d + t)}s" fill="freeze"/></rect></clipPath>`,
    );
    this.css.push(`.${id}{clip-path:url(#${id})}`);
    this.body.push(`<g class="${id}">`);
    fn();
    this.body.push('</g>');
    return this;
  }

  writeText(str, x, y, opts = {}, d = 0, t = 0.6) {
    const size = opts.size ?? 16;
    const w = this.measure(str, opts.font ?? 'hand', size);
    const x0 = opts.anchor === 'middle' ? x - w / 2 : opts.anchor === 'end' ? x - w : x;
    let out;
    this.write([x0 - 6, y - size * 1.15, w + 12, size * 1.6], d, t, () => (out = this.text(str, x, y, opts)));
    return out;
  }

  // "Line boil": the hand-drawn jitter of animated sketches.
  boil(fn, scale = 2) {
    const id = `boil${String(scale).replace('.', '')}`;
    if (!this.defs.some((def) => def.includes(`id="${id}"`))) {
      this.defs.push(
        `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1"><animate attributeName="seed" values="1;2;3;4" dur="0.5s" calcMode="discrete" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="${scale}"/></filter>`,
      );
    }
    if (!this.css.includes(`.${id}{filter:url(#${id})}`)) this.css.push(`.${id}{filter:url(#${id})}`);
    return this.group(`class="${id}"`, fn);
  }

  raw(svg) {
    this.body.push(svg);
    return this;
  }

  rect(x, y, w, h, o) { return this.draw(this.gen.rectangle(x, y, w, h, this.opts(o))); }
  line(x1, y1, x2, y2, o) { return this.draw(this.gen.line(x1, y1, x2, y2, this.opts(o))); }
  ellipse(cx, cy, w, h, o) { return this.draw(this.gen.ellipse(cx, cy, w, h, this.opts(o))); }
  circle(cx, cy, d, o) { return this.draw(this.gen.circle(cx, cy, d, this.opts(o))); }
  polygon(pts, o) { return this.draw(this.gen.polygon(pts, this.opts(o))); }
  linear(pts, o) { return this.draw(this.gen.linearPath(pts, this.opts(o))); }
  curve(pts, o) { return this.draw(this.gen.curve(pts, this.opts(o))); }
  arc(cx, cy, w, h, start, stop, o) { return this.draw(this.gen.arc(cx, cy, w, h, start, stop, false, this.opts(o))); }
  path(d, o) { return this.draw(this.gen.path(d, this.opts(o))); }

  // Text rendered as glyph outlines. Each glyph is defined once and reused,
  // which keeps text-heavy images small.
  text(str, x, y, { font = 'hand', size = 16, fill = this.t.ink, anchor = 'start', rotate = 0, opacity } = {}) {
    const f = FONTS[font];
    const em = f.unitsPerEm;
    const width = this.measure(str, font, size);
    const x0 = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
    const uses = [];
    f.forEachGlyph(str, 0, 0, em, { kerning: true }, (glyph, gx) => {
      if (glyph.index === 0) console.warn(`  ! missing glyph in ${font} font: "${str}"`);
      const d = glyph.getPath(0, 0, em).toPathData(0);
      if (!d) return;
      const id = `${font[0]}${glyph.index}`;
      if (!this.glyphs.has(id)) this.glyphs.set(id, d);
      uses.push(`<use href="#${id}" x="${Math.round(gx)}"/>`);
    });
    const rot = rotate ? ` rotate(${rotate})` : '';
    const op = opacity != null ? ` opacity="${opacity}"` : '';
    this.body.push(`<g fill="${fill}"${op} transform="translate(${r1(x0)} ${r1(y)})${rot} scale(${+(size / em).toFixed(5)})">${uses.join('')}</g>`);
    return { x: x0, width };
  }

  measure(str, font = 'hand', size = 16) {
    return FONTS[font].getAdvanceWidth(str, size);
  }

  wrap(str, maxWidth, { font = 'hand', size = 16 } = {}) {
    const lines = [];
    let line = '';
    for (const word of str.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && this.measure(next, font, size) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Cream paper (or charcoal in dark mode) with a faint drafting grid.
  paper({ grid = 24, x = 0, y = 0, w = this.w, h = this.h, radius = 10 } = {}) {
    const id = `grid${this.seed}`;
    this.defs.push(
      `<pattern id="${id}" width="${grid}" height="${grid}" patternUnits="userSpaceOnUse"><path d="M ${grid} 0 L 0 0 0 ${grid}" fill="none" stroke="${this.t.grid}" stroke-width="1"/></pattern>`,
    );
    this.body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${this.t.paper}"/>`);
    if (grid) this.body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="url(#${id})"/>`);
    return this;
  }

  // A sketchy frame with drafting lines running past the corners.
  frame(x, y, w, h, { overshoot = 14, o = {} } = {}) {
    const f = { stroke: this.t.faint, strokeWidth: 0.8, roughness: 0.6, bowing: 0.4 };
    this.line(x - overshoot, y, x + w + overshoot, y, f);
    this.line(x - overshoot, y + h, x + w + overshoot, y + h, f);
    this.line(x, y - overshoot, x, y + h + overshoot, f);
    this.line(x + w, y - overshoot, x + w, y + h + overshoot, f);
    return this.rect(x, y, w, h, { strokeWidth: 1.6, ...o });
  }

  // Highlighter swipe behind some text.
  highlight(x, y, w, h, { color = this.t.marker, opacity = this.t.markerOpacity, tilt = -0.6 } = {}) {
    const j = () => (this.rand() - 0.5) * 4;
    const d = `M ${r1(x + j())} ${r1(y + h * 0.15 + j())}
      Q ${r1(x + w / 2)} ${r1(y + j())} ${r1(x + w + j())} ${r1(y + h * 0.1 + j())}
      L ${r1(x + w + 3 + j())} ${r1(y + h * 0.9 + j())}
      Q ${r1(x + w / 2)} ${r1(y + h + j())} ${r1(x - 2 + j())} ${r1(y + h * 0.95 + j())} Z`.replace(/\s+/g, ' ');
    this.body.push(
      `<path d="${d}" fill="${color}" opacity="${opacity}" transform="rotate(${tilt} ${r1(x)} ${r1(y)})"/>`,
    );
    return this;
  }

  // Wavy underline, like a quick pencil scribble.
  squiggle(x, y, w, { amp = 2.5, step = 9, o = {} } = {}) {
    const pts = [];
    for (let i = 0, px = x; px <= x + w; i++, px += step) pts.push([px, y + (i % 2 ? amp : -amp)]);
    return this.curve(pts, { strokeWidth: 1.6, roughness: 0.8, ...o });
  }

  // Hand-drawn arrow along a curve; the head points at the last point.
  arrow(pts, o = {}) {
    this.curve(pts, { strokeWidth: 1.5, roughness: 0.9, ...o });
    const [x2, y2] = pts[pts.length - 1];
    const [x1, y1] = pts[pts.length - 2];
    const a = Math.atan2(y2 - y1, x2 - x1);
    const len = o.head ?? 10;
    const left = [x2 - len * Math.cos(a - 0.45), y2 - len * Math.sin(a - 0.45)];
    const right = [x2 - len * Math.cos(a + 0.45), y2 - len * Math.sin(a + 0.45)];
    this.linear([left, [x2, y2], right], { strokeWidth: 1.5, roughness: 0.6, ...o });
    return this;
  }

  // Embeds an icon (data URI). `mono` repaints it in the current ink colour.
  image(href, x, y, w, h, { mono = false } = {}) {
    let filter = '';
    if (mono) {
      if (!this.monoId) {
        this.monoId = 'mono';
        const [r, g, b] = [1, 3, 5].map((i) => (parseInt(this.t.ink.slice(i, i + 2), 16) / 255).toFixed(3));
        this.defs.push(
          `<filter id="mono" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0"/></filter>`,
        );
      }
      filter = ' filter="url(#mono)"';
    }
    this.body.push(`<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}"${filter}/>`);
    return this;
  }

  toString({ title, desc = '' }) {
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-labelledby="t d">`,
      `<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>`,
      `<style>@media (prefers-reduced-motion:no-preference){${MOTION_CSS}${this.css.join('')}}</style>`,
      `<defs>${this.defs.join('')}${[...this.glyphs].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('')}</defs>`,
      ...this.body,
      '</svg>',
    ].join('\n');
  }
}

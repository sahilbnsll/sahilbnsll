// Design tokens + SVG primitives shared by every generated visual in this repo.
// Palette mirrors sahilbansal.net (shadcn "neutral" tokens + Tailwind green status accent),
// so the README reads as the same identity system as the portfolio.

export const THEMES = {
  dark: {
    name: 'dark',
    canvas: '#0a0a0a',
    surface: '#111214',
    border: '#26282c',
    hairline: '#1b1d21',
    fg: '#f9fafb',
    body: '#c9ccd3',
    muted: '#858b99',
    faint: '#666c77',
    control: '#33363c',
    dots: '#202227',
    accent: '#22c55e',
    accentText: '#4ade80',
    accentWash: 'rgba(34,197,94,0.10)',
    // contribution intensity ramp (0 → max); shared with snake + 3D map
    ramp: ['#1c1f24', '#14532d', '#15803d', '#22c55e', '#4ade80'],
  },
  light: {
    name: 'light',
    canvas: '#ffffff',
    surface: '#f6f7f8',
    border: '#e4e6ea',
    hairline: '#eef0f2',
    fg: '#0a0a0a',
    body: '#3f444d',
    muted: '#6b7280',
    faint: '#868c97',
    control: '#d6d9de',
    dots: '#e6e8ec',
    accent: '#16a34a',
    accentText: '#15803d',
    accentWash: 'rgba(22,163,74,0.08)',
    ramp: ['#ebedf0', '#bbf7d0', '#4ade80', '#16a34a', '#166534'],
  },
};

// The terminal window is always dark — it reads as a real terminal on both themes.
export const TERMINAL = {
  bg: '#0c0d10',
  bar: '#121317',
  border: '#26282c',
  fg: '#e6e8ec',
  muted: '#7d8391',
  prompt: '#4ade80',
  ok: '#4ade80',
  light: '#2c2f36',
};

export const FONT = {
  sans: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`,
  mono: `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`,
  serif: `'Calistoga', Georgia, 'Times New Roman', serif`,
};

// Monospace advance ≈ 0.6em in SF Mono / Menlo / DejaVu / Liberation (Consolas ≈ 0.55em).
// Mono text is rendered with textLength so layout is identical on every OS.
export const MONO_ADVANCE = 0.6;

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const r1 = (n) => Math.round(n * 10) / 10;

export const monoWidth = (str, size, tracking = 0) =>
  [...String(str)].length * (size * MONO_ADVANCE + tracking);

// Helvetica-class advance widths (1/1000 em) — a conservative estimate for the system sans
// stack, used only for wrapping/fit checks, never for exact positioning.
const SANS_W = {
  ' ': 278, '!': 278, '"': 355, '#': 556, $: 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333,
  '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278, ':': 278, ';': 278, '<': 584, '=': 584,
  '>': 584, '?': 556, '@': 1015, '[': 278, ']': 278, _: 556, '|': 260, '~': 584, '·': 278, '—': 1000,
  '–': 556, '→': 1000, '×': 584, '’': 222,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833,
  N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833,
  n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
};
export const sansWidth = (str, size, { bold = false } = {}) => {
  let u = 0;
  for (const ch of String(str)) u += SANS_W[ch] ?? (/\d/.test(ch) ? 556 : 600);
  // Segoe UI / SF Pro run ~4-7% wider than Helvetica; bold adds ~6%.
  return (u / 1000) * size * 1.07 * (bold ? 1.06 : 1);
};

export const wrapSans = (text, size, maxWidth, maxLines = Infinity) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (sansWidth(next, size) <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    throw new Error(`Text needs ${lines.length} lines (max ${maxLines}): "${text}"`);
  }
  return lines;
};

// ---- element helpers -------------------------------------------------------

export const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => `${k}="${typeof v === 'number' ? r1(v) : esc(v)}"`)
    .join(' ');

export const text = (x, y, str, o = {}) => {
  const {
    size = 14, fill, family = 'sans', weight, anchor, tracking, cls, opacity, mono = family === 'mono',
    fit = mono, // lock mono runs to their nominal width
  } = o;
  const tl = fit && mono ? monoWidth(str, size, tracking ?? 0) - (tracking ?? 0) : undefined;
  return `<text ${attrs({
    x, y,
    class: cls,
    fill,
    'font-family': FONT[family] ? undefined : family,
    'font-size': size,
    'font-weight': weight,
    'text-anchor': anchor,
    'letter-spacing': tracking,
    opacity,
    textLength: tl,
    lengthAdjust: tl ? 'spacing' : undefined,
    style: FONT[family] ? `font-family:${FONT[family]}` : undefined,
  })}>${esc(str)}</text>`;
};

export const rect = (x, y, w, h, o = {}) =>
  `<rect ${attrs({ x, y, width: w, height: h, rx: o.rx, fill: o.fill ?? 'none', stroke: o.stroke, 'stroke-width': o.sw, class: o.cls, opacity: o.opacity })}/>`;

// Crisp 1px card outline (half-pixel inset).
export const card = (w, h, t, rx = 14) =>
  rect(0.5, 0.5, w - 1, h - 1, { rx, fill: t.canvas, stroke: t.border, sw: 1 });

// Arrow glyph drawn as a path so it renders identically everywhere (↗).
export const arrowNE = (x, y, s, stroke, sw = 1.5) =>
  `<path d="M${r1(x)} ${r1(y + s)} L${r1(x + s)} ${r1(y)} M${r1(x + s * 0.3)} ${r1(y)} L${r1(x + s)} ${r1(y)} L${r1(x + s)} ${r1(y + s * 0.7)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;

// Shared motion rules: every animation is decorative, starts from a fully-rendered
// base state (static renderers show the final frame) and is disabled for reduced motion.
export const MOTION_CSS = `
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;

// "Live" status dot: a ring that pings outward from a solid dot (the portfolio's animate-ping).
export const PING_CSS = `
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.4s cubic-bezier(0,0,.2,1) infinite}
@keyframes ping{0%{transform:scale(1);opacity:.6}75%,100%{transform:scale(2.6);opacity:0}}`;

// Single-file theming for visuals that must be wrapped in a link. GitHub hoists the <img>
// out of a linked <picture> (breaking both the link and the dark variant), so these SVGs
// are rendered with light tokens and switch themselves: attribute selectors retarget each
// light token to its dark value. Inside an <img>, Chromium resolves prefers-color-scheme
// from the embedding page's color-scheme (= GitHub's theme setting); engines that use the
// OS preference instead can mismatch, so these components always paint a solid background.
const DARK_OF = (() => {
  const map = new Map();
  for (const [k, lv] of Object.entries(THEMES.light)) {
    if (typeof lv !== 'string' || k === 'name') continue;
    const dv = THEMES.dark[k];
    if (map.has(lv) && map.get(lv) !== dv) throw new Error(`theme token collision on ${lv}`);
    map.set(lv, dv);
  }
  return map;
})();

export const selfThemed = (svg) => {
  const rules = [];
  const seen = new Set();
  for (const [, prop, v] of svg.matchAll(/\s(fill|stroke)="([^"]+)"/g)) {
    const key = `${prop}|${v}`;
    if (seen.has(key) || !DARK_OF.has(v) || DARK_OF.get(v) === v) continue;
    seen.add(key);
    rules.push(`[${prop}="${v}"]{${prop}:${DARK_OF.get(v)}}`);
  }
  return svg.replace('</style>', `@media (prefers-color-scheme: dark){${rules.join('')}}</style>`);
};

export const svgDoc = ({ w, h, title, desc, defs = '', css = '', body }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d" fill="none">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs>${defs}<style>${css.trim()}${MOTION_CSS}</style></defs>
${body}
</svg>
`;

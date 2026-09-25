#!/usr/bin/env node
// Renders the static README visuals (hero, nav pills, impact tiles, project + education cards)
// into assets/ — one light and one dark file per component. Logos in assets/logos are plain PNGs.
// Zero dependencies:  node scripts/build-static.mjs
// Copy lives in scripts/content.mjs; tokens + primitives in scripts/lib/design.mjs.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  THEMES, TERMINAL, FONT, esc, r1, text, rect, card, arrowNE, svgDoc,
  monoWidth, sansWidth, wrapSans, selfThemed, PING_CSS,
} from './lib/design.mjs';
import { HERO, LINKS, IMPACT, PROJECTS, EDUCATION } from './content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');
const b64 = (p) => readFileSync(join(ROOT, p)).toString('base64');

const written = [];
const emit = (rel, svg) => {
  const path = join(OUT, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, svg);
  written.push([rel, Buffer.byteLength(svg)]);
};

const fits = (label, w, max) => {
  if (w > max) throw new Error(`${label} overflows: ${Math.round(w)}px > ${max}px`);
};

// Calistoga (SIL OFL 1.1) — the portfolio's display serif, embedded so the
// hero renders in-brand without any network request.
const CALISTOGA = `@font-face{font-family:'Calistoga';font-style:normal;font-weight:400;src:url(data:font/woff2;base64,${b64('scripts/fonts/Calistoga-Regular-latin.woff2')}) format('woff2');}`;

// ─── Hero ──────────────────────────────────────────────────────────────────────
function hero(t) {
  const W = 880, H = 268;
  const tx = 508, ty = 42, tw = 332, th = 184; // terminal window
  const lx = 526; // terminal text x
  const cmd = 'terraform plan';
  const fs = 12.5, adv = fs * 0.6;
  const cmdX = lx + 2 * adv;
  const cmdW = cmd.length * adv;
  const typeStart = 0.6, perChar = 0.07;
  const typeEnd = typeStart + cmd.length * perChar;

  // status pill + stack chips, left column
  const pillY = 150, pillH = 28;
  const statusW = monoWidth(HERO.status, 12) + 40;
  let cx = 48;
  const chips = HERO.stack.map((s) => {
    const w = monoWidth(s, 11) + 18;
    const out = `${rect(cx + 0.5, 194.5, w, 23, { rx: 6, fill: t.surface, stroke: t.border })}${text(cx + 9.5, 210, s, { size: 11, fill: t.body, family: 'mono' })}`;
    cx += w + 6;
    return out;
  });
  fits('hero chips', cx - 6, 470);

  const css = `
${CALISTOGA}
${PING_CSS}
.typer{animation:type ${r1(typeEnd - typeStart)}s steps(${cmd.length}) ${typeStart}s both}
@keyframes type{from{transform:translateX(-${r1(cmdW)}px)}to{transform:translateX(0)}}
.l2{animation:reveal .35s ease-out ${r1(typeEnd + 0.35)}s both}
.l3{animation:reveal .35s ease-out ${r1(typeEnd + 0.95)}s both}
.l4{animation:reveal .2s ease-out ${r1(typeEnd + 1.35)}s both}
@keyframes reveal{from{opacity:0}to{opacity:1}}
.cursor{animation:blink 1.1s steps(1) ${r1(typeEnd + 1.35)}s infinite}
@keyframes blink{50%{opacity:0}}
/* Rendered narrower than 600px (phones): drop terminal + chips, enlarge the identity block. */
@media (max-width: 600px){.term,.chips{display:none}.left{transform:translate(48px,-74px) scale(1.8)}}`;

  const defs = `
<pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="${t.dots}"/></pattern>
<linearGradient id="fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0.25" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
<mask id="dotmask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
<clipPath id="cardclip"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15"/></clipPath>
${t.name === 'light' ? `<filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0a0a0a" flood-opacity="0.14"/></filter>` : ''}`;

  const body = `
${card(W, H, t, 16)}
<g clip-path="url(#cardclip)"><rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#dotmask)"/></g>

<g class="left">
<text x="46" y="104" fill="${t.fg}" font-size="54" style="font-family:${FONT.serif}">${esc(HERO.greeting.replace(/\.$/, ''))}<tspan fill="${t.accent}">.</tspan></text>
${text(48, 136, HERO.role, { size: 18, fill: t.body })}

${rect(48.5, pillY + 0.5, statusW, pillH, { rx: 14, fill: t.accentWash, stroke: t.border })}
<circle class="ping" cx="64" cy="${pillY + pillH / 2}" r="4" fill="${t.accent}"/>
<circle cx="64" cy="${pillY + pillH / 2}" r="4" fill="${t.accent}"/>
${text(77, pillY + 18.5, HERO.status, { size: 12, fill: t.fg, family: 'mono' })}
<g class="chips">${chips.join('\n')}</g>
</g>

<g class="term">
<g ${t.name === 'light' ? 'filter="url(#shadow)"' : ''}>
  ${rect(tx + 0.5, ty + 0.5, tw, th, { rx: 11, fill: TERMINAL.bg, stroke: TERMINAL.border })}
</g>
<path d="M${tx + 1} ${ty + 30}h${tw - 1}" stroke="${TERMINAL.border}"/>
<circle cx="${tx + 18}" cy="${ty + 15.5}" r="4.5" fill="${TERMINAL.light}"/>
<circle cx="${tx + 33}" cy="${ty + 15.5}" r="4.5" fill="${TERMINAL.light}"/>
<circle cx="${tx + 48}" cy="${ty + 15.5}" r="4.5" fill="${TERMINAL.light}"/>
${text(tx + tw / 2 + 12, ty + 19.5, '~/infra — zsh', { size: 11, fill: TERMINAL.muted, family: 'mono', anchor: 'middle' })}

${text(lx, ty + 58, '$', { size: fs, fill: TERMINAL.prompt, family: 'mono' })}
${text(cmdX, ty + 58, cmd, { size: fs, fill: TERMINAL.fg, family: 'mono' })}
<rect class="typer" x="${r1(cmdX + cmdW)}" y="${ty + 44}" width="${r1(cmdW + 2)}" height="19" fill="${TERMINAL.bg}"/>
<g class="l2">${text(lx, ty + 80, 'module.platform: Refreshing state...', { size: fs, fill: TERMINAL.muted, family: 'mono' })}</g>
<g class="l3">
  <text x="${lx}" y="${ty + 110}" font-size="${fs}" textLength="${r1('No changes. Your infrastructure matches'.length * adv)}" lengthAdjust="spacing" style="font-family:${FONT.mono}"><tspan fill="${TERMINAL.ok}" font-weight="700">No changes.</tspan><tspan fill="${TERMINAL.fg}"> Your infrastructure matches</tspan></text>
  ${text(lx, ty + 130, 'the configuration.', { size: fs, fill: TERMINAL.fg, family: 'mono' })}
</g>
<g class="l4">
  ${text(lx, ty + 160, '$', { size: fs, fill: TERMINAL.prompt, family: 'mono' })}
  <rect class="cursor" x="${r1(cmdX)}" y="${ty + 150}" width="7.5" height="14" rx="1" fill="${TERMINAL.fg}"/>
</g>
</g>`;

  return svgDoc({
    w: W, h: H,
    title: `${HERO.greeting} — ${HERO.role}`,
    desc: `${HERO.status}. Current stack: ${HERO.stack.join(', ')}. A terminal runs "terraform plan" and reports no changes: the infrastructure matches the configuration.`,
    defs, css, body,
  });
}

// ─── Nav pills ─────────────────────────────────────────────────────────────────
function pill(link, t) {
  const size = 12.5, H = 34;
  const lw = monoWidth(link.label, size);
  const W = Math.ceil(16 + lw + 9 + 8 + 15);
  const fg = link.primary ? t.canvas : t.fg;
  const body = `
${rect(0.5, 0.5, W - 1, H - 1, { rx: 17, fill: link.primary ? t.fg : t.canvas, stroke: link.primary ? t.fg : t.control })}
${text(16, 21.5, link.label, { size, fill: fg, family: 'mono', weight: link.primary ? 600 : undefined })}
${arrowNE(16 + lw + 9, 13, 8, link.primary ? t.canvas : t.muted, 1.4)}`;
  return selfThemed(svgDoc({ w: W, h: H, title: link.label, desc: `Link: ${link.label}`, body }));
}

// ─── Impact tiles ──────────────────────────────────────────────────────────────
function tile(m, t) {
  const W = 150, H = 104, inner = W - 32;
  m.caption.forEach((c) => fits(`tile caption "${c}"`, sansWidth(c, 11), inner));
  fits(`tile value ${m.value}`, sansWidth(m.value, 27, { bold: true }), inner);
  const body = `
${card(W, H, t, 12)}
<circle cx="19" cy="23" r="2.5" fill="${t.accent}"/>
${text(27, 27, m.eyebrow, { size: 10, fill: t.muted, family: 'mono', tracking: 1.1 })}
${text(15, 61, m.value, { size: 27, fill: t.fg, weight: 700, tracking: -0.5 })}
${text(16, 80, m.caption[0], { size: 11, fill: t.body })}
${text(16, 94, m.caption[1], { size: 11, fill: t.muted })}`;
  return svgDoc({ w: W, h: H, title: `${m.value} — ${m.eyebrow.toLowerCase()}`, desc: `${m.value}: ${m.caption.join(' ')}`, body });
}

// ─── Feature cards (projects, education) ───────────────────────────────────────
function featureCard(p, t) {
  const W = 404, H = 196, pad = 22, inner = W - pad * 2;
  const lines = wrapSans(p.summary, 13, inner, 3);
  let x = pad;
  const tags = p.tags.map((s) => {
    const w = monoWidth(s, 10.5) + 16;
    const out = `${rect(x + 0.5, 163.5, w, 20, { rx: 5, fill: t.surface, stroke: t.hairline })}${text(x + 8.5, 177, s, { size: 10.5, fill: t.body, family: 'mono' })}`;
    x += w + 6;
    return out;
  });
  fits(`${p.id} tags`, x - 6, W - pad);
  fits(`${p.id} metric`, 32 + monoWidth(p.metric, 11.5), W - pad);
  fits(`${p.id} title`, pad + sansWidth(p.name, 19, { bold: true }), W - 48);

  const body = `
${card(W, H, t, 14)}
${text(pad, 33, p.eyebrow, { size: 10.5, fill: t.muted, family: 'mono', tracking: 1.1 })}
${arrowNE(W - 32, 23, 9, t.muted, 1.5)}
${text(pad, 63, p.name, { size: 19, fill: t.fg, weight: 700, tracking: -0.2 })}
${lines.map((l, i) => text(pad, 89 + i * 18.5, l, { size: 13, fill: t.body })).join('\n')}
${rect(pad, 136, 3, 14, { rx: 1.5, fill: t.accent })}
${text(pad + 11, 147.5, p.metric, { size: 11.5, fill: t.accentText, family: 'mono' })}
${tags.join('\n')}`;
  return selfThemed(svgDoc({ w: W, h: H, title: p.name, desc: `${p.summary} ${p.metric}. ${p.tags.join(', ')}.`, body }));
}

// ─── Emit ──────────────────────────────────────────────────────────────────────
// Unlinked visuals: light/dark pair, switched by GitHub's <picture> handling.
for (const t of Object.values(THEMES)) {
  emit(`hero-${t.name}.svg`, hero(t));
  for (const m of IMPACT) emit(`impact/${m.id}-${t.name}.svg`, tile(m, t));
}
// Linked visuals: one self-themed file each (GitHub breaks a <picture> wrapped in a link).
for (const l of LINKS) emit(`nav/${l.id}.svg`, pill(l, THEMES.light));
for (const p of PROJECTS) emit(`projects/${p.id}.svg`, featureCard(p, THEMES.light));
for (const e of EDUCATION) emit(`education/${e.id}.svg`, featureCard(e, THEMES.light));

const total = written.reduce((s, [, b]) => s + b, 0);
for (const [rel, bytes] of written) console.log(`  ${rel.padEnd(34)} ${(bytes / 1024).toFixed(1).padStart(6)} KB`);
console.log(`✓ ${written.length} files, ${(total / 1024).toFixed(1)} KB → assets/`);

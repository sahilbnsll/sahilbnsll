#!/usr/bin/env node
// Live GitHub cards for the profile README, rendered in-repo instead of via third-party
// card services (github-readme-stats / activity-graph public instances went down in 2026).
//
//   node scripts/build-stats.mjs [--user sahilbnsll] [--out dist]
//
// Data: GitHub GraphQL when METRICS_TOKEN / GITHUB_TOKEN is set (counts private work);
// without a token, or if GraphQL fails, public REST + the public contribution calendar,
// which is cross-checked against GitHub's own yearly total before anything is published.
// Writes github-activity-{dark,light}.svg and github-stats-{dark,light}.svg.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { THEMES, PING_CSS, r1, text, rect, card, svgDoc, sansWidth, monoWidth } from './lib/design.mjs';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const LOGIN = arg('user', process.env.GITHUB_REPOSITORY_OWNER || 'sahilbnsll');
const OUT = resolve(arg('out', 'dist'));
const TOKEN = process.env.METRICS_TOKEN || process.env.GITHUB_TOKEN || '';
const UA = { 'User-Agent': `${LOGIN}-profile-readme` };
const DAY = 86_400_000;
const WINDOW = 364; // 52 whole weeks — every stat on both cards covers the same window
const TODAY = new Date().toISOString().slice(0, 10);
const SINCE = new Date(Date.parse(TODAY) - (WINDOW - 1) * DAY).toISOString().slice(0, 10);

// ─── Data ──────────────────────────────────────────────────────────────────────
async function viaGraphQL() {
  // One day of slack (span stays under GraphQL's 1-year cap) so the window survives the
  // calendar ending on a different local date than UTC; derive() keeps the last WINDOW days.
  const to = new Date();
  const from = new Date(Date.parse(SINCE) - DAY);
  const query = `query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      pullRequests { totalCount }
      repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        contributionCalendar { weeks { contributionDays { date contributionCount } } }
      }
    }
  }`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...UA, Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: LOGIN, from: from.toISOString(), to: to.toISOString() } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors || !json.data?.user) {
    throw new Error(`GraphQL ${res.status}: ${JSON.stringify(json.errors ?? json.message ?? json).slice(0, 300)}`);
  }
  const u = json.data.user;
  const cc = u.contributionsCollection;
  return {
    source: 'graphql',
    days: cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))),
    commits: cc.totalCommitContributions,
    prs: u.pullRequests.totalCount,
    repos: u.repositories.totalCount,
  };
}

async function viaPublic() {
  const rest = async (path, auth = !!TOKEN) => {
    const res = await fetch(`https://api.github.com/${path}`, {
      headers: { ...UA, Accept: 'application/vnd.github+json', ...(auth ? { Authorization: `Bearer ${TOKEN}` } : {}) },
    });
    if (res.status === 401 && auth) return rest(path, false); // expired token: public data still works
    if (!res.ok) throw new Error(`REST ${path} → ${res.status}`);
    return res.json();
  };
  const page = await fetch(`https://github.com/users/${LOGIN}/contributions`, { headers: UA });
  if (!page.ok) throw new Error(`contribution calendar → ${page.status}`);
  const html = await page.text();
  const byId = new Map();
  for (const m of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"\s+id="([^"]+)"\s+data-level="(\d)"/g)) {
    byId.set(m[2], { date: m[1], level: Number(m[3]), count: 0 });
  }
  for (const m of html.matchAll(/for="([^"]+)"[^>]*>\s*(\d[\d,]*|No) contributions?/g)) {
    const d = byId.get(m[1]);
    if (d) d.count = m[2] === 'No' ? 0 : Number(m[2].replace(/,/g, ''));
  }
  const days = [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
  // The scrape must agree with GitHub's own numbers, or a markup change could publish zeros.
  const headline = html.match(/([\d,]+)\s+contributions?\s+in the last year/);
  const parsed = days.reduce((n, d) => n + d.count, 0);
  if (!headline) throw new Error('calendar headline not found — markup changed?');
  if (Number(headline[1].replace(/,/g, '')) !== parsed) throw new Error(`calendar parse mismatch: ${parsed} vs "${headline[0]}"`);
  if (days.some((d) => (d.level > 0) !== (d.count > 0))) throw new Error('calendar levels disagree with parsed counts');
  const [user, commits, prs] = await Promise.all([
    rest(`users/${LOGIN}`),
    rest(`search/commits?q=author:${LOGIN}+author-date:>=${SINCE}&per_page=1`),
    rest(`search/issues?q=type:pr+author:${LOGIN}&per_page=1`),
  ]);
  return { source: 'public', days, commits: commits.total_count, prs: prs.total_count, repos: user.public_repos };
}

function derive(raw) {
  // Anchor on the calendar's own last day (GitHub may end it on a local date ≠ UTC today).
  const days = raw.days.slice(-WINDOW);
  const span = days.length && (Date.parse(days.at(-1).date) - Date.parse(days[0].date)) / DAY + 1;
  if (days.length !== WINDOW || span !== WINDOW) {
    throw new Error(`expected ${WINDOW} contiguous calendar days, got ${days.length} spanning ${span} — refusing to publish`);
  }
  const sum = (a) => a.reduce((s, d) => s + d.count, 0);
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push({ start: days[i].date, count: sum(days.slice(i, i + 7)) });
  return {
    ...raw,
    days,
    weeks,
    total: sum(days),
    last30: sum(days.slice(-30)),
    active: days.filter((d) => d.count > 0).length,
    longest,
    updated: TODAY,
  };
}

// ─── Cards ─────────────────────────────────────────────────────────────────────
const W = 404, H = 196, PAD = 22;
const fmt = (n) => n.toLocaleString('en-US');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pretty = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

const eyebrow = (label, t, live = false) => `
${live ? `<circle class="ping" cx="${PAD + 3}" cy="29" r="3" fill="${t.accent}"/>` : ''}
<circle cx="${PAD + 3}" cy="29" r="3" fill="${t.accent}"/>
${text(PAD + 13, 33, label, { size: 10.5, fill: t.muted, family: 'mono', tracking: 1.1 })}`;

function activityCard(s, t) {
  const chartX = PAD, chartW = W - PAD * 2, base = 158, chartH = 56;
  const n = s.weeks.length;
  const step = chartW / n, bw = Math.max(2, step - 2);
  const max = Math.max(1, ...s.weeks.map((w) => w.count));
  const peak = s.weeks.reduce((best, w, i) => (w.count > s.weeks[best].count ? i : best), 0);
  const recentFrom = n - Math.ceil(30 / 7); // weeks overlapping the last 30 days

  const bars = s.weeks.map((w, i) => {
    const x = chartX + i * step + (step - bw) / 2;
    if (!w.count) return rect(r1(x), base - 2, r1(bw), 2, { rx: 1, fill: t.ramp[0] });
    const h = Math.max(3, (w.count / max) * chartH);
    return rect(r1(x), r1(base - h), r1(bw), r1(h), { rx: 1.5, fill: i >= recentFrom ? t.accent : t.ramp[2] });
  });

  // Label every other month, counted back from the current one so "now" is always labelled.
  const starts = [];
  s.weeks.forEach((w, i) => {
    const m = Number(w.start.slice(5, 7)) - 1;
    if (i > 0 && m !== Number(s.weeks[i - 1].start.slice(5, 7)) - 1) starts.push([i, m]);
  });
  const months = starts
    .filter((_, k) => (starts.length - 1 - k) % 2 === 0)
    .map(([i, m]) => text(chartX + i * step, 178, MONTHS[m], { size: 9.5, fill: t.faint, family: 'mono' }));

  const peakX = chartX + peak * step + step / 2;
  const peakY = base - (s.weeks[peak].count / max) * chartH - 6;
  const numW = sansWidth(fmt(s.last30), 30, { bold: true });

  const body = `
${card(W, H, t, 14)}
${eyebrow('ACTIVITY · 52 WEEKS', t, true)}
${text(W - PAD, 33, `updated ${pretty(s.updated)}`, { size: 10, fill: t.faint, family: 'mono', anchor: 'end' })}
${text(PAD - 1, 82, fmt(s.last30), { size: 30, fill: t.fg, weight: 700, tracking: -0.6 })}
${text(PAD + numW + 10, 69, 'contributions in the', { size: 10.5, fill: t.body, family: 'mono' })}
${text(PAD + numW + 10, 83, 'last 30 days', { size: 10.5, fill: t.muted, family: 'mono' })}
${s.weeks[peak].count ? text(Math.min(Math.max(peakX, PAD + 10), W - PAD - 10), r1(Math.max(peakY, 98)), `peak ${s.weeks[peak].count}/wk`, { size: 9.5, fill: t.muted, family: 'mono', anchor: peakX > W - 90 ? 'end' : peakX < 90 ? 'start' : 'middle' }) : ''}
${bars.join('')}
<path d="M${PAD} ${base + 0.5}H${W - PAD}" stroke="${t.hairline}"/>
${months.join('')}`;

  return svgDoc({
    w: W, h: H,
    title: `${fmt(s.last30)} contributions in the last 30 days`,
    desc: `Weekly GitHub contributions for @${LOGIN} over the last 52 weeks (${fmt(s.total)} total). Busiest week: ${s.weeks[peak].count}. Updated ${s.updated}.`,
    css: PING_CSS, body,
  });
}

function statsCard(s, t) {
  const cells = [
    { v: fmt(s.total), l: 'contributions' },
    { v: fmt(s.commits), l: 'commits' },
    { v: fmt(s.active), l: 'active days' },
    { v: fmt(s.longest), unit: s.longest === 1 ? 'day' : 'days', l: 'longest streak' },
    { v: fmt(s.prs), l: 'PRs · all-time' },
    { v: fmt(s.repos), l: 'public repos' },
  ];
  const colW = (W - PAD * 2) / 3;
  const grid = cells.map((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = PAD + col * colW + (col ? 14 : 0);
    const y = 90 + row * 66;
    const vw = sansWidth(c.v, 26, { bold: true });
    return `
${text(x - 1, y, c.v, { size: 26, fill: t.fg, weight: 700, tracking: -0.5 })}${c.unit ? text(x + vw + 3, y, c.unit, { size: 12, fill: t.muted }) : ''}
${text(x, y + 18, c.l, { size: 10.5, fill: t.muted, family: 'mono' })}`;
  });
  cells.forEach((c) => {
    if (monoWidth(c.l, 10.5) > colW - 16) throw new Error(`stat label overflows: ${c.l}`);
  });

  const body = `
${card(W, H, t, 14)}
${eyebrow('GITHUB · LAST 12 MONTHS', t)}
${text(W - PAD, 33, s.source === 'graphql' ? 'incl. private work' : 'public profile data', { size: 10, fill: t.faint, family: 'mono', anchor: 'end' })}
<path d="M${PAD} 122.5H${W - PAD}" stroke="${t.hairline}"/>
<path d="M${r1(PAD + colW) + 0.5} 58V182M${r1(PAD + colW * 2) + 0.5} 58V182" stroke="${t.hairline}"/>
${grid.join('')}`;

  return svgDoc({
    w: W, h: H,
    title: `GitHub stats for @${LOGIN}`,
    desc: `Last 12 months: ${fmt(s.total)} contributions, ${fmt(s.commits)} commits, ${fmt(s.active)} active days, longest streak ${s.longest} days. All-time pull requests: ${fmt(s.prs)}. Public repositories: ${fmt(s.repos)}.`,
    css: '', body,
  });
}

// ─── Main ──────────────────────────────────────────────────────────────────────
let raw;
if (TOKEN) {
  try {
    raw = await viaGraphQL();
  } catch (e) {
    console.warn(`! GraphQL failed, falling back to public data: ${e.message}`);
  }
}
raw ??= await viaPublic();
const stats = derive(raw);

mkdirSync(OUT, { recursive: true });
for (const t of Object.values(THEMES)) {
  writeFileSync(join(OUT, `github-activity-${t.name}.svg`), activityCard(stats, t));
  writeFileSync(join(OUT, `github-stats-${t.name}.svg`), statsCard(stats, t));
}
console.log(
  `✓ ${LOGIN} via ${stats.source}: ${stats.total} contributions / 12 mo, ${stats.last30} in 30 d, ` +
    `${stats.commits} commits, ${stats.active} active days, longest streak ${stats.longest}, ${stats.prs} PRs, ${stats.repos} repos → ${OUT}`,
);

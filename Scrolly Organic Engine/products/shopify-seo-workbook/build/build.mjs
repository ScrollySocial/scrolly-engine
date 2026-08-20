#!/usr/bin/env node
// Transforms workbook-draft.md into a fully styled production HTML file.
// Mechanical transform only: markdown syntax -> HTML syntax, plus wrapping
// recognized block patterns in the locked V2 component markup. No wording
// is added, removed, or altered.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it/dist/index.cjs.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(here, '..', 'workbook-draft.md');
const outPath = path.join(here, 'workbook-print.html');

const md = new MarkdownIt({ html: true, breaks: false, typographer: true });
const inline = (s) => md.renderInline(s.trim());
const block = (s) => md.render(s);

const raw = readFileSync(srcPath, 'utf-8').replace(/\r\n/g, '\n');
const lines = raw.split('\n');

// ---------- helpers ----------
const esc = (s) => s;
const CALLOUT_MAP = [
  [/^DO THIS NOW:?/i, { cls: 'callout filled', label: 'Do This Now' }],
  [/^DON'?T DO THIS:?/i, { cls: 'callout red', label: "Don't Do This" }],
  [/^WATCH OUT:?/i, { cls: 'callout pink', label: 'Watch Out' }],
  [/^AVOID SCARE LANGUAGE:?/i, { cls: 'callout red', label: 'Avoid Scare Language' }],
  [/^MYTH TO IGNORE:?/i, { cls: 'callout amber', label: 'Myth to Ignore' }],
  [/^IMPORTANT PRODUCT BOUNDARY:?/i, { cls: 'callout indigo', label: 'Important Product Boundary' }],
  [/^ETHICAL WARNING:?/i, { cls: 'callout red', label: 'Ethical Warning' }],
  [/^IMPORTANT[—-]/i, { cls: 'callout indigo', label: 'Important' }],
  [/^IMPORTANT:?/i, { cls: 'callout indigo', label: 'Important' }],
  [/^SEARCH CONSOLE IS NOT A PERFECT RANK TRACKER\.?/i, { cls: 'callout amber', label: 'Good to Know' }],
  [/^THE 90-DAY PLAN IS THE START OF A CYCLE/i, { cls: 'callout mint', label: 'Keep in Mind' }],
  [/^A HONEST CAVEAT:?/i, { cls: 'callout amber', label: 'A Caveat' }],
  [/^QUICK WIN:?/i, { cls: 'callout cyan', label: 'Quick Win' }],
  [/^AVOID DAILY SEO OBSESSION\.?/i, { cls: 'callout amber', label: 'Good to Know' }],
  [/^DON'?T TOUCH THIS UNLESS/i, { cls: 'callout amber', label: 'Leave This Alone' }],
  [/^NOT GUARANTEED/i, { cls: 'callout amber', label: 'Not Guaranteed' }],
  [/^UI FRESHNESS/i, { cls: 'callout amber', label: 'Good to Know' }],
];

function classifyCallout(text) {
  for (const [re, meta] of CALLOUT_MAP) if (re.test(text)) return meta;
  return { cls: 'callout indigo', label: 'Note' };
}

// strip a leading '> ' or bare '>' from a line
function stripQuote(l) {
  if (l === '>') return '';
  if (l.startsWith('> ')) return l.slice(2);
  if (l.startsWith('>')) return l.slice(1);
  return l;
}

// render a run of blockquote-body lines (already de-quoted) into HTML,
// handling: bold-only group headers, checkbox items, numbered fill lines,
// field-label lines, tables, and plain paragraphs.
function renderBlockBody(bodyLines) {
  let html = '';
  let i = 0;
  let inTriage = false;
  let tableBuf = [];
  const flushTable = () => {
    if (tableBuf.length) { html += block(tableBuf.join('\n')); tableBuf = []; }
  };
  let paraBuf = [];
  const flushPara = () => {
    if (paraBuf.length) {
      const joined = paraBuf.join(' ').trim();
      if (joined) html += `<p>${inline(joined)}</p>`;
      paraBuf = [];
    }
  };
  while (i < bodyLines.length) {
    const l = bodyLines[i];
    const trimmed = l.trim();
    if (trimmed === '') { flushPara(); flushTable(); i++; continue; }
    if (/^\|.*\|$/.test(trimmed)) { flushPara(); tableBuf.push(l); i++; continue; }
    flushTable();
    // fenced code block
    if (trimmed.startsWith('```')) {
      flushPara();
      let codeLines = []; i++;
      while (i < bodyLines.length && !bodyLines[i].trim().startsWith('```')) { codeLines.push(bodyLines[i]); i++; }
      i++; // skip closing fence
      html += `<pre style="background:var(--bg-alt);border:1px solid var(--line);border-radius:8px;padding:12px 16px;font-family:ui-monospace,Consolas,monospace;font-size:8.6pt;line-height:1.5;white-space:pre-wrap;color:var(--ink);overflow-x:auto;">${codeLines.map(c=>c.replace(/&/g,'&amp;').replace(/</g,'&lt;')).join('\n')}</pre>`;
      continue;
    }
    // numbered question/field with trailing blank: "1. Question text? ____"
    const numBlankMatch = trimmed.match(/^(\d+)\.\s*(.+?)\s*_{5,}\s*$/);
    if (numBlankMatch) { flushPara(); html += `<div class="field-label">${numBlankMatch[1]}. ${inline(numBlankMatch[2])}</div><div class="field-blank"></div>`; i++; continue; }
    // bold-only group header, e.g. **Setup** -- with special triage-color detection
    const groupMatch = trimmed.match(/^\*\*([^*]+)\*\*$/);
    if (groupMatch) {
      flushPara();
      const gt = groupMatch[1];
      const triageColor = /^🔴/.test(gt) ? 'red' : /^🟡/.test(gt) ? 'amber' : /^🟢/.test(gt) ? 'mint' : null;
      if (triageColor) {
        if (inTriage) html += `</div>`;
        html += `<div class="triage-group"><div class="triage-head" style="color:var(--${triageColor});"><span class="dot-lg" style="background:var(--${triageColor});"></span>${inline(gt)}</div>`;
        inTriage = true;
      } else {
        if (inTriage) { html += `</div>`; inTriage = false; }
        html += `<div class="ws-group">${inline(gt)}</div>`;
      }
      i++; continue;
    }
    // checkbox item
    const chkMatch = trimmed.match(/^-\s*\[\s*\]\s*(.+)$/);
    if (chkMatch) {
      flushPara();
      html += inTriage
        ? `<div class="triage-row"><span class="chk"></span><span>${inline(chkMatch[1])}</span></div>`
        : `<div class="ws-item"><span class="chk"></span><span>${inline(chkMatch[1])}</span></div>`;
      i++; continue;
    }
    // plain bullet field line, e.g. "- Average Order Value (AOV): $________"
    const bulletMatch = trimmed.match(/^-\s+(.+)$/);
    if (bulletMatch) {
      flushPara();
      const t2 = bulletMatch[1];
      const hasBlank = /_{3,}/.test(t2);
      if (hasBlank) {
        const label = t2.split(/_{3,}/)[0].trim();
        html += `<div class="field-label">${inline(label)}</div><div class="field-blank"></div>`;
      } else {
        html += `<div class="ws-item"><span style="color:var(--indigo);">&bull;</span><span>${inline(t2)}</span></div>`;
      }
      i++; continue;
    }
    // numbered fill-in line: "1. ______"
    const fillMatch = trimmed.match(/^(\d+)\.\s*_{5,}\s*$/);
    if (fillMatch) { flushPara(); html += `<div class="fill-line"><span class="n">${fillMatch[1]}.</span><span class="rule"></span></div>`; i++; continue; }
    // round header: "**Round 1 — Title** (parenthetical)"
    const roundMatch = trimmed.match(/^\*\*(Round[^*]+)\*\*\s*(\(.*\))?$/);
    if (roundMatch) { flushPara(); html += `<div class="round-h">${inline(roundMatch[1])}${roundMatch[2] ? ` <span class="sub">${inline(roundMatch[2])}</span>` : ''}</div>`; i++; continue; }
    // field label with inline blank: "**Label:** ___...___" or "**Label:** value"
    const fieldMatch = trimmed.match(/^\*\*([^*]+):\*\*\s*(_{5,})?\s*(.*)$/);
    if (fieldMatch && fieldMatch[2]) { flushPara(); html += `<div class="field-label">${inline(fieldMatch[1])}:</div><div class="field-blank"></div>`; i++; continue; }
    // otherwise accumulate into paragraph
    paraBuf.push(trimmed);
    i++;
  }
  flushPara(); flushTable();
  if (inTriage) html += `</div>`;
  return html;
}

// ---------- diagram generation ----------
function svgWrap(inner, viewBox, ariaLabel, extraStyle = '') {
  return `<figure class="diagram" style="${extraStyle}"><svg viewBox="${viewBox}" role="img" aria-label="${ariaLabel.replace(/"/g, '&quot;')}">${inner}</svg></figure>`;
}
const ARROW_DEFS = `<defs><marker id="arrM" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#9aa0bd"/></marker></defs>`;

function nodeChain(labels, opts = {}) {
  // simple horizontal chain of rounded-rect nodes with arrows, wraps to rows
  const w = opts.width || 700, nodeH = 42, gap = 14, pad = 4;
  const rows = [];
  let row = [], rowW = pad;
  const charW = 6.6, padX = 22;
  labels.forEach((lab) => {
    const nw = Math.max(90, lab.length * charW + padX);
    if (rowW + nw > w - pad && row.length) { rows.push(row); row = []; rowW = pad; }
    row.push({ lab, nw });
    rowW += nw + gap;
  });
  if (row.length) rows.push(row);
  let y = 6, svg = '';
  rows.forEach((r) => {
    let x = 6;
    r.forEach((n, idx) => {
      svg += `<rect x="${x}" y="${y}" width="${n.nw}" height="${nodeH}" rx="10" class="node-box"/>`;
      svg += `<text x="${x + n.nw / 2}" y="${y + nodeH / 2 + 4}" text-anchor="middle" font-family="Inter" font-size="12" fill="#10152b">${n.lab}</text>`;
      if (idx < r.length - 1) {
        svg += `<line x1="${x + n.nw}" y1="${y + nodeH / 2}" x2="${x + n.nw + gap}" y2="${y + nodeH / 2}" stroke="#9aa0bd" stroke-width="1.6" marker-end="url(#arrM)"/>`;
      }
      x += n.nw + gap;
    });
    y += nodeH + 26;
  });
  const totalH = y - 8;
  return { svg: ARROW_DEFS + svg, h: totalH, w };
}

function discoveryHubDiagram() {
  const channels = ['Google Search','Google Shopping','YouTube','TikTok','Instagram','Pinterest','AI Assistants','Reddit/Forums'];
  const cx = 350, cy = 210, r = 90;
  let svg = ARROW_DEFS;
  svg += `<circle cx="${cx}" cy="${cy}" r="52" fill="#4f46e5"/><text x="${cx}" y="${cy-4}" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="13" fill="#fff">Your</text><text x="${cx}" y="${cy+14}" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="13" fill="#fff">Store</text>`;
  channels.forEach((ch, idx) => {
    const ang = (idx / channels.length) * Math.PI * 2 - Math.PI / 2;
    const nx = cx + Math.cos(ang) * r, ny = cy + Math.sin(ang) * r;
    svg += `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="#c7cbe6" stroke-width="1.4"/>`;
    const nw = Math.max(70, ch.length * 6.2 + 18);
    svg += `<rect x="${nx-nw/2}" y="${ny-15}" width="${nw}" height="30" rx="15" fill="#eef1fa" stroke="#e1e5f2"/>`;
    svg += `<text x="${nx}" y="${ny+4}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="10.5" fill="#10152b">${ch}</text>`;
  });
  return svgWrap(svg, `0 0 700 420`, 'Your Store at the center, with eight discovery channels radiating outward: Google Search, Google Shopping, YouTube, TikTok, Instagram, Pinterest, AI Assistants, and Reddit/Forums.');
}

function paidVsOrganicDiagram() {
  // Deliberately conceptual, not a measured/quantitative chart -- no axes,
  // no implied traffic numbers. Two contrasting cards: rented+fast vs owned+durable.
  const w = 700, h = 300;
  const col = (x, color, bg, tag, title, points) => {
    let s = `<rect x="${x}" y="10" width="320" height="280" rx="16" fill="${bg}" stroke="${color}" stroke-width="1.5"/>`;
    s += `<rect x="${x+24}" y="30" width="140" height="24" rx="12" fill="${color}"/><text x="${x+94}" y="46" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="10.5" fill="#fff">${tag}</text>`;
    s += `<text x="${x+24}" y="82" font-family="Manrope" font-weight="800" font-size="16" fill="${color}">${title}</text>`;
    points.forEach((p, i) => {
      const y = 112 + i * 34;
      s += `<circle cx="${x+30}" cy="${y-4}" r="3" fill="${color}"/>`;
      s += `<text x="${x+42}" y="${y}" font-family="Inter" font-size="11" fill="#10152b">${wrapSvgText(p, 40, x+42).replace(/text-anchor="middle"/g,'')}</text>`;
    });
    return s;
  };
  let svg = col(10, '#db2777', '#fde7f2', 'FAST · RENTED', 'Paid Traffic', [
    'Can generate traffic quickly once it’s live',
    'Traffic generally tracks your spend',
    'Tends to fall off when spend stops',
    'Good for speed, testing, and scaling',
  ]);
  svg += col(370, '#0d9488', '#dff5f1', 'SLOWER · OWNED', 'Organic Traffic', [
    'Usually builds more slowly, with ongoing work',
    'Pages can keep earning traffic after the work',
    'Not guaranteed to keep climbing forever',
    'Can plateau, dip, or need maintenance too',
  ]);
  svg += `<circle cx="350" cy="150" r="20" fill="#fff" stroke="#e1e5f2" stroke-width="1.4"/><text x="350" y="155" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="11" fill="#9aa0bd">vs</text>`;
  return svgWrap(svg, `0 0 ${w} ${h}`, "A conceptual comparison, not a measured chart: paid traffic is fast but rented — it tracks spend and tends to fall off when spend stops. Organic traffic is slower and owned — it can keep earning after the work is done, but it isn't a guaranteed, endless climb either.");
}

function beforeAfterProductDiagram() {
  const mini = (x, label, weak) => {
    const g = weak
      ? `<rect x="${x}" y="30" width="240" height="18" rx="4" fill="#e1e5f2"/><text x="${x+10}" y="43" font-family="Inter" font-size="10" fill="#9aa0bd">Cedar</text>
         <rect x="${x}" y="58" width="240" height="120" rx="8" fill="#f5f7fc" stroke="#e1e5f2"/><text x="${x+120}" y="122" text-anchor="middle" font-family="Inter" font-size="9.5" fill="#9aa0bd">IMG_4021.jpg</text>
         <rect x="${x}" y="188" width="240" height="10" rx="3" fill="#e1e5f2"/><rect x="${x}" y="202" width="180" height="10" rx="3" fill="#e1e5f2"/>`
      : `<rect x="${x}" y="30" width="240" height="18" rx="4" fill="#edeafe"/><text x="${x+10}" y="43" font-family="Manrope" font-weight="700" font-size="10" fill="#3c34b5">8oz Soy Candle — Sandalwood</text>
         <rect x="${x}" y="58" width="240" height="120" rx="8" fill="#eef1fa" stroke="#e1e5f2"/><circle cx="${x+120}" cy="118" r="30" fill="#f4c98a" opacity=".6"/>
         <rect x="${x}" y="188" width="240" height="10" rx="3" fill="#c7d2fe"/><rect x="${x}" y="202" width="180" height="10" rx="3" fill="#c7d2fe"/>`;
    return `<text x="${x+120}" y="14" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="11" fill="${weak?'#dc2626':'#0d9488'}">${label}</text>${g}`;
  };
  let svg = mini(10, 'WEAK', true) + mini(300, 'CLEAR', false);
  svg += `<text x="285" y="120" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#9aa0bd">&rarr;</text>`;
  return svgWrap(svg, `0 0 560 225`, 'Side-by-side comparison: a weak product page with a generic title, no alt text, and a blank description, versus a clear version with a descriptive title, real image, and specific copy.');
}

function topicalClusterDiagram(fillable) {
  const center = { x: 300, y: 190, w: 190, h: 44 };
  const nodes = [
    { x: 40, y: 30, label: 'What Makes a Candle Non-Toxic?', job: 'Educate' },
    { x: 260, y: 20, label: 'How Long Do Soy Candles Burn?', job: 'Answer an Objection' },
    { x: 470, y: 30, label: 'Best Candles for Bedrooms', job: 'Help Choose' },
    { x: 260, y: 320, label: 'Are Fragrance Oils Safe in Candles?', job: 'Educate' },
  ];
  let svg = ARROW_DEFS;
  svg += `<rect x="${center.x-center.w/2}" y="${center.y-center.h/2}" width="${center.w}" height="${center.h}" rx="12" fill="${fillable?'#f5f7fc':'#4f46e5'}" stroke="${fillable?'#9aa0bd':'#4f46e5'}" stroke-dasharray="${fillable?'5 5':'0'}"/>`;
  svg += `<text x="${center.x}" y="${center.y+5}" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="12" fill="${fillable?'#5c6478':'#fff'}">${fillable?'Your Commercial Page':'Non-Toxic Candles Collection'}</text>`;
  nodes.forEach((n, idx) => {
    const nw = 190, nh = 46;
    svg += `<line x1="${n.x+nw/2}" y1="${n.y+(n.y<center.y?nh:0)}" x2="${center.x}" y2="${center.y}" stroke="#c7cbe6" stroke-width="1.4"/>`;
    svg += `<rect x="${n.x}" y="${n.y}" width="${nw}" height="${nh}" rx="10" fill="#fff" stroke="#e1e5f2" stroke-width="1.3"/>`;
    svg += `<text x="${n.x+nw/2}" y="${n.y+19}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="9.5" fill="#10152b">${wrapSvgText(fillable ? 'Supporting article ' + (idx+1) : n.label, 26, n.x+nw/2)}</text>`;
    svg += `<text x="${n.x+nw/2}" y="${n.y+nh-8}" text-anchor="middle" font-family="Inter" font-size="8.5" fill="#7c3aed">${fillable ? 'job: ______' : n.job}</text>`;
  });
  if (!fillable) svg += `<line x1="135" y1="53" x2="355" y2="43" stroke="#9aa0bd" stroke-width="1.3" stroke-dasharray="3 3"/>`;
  const cap = fillable
    ? 'A blank template: your commercial page at the center, with room to sketch 3–4 supporting articles and the job each one does.'
    : 'The Non-Toxic Candles collection at the center, with four supporting articles feeding into it, one connected sideways to a related article.';
  return svgWrap(svg, `0 0 700 400`, cap);
}

function platformComparisonDiagram() {
  const lanes = [
    { name: 'TikTok', color: '#10152b', what: 'Quick "is this worth it" discovery' },
    { name: 'Instagram', color: '#db2777', what: 'Visual/lifestyle inspiration' },
    { name: 'YouTube', color: '#dc2626', what: 'Longer how-to & comparison' },
    { name: 'Pinterest', color: '#c2410c', what: 'Gift ideas, save-for-later planning' },
  ];
  const laneW = 165, gap = 14;
  let svg = '';
  lanes.forEach((l, idx) => {
    const x = idx * (laneW + gap) + 5;
    svg += `<rect x="${x}" y="10" width="${laneW}" height="40" rx="10" fill="${l.color}"/><text x="${x+laneW/2}" y="35" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="13" fill="#fff">${l.name}</text>`;
    svg += `<rect x="${x}" y="60" width="${laneW}" height="130" rx="10" fill="#f5f7fc" stroke="#e1e5f2"/>`;
    svg += `<text x="${x+laneW/2}" y="130" text-anchor="middle" font-family="Inter" font-size="10" fill="#5c6478">${wrapSvgText(l.what, 20, x+laneW/2)}</text>`;
  });
  return svgWrap(svg, `0 0 720 200`, 'Four parallel lanes — TikTok, Instagram, YouTube, Pinterest — each with its own discovery role, shown side by side rather than as one unified system.');
}

function aiCitationsDiagram() {
  let svg = `<rect x="60" y="10" width="440" height="90" rx="20" fill="#f2ecfe" stroke="#7c3aed" stroke-width="1.4"/>`;
  svg += `<text x="80" y="38" font-family="Inter" font-size="11" fill="#10152b">"A few well-reviewed non-toxic candle brands</text>`;
  svg += `<text x="80" y="56" font-family="Inter" font-size="11" fill="#10152b">include..." — synthesized from a small,</text>`;
  svg += `<text x="80" y="74" font-family="Inter" font-size="11" fill="#10152b">chosen set of sources, not a ranked list.</text>`;
  const sources = ['Review site', 'Retailer listing', "Brand's own page"];
  sources.forEach((s, idx) => {
    const x = 60 + idx * 155;
    svg += `<line x1="${x+70}" y1="100" x2="${x+70}" y2="120" stroke="#c7b6f5" stroke-width="1.4"/>`;
    svg += `<rect x="${x}" y="120" width="140" height="34" rx="8" fill="#fff" stroke="#e1e5f2"/><text x="${x+70}" y="141" text-anchor="middle" font-family="Inter" font-weight="600" font-size="9.5" fill="#5c6478">${s}</text>`;
  });
  return svgWrap(svg, `0 0 560 170`, "A stylized AI-assistant answer bubble synthesized from a small set of sources — a review site, a retailer listing, and a brand's own page — rather than a single ranked list.");
}

function roadmapTimelineDiagram() {
  const phases = [
    { name: 'Foundation', weeks: 'Weeks 1–4', color: '#4f46e5', bg: '#edeafe' },
    { name: 'Optimization', weeks: 'Weeks 5–8', color: '#0891b2', bg: '#e1f6fb' },
    { name: 'Growth', weeks: 'Weeks 9–12', color: '#0d9488', bg: '#dff5f1' },
  ];
  const bw = 220, gap = 20;
  let svg = ARROW_DEFS;
  phases.forEach((p, idx) => {
    const x = idx * (bw + gap) + 5;
    svg += `<rect x="${x}" y="20" width="${bw}" height="90" rx="14" fill="${p.bg}" stroke="${p.color}" stroke-width="1.5"/>`;
    svg += `<text x="${x+bw/2}" y="55" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="15" fill="${p.color}">${p.name}</text>`;
    svg += `<text x="${x+bw/2}" y="78" text-anchor="middle" font-family="Inter" font-size="10.5" fill="#5c6478">${p.weeks}</text>`;
    if (idx < phases.length - 1) svg += `<line x1="${x+bw+4}" y1="65" x2="${x+bw+gap-4}" y2="65" stroke="#9aa0bd" stroke-width="1.8" marker-end="url(#arrM)"/>`;
  });
  return svgWrap(svg, `0 0 720 120`, 'Three connected phases — Foundation (weeks 1–4), Optimization (weeks 5–8), Growth (weeks 9–12) — the 90-day plan at a glance.');
}

function genericDiagram(desc) {
  // Heuristic: extract quoted / arrow-separated node labels from the bracket description.
  const arrowSplit = desc.split(/→|->/).map(s=>s.trim()).filter(Boolean);
  let labels = [];
  if (arrowSplit.length >= 3) {
    labels = arrowSplit.slice(0, 6).map(s => s.replace(/^["'“]|["'”]$/g, '').split(/[.(]/)[0].trim().slice(0, 34));
  }
  if (labels.length) {
    const { svg, h, w } = nodeChain(labels);
    return svgWrap(svg, `0 0 ${w} ${h}`, desc.slice(0, 180));
  }
  // no reliable chain extractable — honest reserved-diagram placeholder, not a fake illustration
  const title = desc.split(/[—-]/)[0].replace(/^["'“]|["'”]$/g, '').trim().slice(0, 70);
  return `<div class="shot-frame no-break"><div class="shot-placeholder" style="min-height:1.6in;"><div class="sp-inner"><div class="sp-label">Diagram Reserved &mdash; ${md.renderInline(title)}</div><div class="sp-desc">${md.renderInline(desc.slice(0, 260))}</div></div></div></div>`;
}

// ---------- recreated UI-style screenshot mockups (clearly illustrative, never presented as live captures) ----------
function shotShell(chromeLabel, innerSvg, viewBox, caption, ariaLabel) {
  return `<div class="shot-frame no-break">
    <div class="chrome-bar"><span class="chrome-dot"></span><span class="chrome-dot"></span><span class="chrome-dot"></span><span class="chrome-url">${chromeLabel}</span></div>
    <svg viewBox="${viewBox}" width="100%" role="img" aria-label="${ariaLabel.replace(/"/g,'&quot;')}">${innerSvg}</svg>
    <div class="shot-caption"><strong>What you're looking for:</strong> ${md.renderInline(caption)}</div>
  </div>`;
}
function hi(x,y,w,h){ return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="#4f46e5" stroke-width="2.2"/>`; }
function badge(x,y,n){ return `<circle cx="${x}" cy="${y}" r="11" fill="#4f46e5"/><text x="${x}" y="${y+4}" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="11" fill="#fff">${n}</text>`; }

const SHOT_BUILDERS = [
  [/Google Keyword Planner.*Expert Mode/i, () => shotShell('ads.google.com/aw/keywordplanner', `
    <rect width="730" height="180" fill="#fff"/>
    <text x="30" y="34" font-family="Manrope" font-weight="800" font-size="15" fill="#10152b">Discover new keywords</text>
    <rect x="30" y="50" width="130" height="30" rx="6" fill="#f5f7fc" stroke="#e1e5f2"/><text x="95" y="70" text-anchor="middle" font-family="Inter" font-size="10.5" fill="#5c6478">Smart Mode</text>
    ${hi(168,48,140,34)}
    <rect x="170" y="50" width="130" height="30" rx="6" fill="#edeafe" stroke="#4f46e5"/><text x="235" y="70" text-anchor="middle" font-family="Inter" font-weight="700" font-size="10.5" fill="#4f46e5">Expert Mode</text>
    <text x="30" y="112" font-family="Inter" font-size="11" fill="#5c6478">Create a campaign to get started</text>
    ${hi(28,120,290,32)}
    <rect x="30" y="122" width="290" height="28" rx="6" fill="#f5f7fc" stroke="#e1e5f2"/><text x="46" y="141" font-family="Inter" font-size="10.5" fill="#10152b">Create a campaign without goal guidance</text>
    ${badge(345,136,1)}
  `, '0 0 730 180', 'the Expert Mode toggle and the "create a campaign without goal guidance" option — this path never asks for billing details.', 'Recreated illustration of Google Keyword Planner Expert Mode flow, not a live screenshot.')],

  [/Google Trends, an interest-over-time graph/i, () => shotShell('trends.google.com/trends/explore', `
    <rect width="730" height="420" fill="#fff"/>
    <text x="36" y="42" font-family="Manrope" font-weight="800" font-size="16" fill="#10152b">fall candles</text>
    <text x="36" y="64" font-family="Inter" font-size="12" fill="#5c6478">United States &middot; Past 12 months &middot; Web Search</text>
    <line x1="60" y1="90" x2="60" y2="330" stroke="#e1e5f2"/>
    <line x1="60" y1="330" x2="690" y2="330" stroke="#9aa0bd" stroke-width="1.3"/>
    <text x="50" y="94" text-anchor="end" font-family="Inter" font-size="10" fill="#9aa0bd">100</text>
    <line x1="60" y1="90" x2="690" y2="90" stroke="#eef1fa"/>
    <text x="50" y="214" text-anchor="end" font-family="Inter" font-size="10" fill="#9aa0bd">50</text>
    <line x1="60" y1="210" x2="690" y2="210" stroke="#eef1fa"/>
    <text x="50" y="334" text-anchor="end" font-family="Inter" font-size="10" fill="#9aa0bd">0</text>
    <path d="M60,318 C160,315 260,312 320,308 C370,120 410,95 445,108 C480,130 540,312 690,314" fill="none" stroke="#4f46e5" stroke-width="3"/>
    <circle cx="410" cy="97" r="5" fill="#4f46e5"/>
    ${hi(340,80,140,150)}
    <text x="410" y="66" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="12.5" fill="#4f46e5">seasonal peak</text>
    <g font-family="Inter" font-size="10" fill="#9aa0bd">
      <text x="60" y="352">Jan</text><text x="160" y="352">Mar</text><text x="260" y="352">May</text>
      <text x="360" y="352">Jul</text><text x="460" y="352">Sep</text><text x="560" y="352">Nov</text><text x="670" y="352">Dec</text>
    </g>
    <text x="60" y="386" font-family="Inter" font-size="11.5" fill="#5c6478">Interest climbs steadily from August, peaks in early October, then drops off after the holidays.</text>
  `, '0 0 730 420', 'the clear seasonal peak — plan seasonal content ahead of a peak like this, not during it.', 'Recreated illustration of a Google Trends interest-over-time graph showing a seasonal peak, with month labels and a 0–100 interest scale.')],

  [/Products → Collections → Add collection.*source.*dropdown/i, () => shotShell('admin.shopify.com/store/your-store/collections/new', `
    <rect width="730" height="190" fill="#fff"/>
    <text x="30" y="32" font-family="Manrope" font-weight="800" font-size="14" fill="#10152b">New collection</text>
    <text x="30" y="62" font-family="Inter" font-size="10.5" fill="#5c6478">Collection type</text>
    ${hi(28,68,290,34)}
    <rect x="30" y="70" width="130" height="30" rx="6" fill="#edeafe" stroke="#4f46e5"/><text x="95" y="90" text-anchor="middle" font-family="Inter" font-weight="700" font-size="10.5" fill="#4f46e5">Products</text>
    <rect x="168" y="70" width="150" height="30" rx="6" fill="#f5f7fc" stroke="#e1e5f2"/><text x="243" y="90" text-anchor="middle" font-family="Inter" font-size="10.5" fill="#10152b">Collection</text>
    ${badge(345,85,1)}
    <text x="30" y="128" font-family="Inter" font-size="10.5" fill="#5c6478">Source</text>
    <rect x="30" y="136" width="300" height="30" rx="6" fill="#f5f7fc" stroke="#e1e5f2"/><text x="46" y="156" font-family="Inter" font-size="10.5" fill="#10152b">Connect a collection...</text>
  `, '0 0 730 190', 'the source-type dropdown (Products vs. Collection) — this is exactly where native nested collections live.', 'Recreated illustration of the Shopify Add Collection screen with the source-type dropdown set to Collection.')],

  [/a collection.*Search engine listing preview.*URL handle/i, () => shotShell('admin.shopify.com/store/your-store/collections', `
    <rect width="730" height="150" fill="#fff"/>
    <text x="30" y="30" font-family="Manrope" font-weight="800" font-size="13" fill="#10152b">Search engine listing preview</text>
    <rect x="30" y="42" width="500" height="60" rx="8" fill="#f5f7fc" stroke="#e1e5f2"/>
    <text x="44" y="62" font-family="Inter" font-size="10" fill="#2563eb">yourstore.com &rsaquo; collections &rsaquo; <tspan fill="#10152b">non-toxic-candles</tspan></text>
    ${hi(40,68,220,26)}
    <text x="46" y="86" font-family="Inter" font-size="10.5" fill="#5c6478">Edit URL handle</text>
  `, '0 0 730 150', 'the URL handle field — this is where you shorten the auto-generated collection URL.', 'Recreated illustration of a Shopify collection\'s Search Engine Listing preview showing the editable URL handle.')],

  [/a product page scrolled to.*Search engine listing preview.*Edit website SEO/i, () => shotShell('admin.shopify.com/store/your-store/products', `
    <rect width="730" height="200" fill="#fff"/>
    <text x="30" y="30" font-family="Manrope" font-weight="800" font-size="13" fill="#10152b">Edit website SEO</text>
    <text x="30" y="58" font-family="Inter" font-size="10" fill="#5c6478">Page title</text>
    <rect x="30" y="64" width="500" height="26" rx="5" fill="#f5f7fc" stroke="#e1e5f2"/><text x="40" y="81" font-family="Inter" font-size="10" fill="#10152b">8oz Soy Candle – Sandalwood, Amber Jar</text>
    ${hi(28,62,504,30)}
    <text x="540" y="81" font-family="Inter" font-size="9" fill="#0d9488">48/70</text>
    <text x="30" y="112" font-family="Inter" font-size="10" fill="#5c6478">Description</text>
    <rect x="30" y="118" width="500" height="40" rx="5" fill="#f5f7fc" stroke="#e1e5f2"/>
    <text x="30" y="176" font-family="Inter" font-size="10" fill="#5c6478">URL handle</text>
    <rect x="30" y="182" width="500" height="26" rx="5" fill="#f5f7fc" stroke="#e1e5f2"/>
  `, '0 0 730 220', 'the character counter under the title field — this whole panel controls only how the page appears in search, separate from the page content itself.', 'Recreated illustration of the Shopify product Edit website SEO panel showing title, description, and URL handle fields.')],

  [/product media section, one image opened with its alt text field/i, () => shotShell('admin.shopify.com/store/your-store/products', `
    <rect width="730" height="180" fill="#fff"/>
    <rect x="30" y="20" width="140" height="140" rx="8" fill="#eef1fa" stroke="#e1e5f2"/><circle cx="100" cy="90" r="26" fill="#f4c98a" opacity=".6"/>
    <text x="190" y="40" font-family="Inter" font-size="10.5" fill="#5c6478">Alt text</text>
    ${hi(188,48,420,30)}
    <rect x="190" y="50" width="420" height="26" rx="5" fill="#f5f7fc" stroke="#e1e5f2"/>
    <text x="200" y="67" font-family="Inter" font-size="10" fill="#10152b">8oz amber jar candle with sandalwood label, lit, on a wood shelf</text>
  `, '0 0 730 180', 'the alt text field — it\'s edited per image, not once for the whole product.', 'Recreated illustration of a Shopify product image with its alt text field open and filled in.')],

  [/Sales channels panel with.*Google & YouTube.*being added/i, () => shotShell('admin.shopify.com/store/your-store/settings/channels', `
    <rect width="730" height="170" fill="#fff"/>
    <text x="30" y="32" font-family="Manrope" font-weight="800" font-size="13" fill="#10152b">Sales channels</text>
    ${badge(48,60,1)}
    <circle cx="48" cy="60" r="14" fill="none" stroke="#4f46e5" stroke-width="2"/><text x="48" y="65" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="14" fill="#4f46e5">+</text>
    <rect x="70" y="46" width="320" height="30" rx="15" fill="#f5f7fc" stroke="#e1e5f2"/><text x="86" y="66" font-family="Inter" font-size="10.5" fill="#5c6478">Search sales channels...</text>
    ${hi(68,90,220,34)}
    <rect x="70" y="92" width="220" height="30" rx="6" fill="#edeafe" stroke="#4f46e5"/><text x="90" y="112" font-family="Inter" font-weight="700" font-size="10.5" fill="#4f46e5">Google &amp; YouTube</text>
  `, '0 0 730 170', 'the + icon and channel search — this is the entire connection point, no app-store purchase required.', 'Recreated illustration of the Shopify Sales Channels screen with Google & YouTube being added.')],

  [/Google Merchant Center, Products → Needs attention/i, () => shotShell('merchants.google.com/mc/items/diagnostics', `
    <rect width="730" height="190" fill="#fff"/>
    <text x="30" y="32" font-family="Manrope" font-weight="800" font-size="13" fill="#10152b">Products</text>
    ${hi(28,44,220,28)}
    <rect x="30" y="46" width="220" height="24" rx="12" fill="#edeafe"/><text x="140" y="63" text-anchor="middle" font-family="Inter" font-weight="700" font-size="10" fill="#4f46e5">Needs attention</text>
    <rect x="260" y="46" width="150" height="24" rx="12" fill="#f5f7fc"/><text x="335" y="63" text-anchor="middle" font-family="Inter" font-size="10" fill="#5c6478">Diagnostics (retired)</text>
    <line x1="30" y1="86" x2="700" y2="86" stroke="#e1e5f2"/>
    <text x="30" y="104" font-family="Inter" font-weight="700" font-size="9" fill="#5c6478">PRODUCT</text><text x="500" y="104" font-family="Inter" font-weight="700" font-size="9" fill="#5c6478">CLICK POTENTIAL</text>
    <text x="30" y="128" font-family="Inter" font-size="10.5" fill="#10152b">Sandalwood Soy Candle 8oz</text><text x="500" y="128" font-family="Inter" font-weight="700" font-size="10" fill="#dc2626">High</text>
    <text x="30" y="150" font-family="Inter" font-size="10.5" fill="#10152b">Lavender Soy Candle 8oz</text><text x="500" y="150" font-family="Inter" font-weight="700" font-size="10" fill="#d97706">Medium</text>
  `, '0 0 730 190', 'the "Needs attention" tab and click-potential ranking — this is the current home for product issues; older tutorials calling this "Diagnostics" describe a retired interface.', 'Recreated illustration of Google Merchant Center\'s Needs Attention view, ranked by click potential.')],

  [/Google Search Console.*Add property.*Domain option.*TXT record/i, () => shotShell('search.google.com/search-console/welcome', `
    <rect width="730" height="200" fill="#fff"/>
    <text x="30" y="34" font-family="Manrope" font-weight="800" font-size="14" fill="#10152b">Add property</text>
    ${hi(28,50,220,38)}
    <rect x="30" y="52" width="220" height="34" rx="8" fill="#edeafe" stroke="#4f46e5" stroke-width="1.4"/><text x="140" y="74" text-anchor="middle" font-family="Inter" font-weight="700" font-size="11" fill="#4f46e5">&#9673; Domain</text>
    <rect x="262" y="52" width="220" height="34" rx="8" fill="#f5f7fc" stroke="#e1e5f2"/><text x="372" y="74" text-anchor="middle" font-family="Inter" font-size="11" fill="#9aa0bd">URL prefix</text>
    <text x="30" y="124" font-family="Inter" font-size="10.5" fill="#5c6478">TXT record to add:</text>
    ${hi(28,132,480,32)}
    <rect x="30" y="134" width="480" height="28" rx="5" fill="#f5f7fc" stroke="#e1e5f2"/><text x="42" y="152" font-family="monospace" font-size="9.5" fill="#10152b">google-site-verification=Xk2p9...a41Qz</text>
    <rect x="520" y="134" width="60" height="28" rx="5" fill="#4f46e5"/><text x="550" y="152" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="9.5" fill="#fff">Copy</text>
  `, '0 0 730 200', 'this exact string gets pasted into DNS settings next — nowhere else.', 'Recreated illustration of the Google Search Console Add Property screen with Domain selected and a TXT record shown.')],

  [/Settings → Domains → \[domain\] → DNS settings/i, () => shotShell('admin.shopify.com/store/your-store/settings/domains', `
    <rect width="730" height="180" fill="#fff"/>
    <text x="30" y="32" font-family="Manrope" font-weight="800" font-size="13" fill="#10152b">DNS settings</text>
    ${hi(28,44,200,28)}
    <rect x="30" y="46" width="200" height="24" rx="5" fill="#edeafe"/><text x="130" y="63" text-anchor="middle" font-family="Inter" font-weight="700" font-size="10" fill="#4f46e5">+ Add a custom record</text>
    <text x="30" y="100" font-family="Inter" font-size="10" fill="#5c6478">Record type</text>
    ${hi(28,106,110,28)}
    <rect x="30" y="108" width="110" height="24" rx="5" fill="#f5f7fc" stroke="#e1e5f2"/><text x="85" y="124" text-anchor="middle" font-family="Inter" font-size="10" fill="#10152b">TXT &#9662;</text>
    <text x="30" y="158" font-family="Inter" font-size="10" fill="#5c6478">Value</text>
    <rect x="30" y="164" width="480" height="24" rx="5" fill="#f5f7fc" stroke="#e1e5f2"/>
  `, '0 0 730 190', 'the record-type dropdown and value field — this is the in-Shopify path for domains bought through Shopify, no external registrar login needed.', 'Recreated illustration of the Shopify DNS settings screen adding a custom TXT record.')],

  [/Google Search Console Sitemaps screen with.*sitemap\.xml/i, () => shotShell('search.google.com/search-console/sitemaps', `
    <rect width="730" height="160" fill="#fff"/>
    <text x="30" y="32" font-family="Manrope" font-weight="800" font-size="13" fill="#10152b">Sitemaps</text>
    <text x="30" y="60" font-family="Inter" font-size="10.5" fill="#5c6478">Add a new sitemap</text>
    ${hi(28,68,280,30)}
    <rect x="30" y="70" width="200" height="26" rx="5" fill="#f5f7fc" stroke="#e1e5f2"/><text x="40" y="87" font-family="Inter" font-size="10" fill="#10152b">sitemap.xml</text>
    <rect x="234" y="70" width="70" height="26" rx="5" fill="#4f46e5"/><text x="269" y="87" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="9.5" fill="#fff">Submit</text>
    <line x1="30" y1="118" x2="700" y2="118" stroke="#e1e5f2"/>
    <text x="30" y="136" font-family="Inter" size="10" fill="#5c6478">sitemap.xml</text><text x="600" y="136" font-family="Inter" font-weight="700" font-size="10" fill="#0d9488">&#10003; Success</text>
  `, '0 0 730 160', 'submit only this one file, never the numbered sub-sitemaps underneath it.', 'Recreated illustration of the Google Search Console Sitemaps screen with sitemap.xml submitted successfully.')],

  [/Google Search Console URL Inspection tool/i, () => shotShell('search.google.com/search-console/inspect', `
    <rect width="730" height="170" fill="#fff"/>
    <rect x="30" y="20" width="500" height="30" rx="15" fill="#f5f7fc" stroke="#e1e5f2"/><text x="46" y="40" font-family="Inter" font-size="10" fill="#5c6478">yourstore.com/products/sandalwood-soy-candle-8oz</text>
    ${hi(28,66,240,30)}
    <text x="34" y="86" font-family="Manrope" font-weight="700" font-size="12" fill="#0d9488">&#10003; URL is on Google</text>
    <rect x="30" y="112" width="150" height="30" rx="6" fill="#edeafe" stroke="#4f46e5"/><text x="105" y="132" text-anchor="middle" font-family="Inter" font-weight="700" font-size="10" fill="#4f46e5">Request Indexing</text>
    ${badge(200,127,1)}
  `, '0 0 730 170', 'this is how you get a definitive yes/no for one specific page, and where the (non-magic) Request Indexing button lives.', 'Recreated illustration of the Google Search Console URL Inspection tool showing "URL is on Google" and the Request Indexing button.')],

  [/PageSpeed Insights results page for a real product URL/i, () => shotShell('pagespeed.web.dev/report', `
    <rect width="730" height="190" fill="#fff"/>
    <circle cx="90" cy="90" r="55" fill="none" stroke="#0d9488" stroke-width="10"/><text x="90" y="98" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="26" fill="#0d9488">88</text>
    <text x="90" y="165" text-anchor="middle" font-family="Inter" font-size="10" fill="#5c6478">Performance</text>
    ${hi(190,40,300,30)}
    <rect x="190" y="42" width="140" height="26" rx="13" fill="#edeafe"/><text x="260" y="59" text-anchor="middle" font-family="Inter" font-weight="700" font-size="10" fill="#4f46e5">Lab Data</text>
    <rect x="336" y="42" width="150" height="26" rx="13" fill="#f5f7fc"/><text x="411" y="59" text-anchor="middle" font-family="Inter" font-size="10" fill="#5c6478">Field Data (28 days)</text>
  `, '0 0 730 190', 'these are two different measurements, not one score — check both before drawing a conclusion.', 'Recreated illustration of a PageSpeed Insights results page with the Lab Data / Field Data tab toggle highlighted.')],

  [/Rich Results Test results for a Shopify product URL/i, () => shotShell('search.google.com/test/rich-results', `
    <rect width="730" height="150" fill="#fff"/>
    <text x="30" y="32" font-family="Manrope" font-weight="800" font-size="13" fill="#0d9488">&#10003; Page is eligible for rich results</text>
    ${hi(28,50,180,30)}
    <rect x="30" y="52" width="180" height="26" rx="6" fill="#edeafe"/><text x="120" y="69" text-anchor="middle" font-family="Inter" font-weight="700" font-size="10" fill="#4f46e5">Product detected</text>
    <text x="30" y="106" font-family="Inter" font-size="10" fill="#5c6478">Fields: name, price, availability, image</text>
  `, '0 0 730 150', 'this confirms what Google can currently read from the page\'s structured data, without needing to view raw code.', 'Recreated illustration of the Rich Results Test results showing a detected Product type.')],
];

function findShotBuilder(desc) {
  for (const [re, fn] of SHOT_BUILDERS) if (re.test(desc)) return fn;
  return null;
}

// ---------- screenshot placeholder ----------
function screenshotBlock(desc) {
  const capMatch = desc.match(/Caption should teach:\s*([^\]]+)/i);
  const caption = capMatch ? capMatch[1].trim() : desc.slice(0, 160);
  const whatMatch = desc.match(/What should be visible:?\s*([^.]+\.)/i);
  return `<div class="shot-frame no-break">
    <div class="chrome-bar"><span class="chrome-dot"></span><span class="chrome-dot"></span><span class="chrome-dot"></span><span class="chrome-url">screenshot reserved — captured at production</span></div>
    <div class="shot-placeholder"><div class="sp-inner"><div class="sp-label">Screenshot Reserved</div><div class="sp-desc">${md.renderInline(desc.replace(/^Shopify admin,?|^Google [A-Za-z ]+,?/,'').slice(0,220))}</div></div></div>
    <div class="shot-caption"><strong>What you're looking for:</strong> ${md.renderInline(caption)}</div>
  </div>`;
}

// ---------- Part / Section registries for System-So-Far ----------
const PART_TITLES = {
  0: 'Your Starting Point', 1: 'Your Organic Traffic Foundation', 2: 'Find What People Are Searching For',
  3: 'Turn Keywords Into a Shopify Store', 4: 'Content That Actually Supports Sales', 5: 'On-Page SEO',
  6: 'Technical SEO Without the Tech Overload', 7: 'Social Search', 8: 'AI Search',
  9: 'Measure What Is Working', 10: 'The 90-Day Shopify SEO Plan',
};
const PART_NEW_STAGES = {
  4: ['Content Clusters', '30 Content Opportunities'],
  5: ['On-Page Anatomy', 'Internal Linking'],
  6: ['Technical Health Check'],
  7: ['Social Content Plan'],
  8: ['AI Self-Test', 'AI Readiness'],
  9: ['Search Scorecard'],
  10: ['90-Day Plan', 'Final SEO Plan'],
};
const PART_ORDER = [0,1,2,3,4,5,6,7,8,9,10];

function systemSoFar(currentPart) {
  const priorParts = PART_ORDER.filter(p => p < currentPart && p >= 0 && p !== 0 || p === 0).filter(p => p < currentPart);
  const milestones = priorParts.map(p => `<div class="ms-pill"><span class="ck"></span><span>Part ${p} · ${PART_TITLES[p]}</span></div>`).join('<span class="mini-arrow">&rarr;</span>');
  const chips = (PART_NEW_STAGES[currentPart] || []).map(c => `<span class="now-chip">${c}</span>`).join('');
  const future = PART_ORDER.filter(p => p > currentPart).slice(0, 2).map(p => `<span class="fut-pill">Part ${p} &middot; ${PART_TITLES[p]}</span>`).join('');
  const moreCount = PART_ORDER.filter(p => p > currentPart).length - 2;
  const futureHtml = future + (moreCount > 0 ? `<span class="fut-pill">+ ${moreCount} more</span>` : '');
  return `<div class="popener2-base">
    <div class="sys2-label">&#10022; Your System So Far</div>
    <div class="sys2-row">${milestones}</div>
    <div style="display:flex;align-items:flex-start;gap:12px;">
      <span class="mini-arrow" style="font-size:16pt;color:var(--indigo);margin-top:24px;">&#8618;</span>
      <div class="now-card"><span class="now-flag"><span class="p"></span>You Are Here</span>
        <div class="now-title">Part ${currentPart} &mdash; ${PART_TITLES[currentPart]}</div>
        <div class="now-chips">${chips}</div>
      </div>
    </div>
    <div class="future-row">${futureHtml}</div>
  </div>`;
}

function anatomyHero() {
  const gAnat = `<defs><linearGradient id="gAnat2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f46e5"/><stop offset="1" stop-color="#0891b2"/></linearGradient></defs>`;
  const page1 = `<div class="wb-page"><div class="page-pad content-wrap">
    <span class="eyebrow indigo">SECTION 14 &middot; SIGNATURE ASSET</span>
    <h2>Anatomy of a Search-Optimized Shopify Page</h2>
    <figure class="diagram" style="margin-top:14px;">
      <svg viewBox="0 0 760 900" role="img" aria-label="Full annotated Shopify product page for the sandalwood soy candle, numbered 1 through 11 in reading order: URL, title tag, meta description, H1, opening copy, product information, supporting headings, image with alt text, FAQ, internal links, and call to action.">
        ${gAnat}
        <rect x="60" y="0" width="640" height="900" rx="20" fill="#f5f7fc" stroke="#e1e5f2" stroke-width="1.5"/>
        <rect x="90" y="30" width="580" height="30" rx="7" fill="#fff" stroke="#e1e5f2"/>
        <text x="106" y="50" font-family="Inter" font-size="13" fill="#5c6478">/products/sandalwood-soy-candle-8oz</text>
        <circle cx="60" cy="45" r="17" fill="url(#gAnat2)"/><text x="60" y="51" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#fff">1</text>
        <rect x="90" y="86" width="420" height="24" rx="5" fill="#dfe3f6"/>
        <text x="98" y="103" font-family="Manrope" font-weight="800" font-size="15" fill="#5c6478">8oz Soy Candle — Sandalwood</text>
        <circle cx="60" cy="98" r="17" fill="url(#gAnat2)"/><text x="60" y="104" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#fff">4</text>
        <rect x="90" y="126" width="560" height="12" rx="4" fill="#e1e5f2"/>
        <rect x="90" y="144" width="500" height="12" rx="4" fill="#e1e5f2"/>
        <circle cx="60" cy="140" r="17" fill="url(#gAnat2)"/><text x="60" y="146" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#fff">5</text>
        <rect x="90" y="180" width="260" height="200" rx="12" fill="#eef1fa" stroke="#e1e5f2"/>
        <circle cx="220" cy="255" r="46" fill="#f4c98a" opacity=".55"/>
        <rect x="185" y="238" width="70" height="34" rx="6" fill="#c98a4a" opacity=".5"/>
        <text x="220" y="352" text-anchor="middle" font-family="Inter" font-size="11" fill="#9aa0bd">amber jar, lit, on wood shelf</text>
        <circle cx="60" cy="188" r="17" fill="url(#gAnat2)"/><text x="60" y="194" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#fff">8</text>
        <rect x="374" y="180" width="276" height="14" rx="4" fill="#e1e5f2"/>
        <rect x="374" y="202" width="276" height="14" rx="4" fill="#e1e5f2"/>
        <rect x="374" y="224" width="200" height="14" rx="4" fill="#e1e5f2"/>
        <rect x="374" y="254" width="130" height="30" rx="7" fill="#edeafe" stroke="#4f46e5"/>
        <text x="439" y="273" text-anchor="middle" font-family="Inter" font-weight="700" font-size="11" fill="#3c34b5">100% Soy Wax</text>
        <circle cx="60" cy="210" r="17" fill="url(#gAnat2)"/><text x="60" y="216" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#fff">6</text>
        <rect x="90" y="410" width="230" height="20" rx="5" fill="#dfe3f6"/>
        <rect x="90" y="442" width="560" height="12" rx="4" fill="#e1e5f2"/>
        <rect x="90" y="460" width="520" height="12" rx="4" fill="#e1e5f2"/>
        <circle cx="60" cy="420" r="17" fill="url(#gAnat2)"/><text x="60" y="426" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#fff">7</text>
        <rect x="90" y="502" width="560" height="110" rx="12" fill="#eef1fa" stroke="#e1e5f2"/>
        <text x="112" y="534" font-family="Inter" font-size="14" font-weight="700" fill="#10152b">Is this candle safe for pets?</text>
        <rect x="112" y="550" width="500" height="10" rx="3" fill="#e1e5f2"/>
        <rect x="112" y="568" width="420" height="10" rx="3" fill="#e1e5f2"/>
        <circle cx="60" cy="512" r="17" fill="url(#gAnat2)"/><text x="60" y="518" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#fff">9</text>
        <rect x="90" y="636" width="300" height="16" rx="4" fill="#c7d2fe"/>
        <text x="106" y="648" font-family="Inter" font-size="12" font-weight="700" fill="#3c34b5">shop non-toxic candles &rarr;</text>
        <circle cx="60" cy="644" r="17" fill="url(#gAnat2)"/><text x="60" y="650" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#fff">10</text>
        <rect x="90" y="678" width="230" height="56" rx="12" fill="url(#gAnat2)"/>
        <text x="205" y="712" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="17" fill="#fff">Add to Cart — $34</text>
        <circle cx="60" cy="706" r="17" fill="url(#gAnat2)"/><text x="60" y="712" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="16" fill="#fff">11</text>
      </svg>
      <figcaption>Numbered 1&ndash;11 in reading order: URL &middot; title tag/search preview &middot; meta description &middot; H1 &middot; opening copy &middot; product info &middot; supporting headings &middot; image + alt text &middot; FAQ &middot; internal links &middot; CTA.</figcaption>
    </figure>
  </div></div>`;
  const page2 = `<div class="wb-page"><div class="page-pad content-wrap">
    <span class="eyebrow cyan">PAGE 2 OF 2</span>
    <h2>The Search Result Preview &mdash; Zoomed</h2>
    <p class="body-measure">Elements 2 and 3 aren't visible on the live page itself &mdash; they only exist in the search result. Here's what they actually look like.</p>
    <div style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 22px;margin:14px 0 26px;">
      <div style="font-size:8.6pt;color:#5c6478;margin-bottom:4px;">juniperlanecandle.com &rsaquo; products &rsaquo; sandalwood</div>
      <div style="font-family:Manrope;font-weight:700;font-size:12.5pt;color:#2563eb;margin-bottom:6px;">8oz Soy Candle &ndash; Sandalwood, Amber Jar <span style="background:var(--indigo-bg);color:var(--indigo);font-size:6.6pt;font-weight:800;padding:2px 7px;border-radius:999px;">2 &middot; TITLE TAG</span></div>
      <div style="font-size:9.6pt;color:#5c6478;">Hand-poured soy candle, 45+ hr burn, non-toxic — safe around pets. <span style="background:var(--indigo-bg);color:var(--indigo);font-size:6.6pt;font-weight:800;padding:2px 7px;border-radius:999px;">3 &middot; META DESCRIPTION</span></div>
    </div>
    <h2 style="font-size:13pt;">All 11, At a Glance</h2>
    <div class="legend2">
      <div class="leg-item"><span class="leg-num">1</span><div><b>URL</b><span>What the page is about, at a glance</span></div></div>
      <div class="leg-item"><span class="leg-num">2</span><div><b>Title tag</b><span>The clickable headline in results</span></div></div>
      <div class="leg-item"><span class="leg-num">3</span><div><b>Meta description</b><span>Earns the click, not the ranking</span></div></div>
      <div class="leg-item"><span class="leg-num">4</span><div><b>H1</b><span>Confirms "you're in the right place"</span></div></div>
      <div class="leg-item"><span class="leg-num">5</span><div><b>Opening copy</b><span>What is this, am I in the right place?</span></div></div>
      <div class="leg-item"><span class="leg-num">6</span><div><b>Product info</b><span>Reinforces topic without stuffing</span></div></div>
      <div class="leg-item"><span class="leg-num">7</span><div><b>Supporting headings</b><span>Organize, don't insert keywords</span></div></div>
      <div class="leg-item"><span class="leg-num">8</span><div><b>Image + alt text</b><span>Describe what's actually shown</span></div></div>
      <div class="leg-item"><span class="leg-num">9</span><div><b>FAQ</b><span>Clarity, not a rich-result play</span></div></div>
      <div class="leg-item"><span class="leg-num">10</span><div><b>Internal links</b><span>In context, not bolted on</span></div></div>
      <div class="leg-item"><span class="leg-num">11</span><div><b>CTA</b><span>The obvious next action</span></div></div>
    </div>
  </div></div>`;
  return page1 + page2;
}

function productLadderDiagram() {
  const steps = [
    { title: 'Keep DIYing', phrase: 'Teach me', color: '#4f46e5', bg: '#edeafe' },
    { title: 'Get a Personalized Analysis ($299)', phrase: 'Analyze mine', color: '#0891b2', bg: '#e1f6fb' },
  ];
  const cardW = 210, cardH = 110, gap = 40, y = 20;
  let svg = ARROW_DEFS;
  steps.forEach((s, idx) => {
    const x = idx * (cardW + gap) + 10;
    svg += `<rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="14" fill="${s.bg}" stroke="${s.color}" stroke-width="1.5"/>`;
    svg += `<text x="${x + cardW / 2}" y="${y + 44}" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="13" fill="${s.color}">${wrapSvgText(s.title, 22, x + cardW / 2)}</text>`;
    svg += `<text x="${x + cardW / 2}" y="${y + cardH - 20}" text-anchor="middle" font-family="Inter" font-style="italic" font-size="11" fill="#5c6478">"${s.phrase}"</text>`;
    if (idx < steps.length - 1) {
      svg += `<line x1="${x + cardW + 6}" y1="${y + cardH / 2}" x2="${x + cardW + gap - 6}" y2="${y + cardH / 2}" stroke="#9aa0bd" stroke-width="1.8" marker-end="url(#arrM)"/>`;
    }
  });
  const totalW = steps.length * (cardW + gap) - gap + 20;
  const totalH = cardH + 40;
  return svgWrap(svg, `0 0 ${totalW} ${totalH}`, 'Three-step product ladder: Keep DIYing, Get a Personalized Analysis, Get Implementation Help.');
}
// crude multi-line wrap for SVG <text> (tspans), used only by short card titles
function wrapSvgText(text, maxChars, xPos) {
  if (text.length <= maxChars) return text;
  const words = text.split(' ');
  let lines = [], cur = '';
  words.forEach(w => { if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; } else { cur += ' ' + w; } });
  if (cur.trim()) lines.push(cur.trim());
  return lines.map((l, i) => `<tspan x="${xPos}"${i === 0 ? '' : ' dy="15"'}>${l}</tspan>`).join('');
}

// ---------- main line-driven transform ----------
let out = [];
let i = 0;
let currentPart = 0;
let currentSection = 0;
let __guard = 0;
let __pageOpen = false;
function closePage() { const s = __pageOpen ? '</div></div>' : ''; __pageOpen = false; return s; }
function openPage(inner) { __pageOpen = true; return `<div class="wb-page"><div class="page-pad content-wrap">${inner}`; }
const TOTAL_LINES = lines.length;
const WORKSHEET_OPENERS = /^\*\*(WORKSHEET|CHECKLIST):/;
const ASKAI_OPENER = /^\*\*ASK AI/;
const SPECIAL_BQ_OPENERS = [WORKSHEET_OPENERS, ASKAI_OPENER, /^\*\*MY SHOPIFY SEO PLAN\*\*/, /^\*\*REPEATABLE CATALOG CHECKLIST/, /^\*\*CHECKLIST — /];

function isBqLine(l) { return l === '>' || l.startsWith('>'); }

while (i < lines.length) {
  __guard++;
  if (__guard > TOTAL_LINES * 20) { console.error('GUARD TRIPPED at line', i, 'content:', JSON.stringify(lines[i])); process.exit(1); }
  if (__guard % 2000 === 0) console.error('progress: line', i, '/', TOTAL_LINES);
  let l = lines[i];

  // front matter marker skip (yaml)
  if (l.trim() === '---' && i < 20) { i++; while (lines[i] && lines[i].trim() !== '---') i++; i++; continue; }

  // internal editorial/batch markers -- never customer-facing content
  if (/^\*\(End of .*batch/i.test(l.trim())) { i++; continue; }

  // manual page-break safety valve: forces a fresh physical page mid-section.
  // Used surgically at spots where in-flow content would otherwise land in the
  // last ~0.4in of a physical page and visually collide with the footer.
  if (l.trim() === '<!--forcebreak-->') { out.push(closePage()); out.push(openPage('')); i++; continue; }

  // Part header
  let m = l.match(/^# PART (\d+) — (.+)$/);
  if (m) {
    currentPart = parseInt(m[1], 10);
    const title = m[2].trim();
    out.push(closePage());
    out.push(`<div class="wb-page popener2"><div class="popener2-top"><div class="pnum2">${String(currentPart).padStart(2,'0')}</div><span class="eyebrow">PART ${currentPart}</span><h1>${md.renderInline(title)}</h1></div>${systemSoFar(currentPart)}</div>`);
    i++; continue;
  }
  // FRONT MATTER / PART 0 / CLOSE headers -> simple section-open band, own page
  m = l.match(/^# (FRONT MATTER|CLOSE)$/);
  if (m) { i++; continue; }
  m = l.match(/^# PART 0 — (.+)$/);
  if (m) {
    out.push(closePage());
    out.push(openPage(`<span class="eyebrow indigo">PART 0</span><h1>${md.renderInline(m[1])}</h1>`));
    i++; continue;
  }

  // Section header
  m = l.match(/^## Section (\d+): (.+)$/);
  if (m) {
    currentSection = parseInt(m[1], 10);
    out.push(closePage());
    out.push(openPage(`<span class="eyebrow indigo">SECTION ${currentSection}</span><h2>${md.renderInline(m[2])}</h2>`));
    i++; continue;
  }
  m = l.match(/^## (Welcome|What You'll Need|Table of Contents|Your 3-Question Store Health Check)$/);
  if (m) {
    out.push(closePage());
    out.push(openPage(`<h2>${md.renderInline(m[1])}</h2>`));
    i++; continue;
  }

  // Diagram placeholder
  m = l.match(/^\[VISUAL:\s*(.+)\]$/);
  if (m) {
    if (/SIGNATURE ASSET/.test(m[1])) { out.push(closePage()); out.push(anatomyHero()); i++; continue; }
    // already implemented directly by the pipeline — cover design and the
    // recurring System So Far diagram (built into every Part-header render)
    if (/cover design/i.test(m[1]) || /system so far/i.test(m[1]) || /^worked-example table/i.test(m[1]) || /^none new/i.test(m[1])) { i++; continue; }
    if (/product ladder diagram/i.test(m[1])) { out.push(productLadderDiagram()); i++; continue; }
    if (/discovery-channel diagram/i.test(m[1])) { out.push(discoveryHubDiagram()); i++; continue; }
    if (/paid-vs-organic comparison/i.test(m[1])) { out.push(paidVsOrganicDiagram()); i++; continue; }
    if (/annotated before\/after product page mockup/i.test(m[1])) { out.push(beforeAfterProductDiagram()); i++; continue; }
    if (/topical cluster diagram/i.test(m[1])) { out.push(topicalClusterDiagram(false)); i++; continue; }
    if (/topical-cluster diagram from Section/i.test(m[1])) { out.push(topicalClusterDiagram(true)); i++; continue; }
    if (/platform-comparison diagram/i.test(m[1])) { out.push(platformComparisonDiagram()); i++; continue; }
    if (/simple annotated diagram of an AI-assistant answer/i.test(m[1])) { out.push(aiCitationsDiagram()); i++; continue; }
    if (/90-day roadmap timeline graphic/i.test(m[1])) { out.push(roadmapTimelineDiagram()); i++; continue; }
    out.push(genericDiagram(m[1]));
    i++; continue;
  }
  // Screenshot placeholder
  m = l.match(/^\[SCREENSHOT NEEDED:\s*(.+)\]$/);
  if (m) {
    if (!/^none new/i.test(m[1])) {
      const builder = findShotBuilder(m[1]);
      out.push(builder ? builder() : screenshotBlock(m[1]));
    }
    i++; continue;
  }

  // top-level markdown table (not inside a blockquote) — own branch so it
  // never gets mixed into the generic prose buffer, and so we can detect
  // the roadmap / printable-checklist header patterns precisely.
  if (/^\|.*\|\s*$/.test(l.trim())) {
    let tblLines = [];
    while (i < lines.length && /^\|.*\|\s*$/.test(lines[i].trim())) { tblLines.push(lines[i]); i++; }
    const headerLine = tblLines[0];
    let cls = '';
    if (/\|\s*Week\s*\|/i.test(headerLine)) cls = ' class="rmap"';
    else if (/\|\s*Target\s*\|/i.test(headerLine)) cls = ' class="checklist"';
    let rendered = block(tblLines.join('\n'));
    if (cls) rendered = rendered.replace('<table>', `<table${cls}>`);
    if (cls === ' class="rmap"') {
      rendered = rendered.replace(/<td>(?:<strong>)?(\d+(?:–\d+)?)(?:<\/strong>)?<\/td>/g, '<td><span class="week-badge">$1</span></td>');
      rendered = rendered.replace(/🟢/g, '<span class="effort eff-quick"><span></span><span></span><span></span></span>');
      rendered = rendered.replace(/🟡/g, '<span class="effort eff-mod"><span></span><span></span><span></span></span>');
      rendered = rendered.replace(/🔴/g, '<span class="effort eff-sub"><span></span><span></span><span></span></span>');
      rendered = rendered.replace(/\b(Sec\.\s?\d+[a-zA-Z]?|Part\s?\d+)\b/g, '<span class="sec-pill">$1</span>');
    }
    if (cls === ' class="checklist"') {
      rendered = rendered.replace(/\b(Sec\.\s?\d+[a-zA-Z]?|Part\s?\d+)\b/g, '<span class="sec-pill">$1</span>');
    }
    out.push(rendered);
    continue;
  }

  // rhythm markers
  m = l.match(/^\*\*(LEARN|SEE|DO)\*\*$/);
  if (m) { out.push(`<div class="rhythm">${m[1]}</div>`); i++; continue; }
  m = l.match(/^\*\*CHECK YOUR WORK\*\*$/);
  if (m) {
    // gather following paragraph until blank line
    let j = i + 1; let buf = [];
    while (j < lines.length && lines[j].trim() !== '') { buf.push(lines[j]); j++; }
    out.push(`<div class="callout mint"><div class="cl-label">Check Your Work</div>${block(buf.join('\n'))}</div>`);
    i = j; continue;
  }

  // blockquote run
  if (isBqLine(l)) {
    let bq = [];
    while (i < lines.length && isBqLine(lines[i])) { bq.push(stripQuote(lines[i])); i++; }
    const first = bq[0].trim();
    if (/^\*\*REPEATABLE CATALOG CHECKLIST/.test(first)) {
      const title = first.replace(/^\*\*/, '').replace(/\*\*$/, '');
      const body = renderBlockBody(bq.slice(1));
      out.push(`<div class="worksheet"><div class="ws-bar">&#9998;&nbsp; ${md.renderInline(title)}</div><div class="ws-body">${body}</div></div>`);
    } else if (WORKSHEET_OPENERS.test(first)) {
      const title = first.replace(/^\*\*(WORKSHEET|CHECKLIST):\s*/, '').replace(/\*\*$/, '');
      const kind = /^\*\*CHECKLIST/.test(first) ? 'Checklist' : 'Worksheet';
      const body = renderBlockBody(bq.slice(1));
      out.push(`<div class="worksheet"><div class="ws-bar">&#9998;&nbsp; ${kind} &mdash; ${md.renderInline(title)}</div><div class="ws-body">${body}</div></div>`);
    } else if (/^\*\*CHECKLIST — /.test(first)) {
      const title = first.replace(/^\*\*/, '').replace(/\*\*$/, '');
      const body = renderBlockBody(bq.slice(1));
      out.push(`<div class="worksheet"><div class="ws-bar">&#9998;&nbsp; ${md.renderInline(title)}</div><div class="ws-body">${body}</div></div>`);
    } else if (ASKAI_OPENER.test(first)) {
      const body = renderBlockBody(bq.slice(1))
        .replace(/<p>(&gt;\s*)?\*{0,2}"([^"]+)"\*{0,2}<\/p>/g, '<div class="prompt-card">$2</div>');
      out.push(`<div class="askai"><div class="ai-label">&#10024;&nbsp; Ask AI</div>${renderAskAiBody(bq.slice(1))}</div>`);
    } else if (/^\*\*MY SHOPIFY SEO PLAN\*\*/.test(first)) {
      const body = renderBlockBody(bq.slice(1));
      out.push(`<div class="worksheet"><div class="ws-bar">&#9998;&nbsp; My Shopify SEO Plan</div><div class="ws-body">${body}</div></div>`);
    } else if (/^\*\*\[/.test(first)) {
      // whole-line bracketed flag, e.g. "**[PRODUCT OWNER REVIEW REQUIRED — ...]**" —
      // render the full line verbatim, never strip it as a "label" prefix.
      const restBody = [first, ...bq.slice(1)].join(' ');
      out.push(`<div class="callout red"><div class="cl-label">Pre-Publication Flag</div>${block(restBody)}</div>`);
    } else {
      const meta = classifyCallout(first.replace(/^\*\*/, ''));
      // only strip a genuine "**Label:**" prefix (colon inside the bold span);
      // otherwise the bold span is the whole sentence and must not be stripped.
      const labelPrefix = first.match(/^\*\*([^*:]{1,60}):\*\*\s*/);
      const restFirst = labelPrefix ? first.slice(labelPrefix[0].length).trim() : first;
      const restBody = [restFirst, ...bq.slice(1)].join(' ');
      out.push(`<div class="${meta.cls}"><div class="cl-label">${meta.label}</div>${block(restBody)}</div>`);
    }
    continue;
  }

  // horizontal rule -> subtle divider (not forced page break; layout composition handled by CSS break rules)
  if (l.trim() === '---') { i++; continue; }

  // regular content: accumulate until a line matching a special pattern
  let bufLines = [];
  while (i < lines.length) {
    const cur = lines[i];
    if (/^# PART/.test(cur) || /^## Section/.test(cur) || /^\[VISUAL:/.test(cur) || /^\[SCREENSHOT NEEDED:/.test(cur) ||
        /^\*\*(LEARN|SEE|DO)\*\*$/.test(cur) || /^\*\*CHECK YOUR WORK\*\*$/.test(cur) || isBqLine(cur) || cur.trim() === '---' ||
        /^\|.*\|\s*$/.test(cur.trim()) || /^\*\(End of .*batch/i.test(cur.trim()) || cur.trim() === '<!--forcebreak-->' ||
        /^## (Welcome|What You'll Need|Table of Contents|Your 3-Question)/.test(cur) || /^# (FRONT MATTER|CLOSE)$/.test(cur)) break;
    bufLines.push(cur); i++;
  }
  out.push(block(bufLines.join('\n')));
}
out.push(closePage());

function renderAskAiBody(bqBodyLines) {
  // bqBodyLines already de-quoted, belongs to an ASK AI block
  let html = '';
  let i = 0;
  while (i < bqBodyLines.length) {
    const t = bqBodyLines[i].trim();
    if (t === '') { i++; continue; }
    const boldLabel = t.match(/^\*\*([^*]+):\*\*$/);
    if (boldLabel) { html += `<span class="prompt-label">${inline(boldLabel[1])}:</span>`; i++; continue; }
    if (/^>\s*\*/.test(t) || /^\*"|^"/.test(t.replace(/^>\s*/,''))) {
      // quoted prompt line(s) - gather until blank
      let buf = [t]; i++;
      while (i < bqBodyLines.length && bqBodyLines[i].trim() !== '') { buf.push(bqBodyLines[i].trim()); i++; }
      const joined = buf.join(' ').replace(/^>\s*/, '').replace(/^\*+"|"\*+$/g, '').replace(/^"|"$/g, '');
      html += `<div class="prompt-card">${inline(joined)}</div>`;
      continue;
    }
    // plain guard sentence
    let buf = [t]; i++;
    while (i < bqBodyLines.length && bqBodyLines[i].trim() !== '' && !/^\*\*[^*]+:\*\*$/.test(bqBodyLines[i].trim())) { buf.push(bqBodyLines[i].trim()); i++; }
    html += `<p class="ai-guard">${inline(buf.join(' '))}</p>`;
  }
  return html;
}

let assembled = out.join('\n');

const template = readFileSync(path.join(here, 'shell.html'), 'utf-8');
const finalHtml = template.replace('<!--BODY-->', assembled);
writeFileSync(outPath, finalHtml, 'utf-8');
console.log('Wrote', outPath, '(' + out.length + ' blocks)');

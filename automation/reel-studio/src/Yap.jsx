// Yap kit: talking-head Reel in Scrolly's brand look (inspired by @carolyn.rose.official / @itsmegkilgore).
// Layers, bottom to top: graded video (alternating framing at each jump cut, punch-in zoom on emphasis lines) →
// title above her head (stays on) → word-pop captions under her face (peach on emphasis words; the whole emphasis
// phrase pops in big serif) → end card (CTA) → audio: voice + optional sound effects + optional music bed.
// Style rules that Mercedes approves or rejects get added to ../STYLE-RULES.md and then here.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { FIGTREE, SERIF, BRICOLAGE } from './fonts.js';

export const BRAND = { cream: '#FFF4DC', peach: '#FFC9A8', ink: '#161210', paper: '#F6EEE5', orange: '#E8602F' };

// Caption groups: up to 3 words, break after punctuation, never across a cut.
function groupWords(words) {
  const groups = [];
  let cur = [];
  words.forEach((w, i) => {
    cur.push({ ...w, i });
    const next = words[i + 1];
    if (cur.length >= 3 || /[.,?!:]$/.test(w.w) || !next || next.seg !== w.seg || next.s - w.e > 0.35) { groups.push(cur); cur = []; }
  });
  return groups.map((g) => ({ words: g, s: g[0].s, e: g.at(-1).e }));
}

const Video = ({ src, cuts, emphasis, grade }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  // Alternate framing at each jump cut (1.00 / 1.07) so cuts read as camera changes.
  const piece = cuts.filter((c) => c <= t + 1e-3).length - 1;
  let scale = piece % 2 ? 1.07 : 1;
  // Punch-in on emphasis lines: spring to +12%, ease back out.
  for (const e of emphasis) {
    const sIn = spring({ frame: frame - Math.round(e.s * fps), fps, config: { damping: 14, stiffness: 160 } });
    const sOut = spring({ frame: frame - Math.round((e.e + 0.35) * fps), fps, config: { damping: 20 } });
    scale += 0.12 * Math.max(0, sIn - sOut);
  }
  const g = grade || {};
  const filter = `contrast(${g.contrast ?? 1.05}) saturate(${g.saturation ?? 0.96}) sepia(${g.warmth ?? 0.04}) brightness(${g.brightness ?? 1.02})`;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000' }}>
      <OffthreadVideo src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, transformOrigin: '50% 38%', filter }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,.28) 100%)' }} />
    </AbsoluteFill>
  );
};

const Title = ({ text }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16 } });
  // title = "text" or { caps: "WHY AI DOESN'T", serif: "sound like you" }. A soft dark fade behind it keeps it
  // readable over busy backgrounds (her floral curtain).
  const { caps, serif } = typeof text === 'string' ? { caps: text, serif: null } : text;
  return (
    <>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.32) 22%, rgba(0,0,0,0) 36%)', opacity: p }} />
      <div style={{ position: 'absolute', top: 190, left: 60, right: 60, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * -24}px)` }}>
        <div style={{ fontFamily: BRICOLAGE, fontWeight: 800, fontStretch: '75%', fontSize: 78, lineHeight: 0.98, letterSpacing: '-0.01em', textTransform: 'uppercase', color: '#FFFFFF', textShadow: '0 4px 18px rgba(0,0,0,.5)' }}>{caps}</div>
        {serif && <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 112, lineHeight: 0.95, color: BRAND.peach, textShadow: '0 4px 22px rgba(0,0,0,.55)' }}>{serif}</div>}
      </div>
    </>
  );
};

const Captions = ({ words, emphasis, hideFrom }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  if (t >= hideFrom) return null;
  const em = emphasis.find((e) => t >= e.s - 0.05 && t <= e.e + 0.25);
  const base = { position: 'absolute', left: 60, right: 60, top: 1290, textAlign: 'center' };
  if (em) {
    // Emphasis: the whole phrase pops in as bold condensed peach caps (a thin serif with an outline looked muddy).
    const p = spring({ frame: frame - Math.round(em.s * fps), fps, config: { damping: 11, stiffness: 180 } });
    const text = words.slice(em.from, em.to + 1).map((w) => w.w).join(' ').replace(/[.,]$/, '');
    return (
      <div style={{ ...base, top: 1250, transform: `scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 1.5) }}>
        <span style={{ fontFamily: BRICOLAGE, fontWeight: 800, fontStretch: '75%', fontSize: 104, lineHeight: 0.98, textTransform: 'uppercase', color: BRAND.peach,
          WebkitTextStroke: '12px #161210', paintOrder: 'stroke fill', textShadow: '0 6px 22px rgba(0,0,0,.5)' }}>{text}</span>
      </div>
    );
  }
  const g = groupWords(words).find((x) => t >= x.s - 0.04 && t < x.e + 0.12);
  if (!g) return null;
  return (
    <div style={base}>
      {g.words.map((w) => {
        const active = t >= w.s - 0.03;
        const p = spring({ frame: frame - Math.round(w.s * fps), fps, config: { damping: 12, stiffness: 220 } });
        return (
          <span key={w.i} style={{ display: 'inline-block', margin: '0 12px', fontFamily: FIGTREE, fontWeight: 800, fontSize: 80, lineHeight: 1.15,
            color: active ? '#FFFFFF' : 'rgba(255,255,255,.55)', transform: `scale(${active ? 0.88 + 0.12 * p : 0.92})`,
            WebkitTextStroke: '11px #161210', paintOrder: 'stroke fill', textShadow: '0 5px 16px rgba(0,0,0,.45)' }}>{w.w}</span>
        );
      })}
    </div>
  );
};

const EndCard = ({ lines }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 15 } });
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 1180, transform: `translateY(${(1 - p) * 160}px)`, opacity: p,
      background: BRAND.paper, borderRadius: 36, padding: '44px 48px 48px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.35)' }}>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, lineHeight: 1, color: BRAND.ink }}>{lines[0]}</div>
      {lines.slice(1).map((l, k) => <div key={k} style={{ fontFamily: FIGTREE, fontWeight: 800, fontSize: 52, marginTop: 18, color: BRAND.orange }}>{l}</div>)}
    </div>
  );
};

export const Yap = (props) => {
  const { fps } = useVideoConfig();
  const { video, words, emphasis = [], cuts = [0], title, end, grade, music, sfx, duration } = props;
  const endFrom = end ? duration - end.dur : Infinity;
  return (
    <AbsoluteFill>
      <Video src={video} cuts={cuts} emphasis={emphasis} grade={grade} />
      {title && <Title text={title} />}
      <Captions words={words} emphasis={emphasis} hideFrom={endFrom} />
      {end && <Sequence from={Math.round(endFrom * fps)}><EndCard lines={end.lines} /></Sequence>}
      {music && <Audio src={staticFile(music.file)} volume={music.volume ?? 0.08} />}
      {sfx?.pop && emphasis.map((e, k) => <Sequence key={k} from={Math.max(0, Math.round(e.s * fps) - 2)}><Audio src={staticFile(sfx.pop)} volume={sfx.volume ?? 0.5} /></Sequence>)}
      {sfx?.whoosh && title && <Audio src={staticFile(sfx.whoosh)} volume={sfx.volume ?? 0.4} />}
      {sfx?.chime && end && <Sequence from={Math.round(endFrom * fps)}><Audio src={staticFile(sfx.chime)} volume={sfx.volume ?? 0.45} /></Sequence>}
    </AbsoluteFill>
  );
};

// Side-by-side test (Remotion half): one 5s "Studio" beat. The HyperFrames half in ../hyperframes-test builds the
// exact same timeline so Mercedes can compare the tools by eye. Times are seconds from the start of public/test/beat.mp4.
import React from 'react';
import { AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { FIGTREE, SERIF } from './fonts.js';

const PEACH = '#FFC9A8', CREAM = '#FFF4DC';
const LEAD = [['That’s', 0.333], ['because', 0.693], ['AI', 0.893]];
const KEY = { text: 'doesn’t automatically know your personality', at: 1.789, out: 4.15 };
const SPARK = 'M20 0c1.5 12 6.5 17 20 20-13.5 3-18.5 8-20 20C18.5 28 13.5 23 0 20 13.5 17 18.5 12 20 0z';

export const StudioBeat = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const sp = (at, cfg = {}) => spring({ frame: frame - Math.round(at * fps), fps, config: { damping: 13, stiffness: 170, ...cfg } });
  // camera: punch-in on the key phrase, ease back after
  const zoom = 1 + 0.13 * Math.max(0, sp(KEY.at) - sp(KEY.out, { damping: 20 }));
  // whip out: horizontal blur + slide to a peach card at the end
  const whip = interpolate(t, [4.5, 4.95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const leadIn = t < KEY.at, key = sp(KEY.at), card = sp(2.3) - sp(4.2, { damping: 18 }), spark = sp(1.85, { damping: 8 });
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translateX(${-whip * 260}px) scale(${zoom})`, transformOrigin: '50% 40%', filter: `blur(${whip * 28}px) contrast(1.05) saturate(.96)` }}>
        <OffthreadVideo src={staticFile('test/beat.mp4')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,.25) 26%, rgba(0,0,0,0) 40%)' }} />
      {/* small sans lead-in, word by word, then it shrinks up as the key phrase lands */}
      <div style={{ position: 'absolute', top: 250, left: 60, right: 60, textAlign: 'center', transform: `translateY(${leadIn ? 0 : -40 * key}px)`, opacity: leadIn ? 1 : 1 - key * 0.35 }}>
        {LEAD.map(([w, at]) => (
          <span key={w} style={{ display: 'inline-block', margin: '0 10px', fontFamily: FIGTREE, fontWeight: 700, fontSize: 58, color: '#fff',
            opacity: t >= at ? 1 : 0, transform: `translateY(${(1 - sp(at)) * 16}px)`, textShadow: '0 3px 14px rgba(0,0,0,.5)' }}>{w}</span>
        ))}
      </div>
      {/* the key phrase: big italic serif in peach, above her head */}
      <div style={{ position: 'absolute', top: 330, left: 70, right: 70, textAlign: 'center', opacity: Math.min(1, key * 1.4) * (1 - card * 0) , transform: `scale(${0.75 + 0.25 * key})` }}>
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, lineHeight: 0.95, color: PEACH, textShadow: '0 5px 26px rgba(0,0,0,.55)' }}>{KEY.text}</span>
      </div>
      {/* sparkle sticker */}
      <svg viewBox="0 0 40 40" style={{ position: 'absolute', left: 880, top: 300, width: 110, transform: `scale(${spark}) rotate(${(1 - spark) * 90}deg)`, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.3))' }}><path d={SPARK} fill={CREAM} /></svg>
      {/* proof card: the real Business Brain page, slides in from the right */}
      <div style={{ position: 'absolute', left: 590, top: 1050, width: 430, transform: `translateX(${(1 - card) * 620}px) rotate(${-5 + (1 - card) * 10}deg)`,
        borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.45)', border: `6px solid ${CREAM}` }}>
        <Img src={staticFile('test/brain-card.png')} style={{ width: '100%', display: 'block' }} />
      </div>
      {/* next lead-in after the key phrase */}
      {t >= 4.24 && <div style={{ position: 'absolute', top: 250, left: 60, right: 60, textAlign: 'center', fontFamily: FIGTREE, fontWeight: 700, fontSize: 58, color: '#fff', textShadow: '0 3px 14px rgba(0,0,0,.5)', opacity: sp(4.24) }}>Think about it,</div>}
      <AbsoluteFill style={{ background: PEACH, opacity: interpolate(t, [4.75, 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
    </AbsoluteFill>
  );
};

// Pre-render review export: everything the review page needs for one Reel, written to <reel>/review/.
// Called from a Reel's build.mjs (run from the Reel folder):
//   node build.mjs review  →  R.write('review/stage.html', { stage: { video: PROXY, stills } }); await reviewExport(R, {…})
// Makes review/talk-proxy.mp4 (a light 540×960 copy of the prepped take, muted, for smooth live playback),
// review/covers/cover-N.png (one per cover option) and review/reel.json. All times are on the Reel's own timeline.
import { LEVELS } from '../loudness.mjs';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COVER_BGS } from '../cover.mjs';
import { brandList } from '../brand/index.mjs';
import { renderFrames } from './frames.mjs';
import { lookFilter } from '../reel.mjs';
import { ctaList, withCtaLine } from '../cta.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FF = path.join(HERE, '../../../hyperframes-test/bin/ffmpeg.exe');
const MEDIA = JSON.parse(readFileSync(path.join(HERE, '../../../carousels/config/media.json'), 'utf8'));
const r2 = (x) => +(+x).toFixed(3);
export const PROXY = 'review/talk-proxy.mp4';
const newer = (a, b) => existsSync(a) && (!existsSync(b) || statSync(a).mtimeMs > statSync(b).mtimeMs);

export async function reviewExport(R, { notes = {}, title = '', covers = [], coverCut, stills, post, slug = path.basename(process.cwd()) } = {}) {
  mkdirSync('review', { recursive: true });

  // light copy of the take for live playback (seeks fast, keyframe every half second)
  if (newer('assets/talk.mp4', PROXY)) {
    console.log('review: making the light playback copy of the take…');
    execFileSync(FF, ['-v', 'error', '-y', '-i', 'assets/talk.mp4', '-an', '-vf', 'scale=540:960', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-g', '15', '-movflags', '+faststart', PROXY], { stdio: 'inherit' });
  }

  const n = R.F.length - 1;
  const pics = stills ? await renderFrames(R, { stills }) : [];
  const frames = Array.from({ length: n }, (_, i) => {
    const k = i + 1, w = R.win(k);
    const end = R.endInfo?.n === k; // the end card: no still of her (cover frame picker skips it)
    return { n: k, s: w.s, e: r2(w.s + w.d), img: pics[i] || null, still: stills && !end ? stills(k) : null, title: notes[k]?.title || (end ? R.endInfo.title : ''), soundNote: notes[k]?.sound || '', end };
  });
  const frameAt = (t) => frames.find((f) => t >= f.s - 0.001 && t < f.e)?.n ?? n;
  const words = R.W.map((w, i) => ({ i, w: w.w, s: r2(w.s), e: r2(w.e), frame: frameAt(w.s) }));

  const mp3s = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => f.replace(/\.mp3$/, '')) : []);
  const sfxLib = [...new Set([...mp3s(path.join(HERE, '../assets/sfx')), ...mp3s('assets/sfx')])].sort();
  const sfx = [...R.sfxData, ...R.sfxOff].sort((a, b) => a.t - b.t).map((s) => ({ id: s.id, name: s.name, base: s.base, t: r2(s.t), vol: s.vol, baseVol: s.baseVol, d: s.d, off: !!s.off, added: s.id.startsWith('add-'), frame: frameAt(s.t) }));
  const m = R.musicData;
  const musicLib = [...mp3s('assets/music').map((f) => `assets/music/${f}.mp3`), ...mp3s('assets/music-candidates').map((f) => `assets/music-candidates/${f}.mp3`)];

  // readable track names; a planned copy (assets/music/music-a.mp3) takes the name of the candidate it was copied from
  const nice = (f) => path.basename(f, '.mp3').replace(/^\d+-/, '').replace(/-/g, ' ');
  const musicNames = Object.fromEntries(musicLib.map((f) => [f, nice(f)]));
  for (const f of musicLib.filter((f) => f.startsWith('assets/music/'))) {
    const twin = musicLib.find((g) => g !== f && g.includes('candidates') && statSync(g).size === statSync(f).size);
    if (twin) musicNames[f] = nice(twin);
  }
  const musicLibOut = musicLib.filter((f) => !(f.includes('candidates') && musicLib.some((g) => g.startsWith('assets/music/') && musicNames[g] === musicNames[f])));
  const draft = [path.join(MEDIA.reelExportsDir, 'final', `${slug}.mp4`)].find(existsSync);
  const reel = {
    slug, title, made: new Date().toISOString(), dur: R.END ?? R.DUR, talkDur: R.DUR,
    covers: covers.map((c) => ({ text: c.text, plain: c.text.replace(/<\/?m>/g, ''), aside: c.aside || '' })), coverDefault: coverCut ? +(coverCut.match(/f(\d+)/)?.[1] || 1) : 1,
    // the CTA line goes in the draft caption (second sentence); her own caption edits on the page are left alone
    post: post ? { ...post, caption: withCtaLine(post.caption, R.endInfo?.caption) } : null,
    cta: R.endInfo?.cta || null, ctaLine: R.endInfo?.caption || '', ctaFrame: R.endInfo?.n || null, ctas: ctaList(), coverBgs: COVER_BGS, brands: brandList(), brand: R.B.name,
    frames, words, captions: R.captionList.map((c) => ({ i: c.i, s: r2(c.s), e: r2(c.e), t: c.t, frame: frameAt(c.s) })), sfx, sfxLib, sfxReel: mp3s('assets/sfx'),
    music: m && { file: m.baseFile, volume: m.volume, baseVolume: m.baseVolume, level: m.level, baseLevel: m.baseLevel, levels: m.levels, mix: m.mix, fadeIn: m.fadeIn, fadeOut: m.fadeOut },
    musicLevels: LEVELS,
    musicLib: musicLibOut, musicNames, transitions: R.transitions, look: R.look || null, lookFilter: lookFilter(R.look || {}),
    hasVideo: existsSync(PROXY), draft: draft ? { at: statSync(draft).mtime.toISOString() } : null,
  };
  writeFileSync('review/reel.json', JSON.stringify(reel, null, 1));
  console.log(`review/reel.json: ${words.length} words, ${n} beats, ${sfx.length} sounds, ${musicLib.length} music tracks, ${R.transitions.length} transitions, ${covers.length} cover lines${draft ? ', draft render' : ''}`);
}

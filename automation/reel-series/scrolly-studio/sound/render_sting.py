"""The Scrolly Studio opening sting: original tune options rendered from free CC0 samples (VSCO 2 CE).

Run:  ../../../carousels/.venv/Scripts/python.exe render_sting.py
Out:  out/sting-<id>.wav (48 kHz stereo, 6.0 s). Samples live in samples/ (git-ignored, re-download: README.md).

Timing (3/4 waltz, 90 BPM, so one bar = 2 s):
  bar 1 (0-2 s)   the tune, while she sits
  bar 2 (2-4 s)   the answer, rising; harp sweep on beat 3 as the curtains part
  4.0 s           landing chord as the world appears
  4.0-6.0 s       ring-out, faded to silence so the world's music can start
"""
import os, re, glob
import numpy as np
from scipy.io import wavfile

SR = 48000
BEAT = 60 / 90
BAR = 3 * BEAT
LAND = 2 * BAR  # 4.0 s
LENGTH = 6.0
HERE = os.path.dirname(os.path.abspath(__file__))
SAMPLES = os.path.join(HERE, 'samples')
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def midi(name):
    m = re.match(r'([A-G])(#|b)?(-?\d)', name)
    n = NOTE[m.group(1)] + {'#': 1, 'b': -1, None: 0}[m.group(2)]
    return 12 * (int(m.group(3)) + 1) + n


def load(path):
    rate, x = wavfile.read(path)
    if x.dtype.kind == 'i':
        x = x.astype(np.float32) / np.iinfo(x.dtype).max
    x = x.astype(np.float32)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    x = x[:, :2]
    if rate != SR:
        x = resample(x, SR / rate)
    # trim silence before the attack so notes land on time
    env = np.abs(x).max(1)
    on = np.argmax(env > env.max() * 0.03)
    return x[max(0, on - 64):]


def resample(x, factor):
    """Stretch length by factor (factor > 1 = longer). Used for pitch shifting too."""
    n = int(len(x) * factor)
    t = np.linspace(0, len(x) - 1, n)
    return np.stack([np.interp(t, np.arange(len(x)), x[:, c]) for c in range(2)], 1).astype(np.float32)


class Inst:
    """Picks the nearest sampled note and pitch-shifts it."""
    def __init__(self, folder, pattern=r'_([A-G]#?\d)'):
        self.notes = {}
        for f in glob.glob(os.path.join(SAMPLES, folder, '*.wav')):
            m = re.search(pattern, os.path.basename(f))
            if m:
                self.notes[midi(m.group(1))] = f
        self.cache = {}
        assert self.notes, f'no samples in {folder}'

    def note(self, m):
        if m not in self.cache:
            src = min(self.notes, key=lambda k: abs(k - m))
            x = load(self.notes[src])
            self.cache[m] = resample(x, 2 ** ((src - m) / 12)) if src != m else x
        return self.cache[m]


def place(buf, x, t, gain=1.0, dur=None, attack=0.0, release=0.25, pan=0.0):
    x = x.copy()
    if dur is not None:
        x = x[:int((dur + release) * SR)]
        r = int(release * SR)
        if len(x) > r:
            x[-r:] *= np.linspace(1, 0, r)[:, None]
    if attack:
        a = min(len(x), int(attack * SR))
        x[:a] *= np.linspace(0, 1, a)[:, None]
    x *= gain * np.array([1 - max(0, pan), 1 + min(0, pan)], np.float32)
    i = int(t * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[:j - i]


def place_peak_at(buf, x, t, gain=1.0):
    """Line a swell sample up so its loudest point hits time t (cymbal swell into the landing)."""
    peak = int(np.argmax(np.abs(x).max(1)))
    start = t - peak / SR
    if start < 0:
        x = x[int(-start * SR):]
        start = 0
    place(buf, x, start, gain)


# Each tune: bar 1 and bar 2 as (beat, midi note) pairs, D major. Landing chord is shared.
D = lambda s: midi(s)
TUNES = {
    # 1-3-5-6 lift, then a stepping answer that leans into the landing
    '1-jewelry-box': ([(0, D('A4')), (1, D('D5')), (1.5, D('F#5')), (2, D('A5'))],
                      [(0, D('B5')), (1, D('A5')), (1.5, D('F#5')), (2, D('E5'))]),
    # romantic leap of a sixth, then the same shape a step higher
    '2-curtain-rise': ([(0, D('D5')), (1, D('B5')), (1.5, D('A5')), (2, D('F#5'))],
                       [(0, D('E5')), (1, D('C#6')), (1.5, D('B5')), (2, D('A5'))]),
    # little waltz turn that sparkles upward
    '3-sparkle-turn': ([(0, D('F#5')), (0.5, D('G5')), (1, D('F#5')), (2, D('D6'))],
                       [(0, D('E5')), (0.5, D('F#5')), (1, D('E5')), (2, D('C#6'))]),
    # three-note chime, wide and bell-like (easy to hum back)
    '4-studio-chime': ([(0, D('D5')), (1, D('A5')), (2, D('F#5'))],
                       [(0, D('G5')), (1, D('B5')), (2, D('E6'))]),
}

# Waltz accompaniment: bass on beat 1, chord on beats 2 and 3
HARMONY = [(D('D3'), [D('A3'), D('D4'), D('F#4')]),   # bar 1: D
           (D('A2'), [D('G3'), D('C#4'), D('E4')])]   # bar 2: A7
LAND_CHORD = [D('D4'), D('F#4'), D('A4')]


def render(tid, melody):
    buf = np.zeros((int(LENGTH * SR), 2), np.float32)
    glock = Inst('glock', r'_([A-G]#?\d)\.wav')
    harp = Inst('harp', r'KSHarp_([A-G]#?\d)_')
    vc_p = Inst('vc_pizz', r'pizzT_([A-G]#?\d)_')
    vla_p = Inst('vla_pizz', r'_pizz_([A-G]#?\d)_')
    vln_p = Inst('vln_pizz', r'_Pizz_([A-G]#?\d)_')
    vln_s = Inst('vln_sus', r'_susVib_([A-G]#?\d)_')
    vc_s = Inst('vc_sus', r'susvib_([A-G]#?\d)_')
    perc = lambda f: load(os.path.join(SAMPLES, 'perc', f))

    for bar, (tune, (bass, chord)) in enumerate(zip(melody, HARMONY)):
        t0 = bar * BAR
        # the tune: glockenspiel doubled softly by harp an octave down for warmth
        for beat, m in tune:
            place(buf, glock.note(m), t0 + beat * BEAT, 0.55, pan=-0.1)
            place(buf, harp.note(m - 12), t0 + beat * BEAT, 0.35, dur=1.2, pan=0.15)
        place(buf, vc_p.note(bass), t0, 0.7, pan=-0.2)
        for beat in (1, 2):
            if bar == 1 and beat == 2:
                continue  # harp sweep takes beat 3 of bar 2
            for i, m in enumerate(chord):
                inst = vla_p if m < D('C#4') else vln_p
                place(buf, inst.note(m), t0 + beat * BEAT, 0.28, pan=0.25 - 0.1 * i)

    # harp sweep up a D major scale into the landing (curtains parting)
    scale = [D(n) for n in ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5',
                            'E5', 'F#5', 'G5', 'A5', 'B5', 'C#6']]
    start = LAND - BEAT * 0.95
    for i, m in enumerate(scale):
        place(buf, harp.note(m), start + i * (BEAT * 0.9 / len(scale)), 0.3 + 0.02 * i, dur=1.5,
              pan=-0.4 + 0.06 * i)
    # soft string swell under bar 2 that blooms into the landing
    for m in [D('A3'), D('C#4'), D('E4')]:
        place(buf, vln_s.note(m), BAR + BEAT, 0.12, dur=LAND - BAR - BEAT, attack=1.2, release=0.15)
    place_peak_at(buf, perc('susCymb1-cresc-Short_v1.wav'), LAND, 0.35)

    # landing: the "world appears" chord
    place(buf, vc_s.note(D('D2')), LAND, 0.45, dur=1.3, release=0.7)
    place(buf, vc_p.note(D('D2')), LAND, 0.8)
    for m in LAND_CHORD:
        place(buf, vln_s.note(m + 12), LAND, 0.22, dur=1.2, release=0.8)
        place(buf, harp.note(m), LAND, 0.4, dur=1.6)
    place(buf, harp.note(D('D3')), LAND, 0.5, dur=1.8)
    place(buf, glock.note(D('D6')), LAND, 0.6, pan=-0.1)
    place(buf, glock.note(D('A5')), LAND, 0.35, pan=0.1)
    place(buf, perc('Triangle6-Hit_v1_rr1_Sum.wav'), LAND, 0.35, pan=0.3)
    place(buf, perc('BellTree_Stroke1_v1_Sum.wav'), LAND + 0.05, 0.3, pan=-0.3)

    # fade the tail to silence by 6.0 s
    f0, f1 = int(5.0 * SR), len(buf)
    buf[f0:f1] *= np.linspace(1, 0, f1 - f0)[:, None] ** 1.5
    buf /= max(1e-6, np.abs(buf).max()) / 0.89  # peak at about -1 dBFS
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    out = os.path.join(HERE, 'out', f'sting-{tid}.wav')
    wavfile.write(out, SR, (buf * 32767).astype(np.int16))
    print('wrote', out)


if __name__ == '__main__':
    for tid, melody in TUNES.items():
        render(tid, melody)

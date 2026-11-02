"""Procedural score: 7 cues sharing one palette (felt piano, marimba, pizz
plucks, pads, strings, bells) and one recurring 4-note "lie motif":
E-D-C-G (scale degrees 3-2-1-5 in C major), varied per mood
(minor: C-B-A-E, ominous: E-D-C-G#, resolved: E-D-C ... C).
"""
import os
import numpy as np
from dsp import *  # noqa
import instruments as I

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'music')

# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------
CH = {
    'C': ['C3', 'G3', 'C4', 'E4'], 'Cmaj7': ['C3', 'G3', 'B3', 'E4'], 'Cadd9': ['C3', 'G3', 'D4', 'E4'],
    'Am': ['A2', 'E3', 'A3', 'C4'], 'Am7': ['A2', 'E3', 'G3', 'C4'],
    'F': ['F2', 'C3', 'F3', 'A3'], 'Fmaj7': ['F2', 'C3', 'E3', 'A3'],
    'Dm': ['D3', 'A3', 'D4', 'F4'], 'Dm7': ['D3', 'A3', 'C4', 'F4'],
    'G': ['G2', 'D3', 'G3', 'B3'], 'G7': ['G2', 'D3', 'F3', 'B3'], 'Gsus': ['G2', 'D3', 'G3', 'C4'],
    'E': ['E2', 'B2', 'E3', 'G#3'], 'Esus4': ['E2', 'B2', 'E3', 'A3'], 'E7': ['E2', 'B2', 'D3', 'G#3'],
    'A7': ['A2', 'E3', 'G3', 'C#4'], 'D7': ['D3', 'A3', 'C4', 'F#4'],
    'C/E': ['E2', 'G3', 'C4', 'E4'],
}
# upper-structure voicings for pads / strings (mid register)
PADV = {
    'C': ['C4', 'E4', 'G4'], 'Cmaj7': ['C4', 'E4', 'G4', 'B4'], 'Cadd9': ['C4', 'E4', 'G4', 'D5'],
    'Am': ['A3', 'C4', 'E4'], 'Am7': ['A3', 'C4', 'E4', 'G4'], 'F': ['F3', 'A3', 'C4'],
    'Fmaj7': ['F3', 'A3', 'C4', 'E4'], 'Dm': ['D4', 'F4', 'A4'], 'Dm7': ['D4', 'F4', 'A4', 'C5'],
    'G': ['G3', 'B3', 'D4'], 'G7': ['G3', 'B3', 'D4', 'F4'], 'Gsus': ['G3', 'C4', 'D4'],
    'E': ['E3', 'G#3', 'B3'], 'Esus4': ['E3', 'A3', 'B3'], 'E7': ['E3', 'G#3', 'B3', 'D4'],
    'A7': ['A3', 'C#4', 'E4', 'G4'], 'D7': ['D4', 'F#4', 'A4', 'C5'], 'C/E': ['E3', 'G3', 'C4'],
}
ROOT = {'C': 'C', 'Cmaj7': 'C', 'Cadd9': 'C', 'Am': 'A', 'Am7': 'A', 'F': 'F', 'Fmaj7': 'F', 'Dm': 'D',
        'Dm7': 'D', 'G': 'G', 'G7': 'G', 'Gsus': 'G', 'E': 'E', 'Esus4': 'E', 'E7': 'E', 'A7': 'A',
        'D7': 'D', 'C/E': 'E'}


def F(name):
    return hz(name)


def seq(s):
    """'E5:.5 D5:.5 r:1' -> [(beat_offset, dur, name_or_None)]"""
    out = []
    b = 0.0
    for tok in s.split():
        nn, d = tok.split(':')
        d = float(d)
        out.append((b, d, None if nn == 'r' else nn))
        b += d
    return out


def transpose(name, semis):
    return _mname(nm(name) + semis)


_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def _mname(m):
    return f'{_NAMES[m % 12]}{m // 12 - 1}'


class Score:
    def __init__(self, bpm, dur, seed=0, t0=0.0):
        self.spb = 60.0 / bpm
        self.bar = 4 * self.spb
        self.dur = dur
        self.n = ns(dur)
        self.rng = np.random.default_rng(seed)
        self.t0 = t0
        self.buses = {}

    def bus(self, name, send=0.2, gain=1.0):
        self.buses[name] = dict(buf=np.zeros((2, self.n)), send=send, gain=gain)

    def tb(self, beat):
        return self.t0 + beat * self.spb

    def put(self, bus, sig, beat, p=0.0, gain=1.0, jitter=0.004):
        t = self.tb(beat) + (self.rng.uniform(-jitter, jitter) if jitter else 0.0)
        t = max(t, 0.0)
        s = pan(sig, p) if sig.ndim == 1 else sig
        place(self.buses[bus]['buf'], s * gain, t)

    def mix(self, rt60=1.8, predelay=0.02, damp=0.5, seed=11, bright=1.0):
        dry = np.zeros((2, self.n))
        send = np.zeros((2, self.n))
        for b in self.buses.values():
            dry += b['buf'] * b['gain']
            send += b['buf'] * b['gain'] * b['send']
        wet = reverb(send, rt60=rt60, predelay=predelay, damp=damp, seed=seed, bright=bright,
                     low_cut=180)
        return dry + wet


def master(x, target=-16.0, ceiling=-1.3, fin=0.01, fout=1.5, comp=True, zero_ranges=()):
    x = remove_dc(x)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.5   # known level (-6 dBFS peak) into the bus compressor
    if comp:
        x = compress(x, thresh_db=-20, ratio=1.6, attack=0.03, release=0.3)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    x = soft_sat(x, 1.15)
    for it in range(3):
        L = lufs(x)
        x = x * undb(target - L)
        pre = db(np.max(np.abs(x)))
        x = limiter(x, ceiling, lookahead=0.005, release=0.12)
        if it == 0:
            print(f'    limiter max gain reduction {max(0.0, pre - ceiling):.1f} dB')
    x = fade(x, fin, 0)
    if fout:
        n = length(x)
        m = ns(fout)
        r = np.linspace(0, 1, m)
        x[:, n - m:] *= np.cos(r * np.pi / 2) ** 2
    mask = np.zeros(length(x), dtype=bool)
    for a, b in zero_ranges:
        mask[ns(a):ns(b)] = True
    x[:, mask] = 0.0
    return x, mask


def write_cue(name, x, mask=None):
    path = os.path.join(OUT, name + '.wav')
    write_wav(path, x, zero_mask=mask if (mask is not None and mask.any()) else None)
    pk = db(np.max(np.abs(x)))
    print(f'  music {name:16s} {length(x) / SR:6.2f}s  LUFS {lufs(x):6.2f}  peak {pk:6.2f} dBFS')
    return path


def _humanvel(rng, v, spread=0.06):
    return float(np.clip(v + rng.uniform(-spread, spread), 0.05, 1.0))


def melody(S, bus, notes, start_beat, inst, vel=0.6, p=0.0, gain=1.0, octave=0, **kw):
    for b, d, nn in seq(notes):
        if nn is None:
            continue
        name = transpose(nn, 12 * octave) if octave else nn
        sig = inst(F(name), d * S.spb, _humanvel(S.rng, vel), S.rng, **kw)
        S.put(bus, sig, start_beat + b, p, gain)


def _ipiano(f, d, v, rng, **kw):
    return I.piano(f, max(d, 0.15), v, rng, **kw)


def _imarimba(f, d, v, rng, **kw):
    return I.marimba(f, v, rng, **kw)


def _ipluck(f, d, v, rng, **kw):
    return I.pluck(f, v, rng, **kw)


def _ibell(f, d, v, rng, **kw):
    return I.soft_bell(f, v, rng, **kw)


# ----------------------------------------------------------------------------
# M1  curious / quirky  (92 BPM, 56.0 s, C major)
# ----------------------------------------------------------------------------
def m1_curious():
    S = Score(92, 56.0, seed=101)
    for b, sd in [('pad', 0.35), ('pizz', 0.18), ('bass', 0.1), ('mar', 0.25), ('bell', 0.4), ('perc', 0.1)]:
        S.bus(b, sd)
    S.buses['mar']['gain'] = 1.25
    bars = ['Cmaj7', 'Am7', 'Cmaj7', 'Am7', 'Dm7', 'G7'] + ['Cmaj7', 'Am7', 'Dm7', 'G7'] * 3 + ['Fmaj7', 'G7', 'C']
    r = S.rng
    for i, c in enumerate(bars):
        last = i == len(bars) - 1
        d = S.bar * 0.97
        amp = 0.55 if i < 2 else 0.45
        sig = I.pad([F(x) for x in PADV[c]], d if not last else 3.2, r, attack=1.4 if i == 0 else 0.35,
                    release=0.7 if not last else 1.6, cutoff=1300 if i < 6 else 1700, amp=amp)
        S.put('pad', sig, i * 4, gain=0.55 if i < 2 else 0.45, jitter=0)
    # pizzicato "tiptoe" from bar 2
    for i, c in enumerate(bars):
        if i < 2:
            continue
        root = ROOT[c]
        if c == 'C':
            S.put('bass', I.pluck(F('C2'), 0.85, r, t60=1.6), i * 4, 0, 1.0)
            continue
        r2 = F(root + '2')
        fifth = F(CH[c][1]) / 2 if F(CH[c][1]) / 2 > r2 else F(CH[c][1])
        S.put('bass', I.pluck(r2, 0.8, r, t60=0.8), i * 4, -0.05, 1.0)
        S.put('bass', I.pluck(fifth, 0.65, r, t60=0.7), i * 4 + 2, 0.05, 0.85)
        if c == 'G7' and i >= 9:
            # leading-tone pickup into the next C
            S.put('bass', I.pluck(F('B1'), 0.5, r, t60=0.5), i * 4 + 3.5, 0, 0.6)
        up = PADV[c]
        pat = [up[1], up[2], up[0], up[-1]] if i % 2 == 0 else [up[2], up[1], up[-1], up[0]]
        for k, off in enumerate([0.5, 1.5, 2.5, 3.5]):
            v = 0.45 + (0.12 if k == 0 else 0)
            S.put('pizz', I.pluck(F(pat[k]), v, r, t60=0.35, bright=0.4), i * 4 + off,
                  0.35 if k % 2 else -0.35, 0.55)
    # marimba melody (lie motif)
    A = 'E5:.5 D5:.5 C5:1 G4:2  r:1 A4:.5 C5:.5 E5:1 D5:1  F5:1 E5:.5 D5:.5 C5:1 A4:1  B4:1 D5:1 G4:1.5 r:.5'
    B = ('E5:.5 D5:.5 C5:.5 G4:.5 C5:.5 E5:.5 G5:1  A5:1 G5:.5 E5:.5 C5:1 r:1  '
         'D5:.5 E5:.5 F5:1 A5:1 F5:1  D5:.5 B4:.5 G4:1 r:1 G4:.5 B4:.5')
    A2 = 'E5:.5 D5:.5 C5:1 G4:2  r:1 A4:.5 C5:.5 E5:1 D5:1  F5:1 E5:.5 D5:.5 C5:1 A4:1  B4:1 D5:1 F5:1 D5:1'
    melody(S, 'mar', A, 6 * 4, _imarimba, vel=0.62, p=0.1)
    melody(S, 'mar', B, 10 * 4, _imarimba, vel=0.66, p=0.1)
    melody(S, 'mar', A2, 14 * 4, _imarimba, vel=0.7, p=0.1)
    melody(S, 'bell', A2, 14 * 4, _ibell, vel=0.18, p=-0.25, octave=1)
    # bell answers in B section (end of bars)
    for bb, nts in [(11, 'r:2 E6:.5 D6:.5 C6:1'), (13, 'r:3 G5:.5 B5:.5')]:
        melody(S, 'bell', nts, bb * 4, _ibell, vel=0.22, p=-0.4)
    # outro fragments
    melody(S, 'mar', 'E5:.5 D5:.5 C5:1 r:2  r:2 D5:.5 B4:.5 G4:1', 18 * 4, _imarimba, vel=0.55, p=0.1)
    melody(S, 'bell', 'r:2 E6:.5 D6:.5 C6:1', 19 * 4, _ibell, vel=0.15, p=-0.3)
    melody(S, 'mar', 'C5:2', 20 * 4, _imarimba, vel=0.6, p=0.1)
    melody(S, 'mar', 'C4:2', 20 * 4, _imarimba, vel=0.45, p=-0.1)
    melody(S, 'bell', 'r:1.5 G6:1', 20 * 4, _ibell, vel=0.18, p=0.4)
    # light percussion
    for i in range(6, 20):
        for k in range(8):
            v = 0.32 if k % 2 else 0.2
            S.put('perc', I.shaker(v, r), i * 4 + k * 0.5, 0.3, 0.8)
        if i >= 10:
            S.put('perc', I.kick_soft(0.55, r), i * 4, 0, 0.9)
            S.put('perc', I.kick_soft(0.4, r), i * 4 + 2, 0, 0.9)
        if 14 <= i < 18:
            S.put('perc', I.snap(0.4, r), i * 4 + 1, -0.3, 0.8)
            S.put('perc', I.snap(0.4, r), i * 4 + 3, -0.3, 0.8)
    x = S.mix(rt60=1.6, predelay=0.02, damp=0.45)
    x, m = master(x, fout=1.5)
    return x, m


# ----------------------------------------------------------------------------
# M2  playful comedy  (112 BPM, 35.0 s)
# ----------------------------------------------------------------------------
def m2_comedy():
    S = Score(112, 35.0, seed=202)
    for b, sd in [('bass', 0.06), ('stab', 0.15), ('mar', 0.2), ('bell', 0.35), ('perc', 0.12), ('pad', 0.3)]:
        S.bus(b, sd)
    S.buses['mar']['gain'] = 1.2
    r = S.rng
    bars = ['C'] + ['C', 'A7', 'Dm', 'G7'] * 2 + ['Am', 'D7', 'Dm7', 'G7']
    # bars 0..12 one chord each; 13: C|A7, 14: Dm|G7, 15: C (hit)
    half = {13: ('C', 'A7'), 14: ('Dm', 'G7')}
    roots2 = {'C': 'C3', 'A7': 'A2', 'Dm': 'D3', 'Dm7': 'D3', 'G7': 'G2', 'Am': 'A2', 'D7': 'D3'}

    def bass_note(name, beat, v=0.8):
        S.put('bass', I.marimba(F(name), v, r, max_len=0.6, mallet_hard=0.3), beat, -0.05, 1.0)
        S.put('bass', I.pluck(F(name), v * 0.8, r, t60=0.35, bright=0.3), beat, 0.05, 0.7)

    def fifth_of(root):
        return transpose(root, 7)

    def chord_stab(c, beat, v=0.45):
        for k, nn in enumerate(PADV[c][:3]):
            S.put('stab', I.pluck(F(transpose(nn, 12 if nm(nn) < nm('E4') else 0)), v, r, t60=0.25, bright=0.5),
                  beat + 0.01 * k, (-0.3 + 0.3 * k), 0.45)

    for i in range(15):
        if i in half:
            for h, c in enumerate(half[i]):
                bass_note(roots2[c], i * 4 + 2 * h)
                chord_stab(c, i * 4 + 2 * h + 1)
            continue
        c = bars[i]
        rt = roots2[c]
        bass_note(rt, i * 4)
        bass_note(fifth_of(rt) if nm(fifth_of(rt)) < nm('A3') else transpose(fifth_of(rt), -12), i * 4 + 2, 0.7)
        if i >= 1:
            chord_stab(c, i * 4 + 1)
            chord_stab(c, i * 4 + 3)
        nxt = bars[i + 1] if i + 1 < len(bars) else ('C' if i == 12 else None)
        if i in (12,):
            nxt = 'C'
        if nxt and i >= 1:
            approach = transpose(roots2[nxt], -1 if (i % 2) else 1)
            bass_note(approach, i * 4 + 3.5, 0.55)
    # final hit
    S.put('bass', I.marimba(F('C2'), 0.9, r, max_len=2.0, mallet_hard=0.3), 15 * 4, 0, 1.2)
    S.put('bass', I.pluck(F('C2'), 0.9, r, t60=1.5), 15 * 4, 0, 0.9)
    for k, nn in enumerate(['C4', 'E4', 'G4', 'C5', 'E5', 'G5']):
        S.put('mar', I.marimba(F(nn), 0.7, r), 15 * 4, -0.5 + 0.2 * k, 0.6)
    S.put('bell', I.soft_bell(F('C6'), 0.3, r), 15 * 4, 0.2)
    S.put('bell', I.soft_bell(F('G6'), 0.2, r), 15 * 4 + 0.5, -0.2)
    S.put('pad', I.pad([F(x) for x in PADV['C']], 1.5, r, attack=0.05, release=1.3, cutoff=2000, amp=0.4), 15 * 4)
    # melody
    A = ('E5:.5 D5:.5 C5:.5 r:.5 G4:.5 r:.25 G4:.25 A4:.5 B4:.5  '
         'C#5:.5 E5:.5 A5:.5 r:.5 G5:.5 E5:.5 C#5:1  '
         'D5:.5 F5:.5 A5:.5 F5:.5 D5:1 r:.5 A4:.5  '
         'B4:.5 D5:.5 F5:.5 E5:.5 D5:.5 B4:.5 G4:.5 r:.5')
    A2 = A.rsplit('  ', 1)[0] + '  B4:.5 D5:.5 G5:1 F5:.5 D5:.5 B4:1'
    B = ('A4:.25 r:.25 A4:.25 r:.25 C5:.5 E5:.5 D#5:.25 E5:.75 r:1  '
         'F#5:.5 E5:.5 D5:.5 C5:.5 A4:1 r:1  '
         'F5:.25 r:.25 F5:.25 r:.25 A5:.5 G5:.5 F5:.5 D5:.5 r:1  '
         'G5:.5 F5:.5 E5:.5 D5:.5 B4:1 G4:1')
    END = 'E5:.5 D5:.5 C5:.5 G4:.5 A4:.5 C#5:.5 E5:1  F5:.5 A5:.5 D5:1 G4:.5 r:.5 G4:.25 r:.25 G4:.5'
    kw = dict(max_len=0.9, mallet_hard=0.8)
    melody(S, 'mar', A, 1 * 4, _imarimba, vel=0.7, p=0.15, **kw)
    melody(S, 'mar', A2, 5 * 4, _imarimba, vel=0.72, p=0.15, **kw)
    melody(S, 'mar', B, 9 * 4, _imarimba, vel=0.7, p=0.15, **kw)
    melody(S, 'bell', B, 9 * 4, _ibell, vel=0.12, p=-0.3, octave=1, length_s=1.0)
    melody(S, 'mar', END, 13 * 4, _imarimba, vel=0.75, p=0.15, **kw)
    melody(S, 'bell', A2, 5 * 4, _ibell, vel=0.1, p=-0.3, octave=1, length_s=1.0)
    # percussion: claps on 2 & 4, shaker 8ths, soft kick on 1 & 3
    for i in range(1, 15):
        for k in range(4):
            if k in (1, 3):
                S.put('perc', I.clap(0.55, r), i * 4 + k, 0.1, 0.9)
            else:
                S.put('perc', I.kick_soft(0.6, r), i * 4 + k, 0, 0.9)
        for k in range(8):
            S.put('perc', I.shaker(0.35 if k % 2 else 0.22, r), i * 4 + k * 0.5, -0.35, 0.8)
    S.put('perc', I.kick_soft(0.8, r), 15 * 4, 0, 1.0)
    S.put('perc', I.clap(0.6, r), 15 * 4, 0.1, 0.8)
    S.put('perc', I.cym_swell(S.spb * 2, r), 14 * 4 + 2, 0, 0.12, jitter=0)
    x = S.mix(rt60=1.2, predelay=0.015, damp=0.5)
    x, m = master(x, fout=1.5)
    return x, m


# ----------------------------------------------------------------------------
# M3  tension  (96 BPM, 35.0 s, A minor)
# ----------------------------------------------------------------------------
def m3_tension():
    S = Score(96, 35.0, seed=303)
    for b, sd in [('pulse', 0.08), ('pad', 0.3), ('pno', 0.45), ('str', 0.35), ('perc', 0.15), ('fx', 0.4)]:
        S.bus(b, sd)
    r = S.rng
    bars = ['Am', 'Am', 'F', 'F', 'Dm', 'Dm', 'E', 'E', 'Am', 'F', 'Dm', 'E7', 'Am', 'E']
    # pulsing low synth eighths
    for i, c in enumerate(bars):
        lo = {'A': F('A1'), 'F': F('F1'), 'D': F('D2'), 'E': F('E1')}[ROOT[c]]
        for k in range(8):
            octv = 2 if k in (3, 6) else 1
            acc = 0.95 if k == 0 else (0.75 if k % 2 == 0 else 0.6)
            grow = 0.75 + 0.25 * i / 13
            S.put('pulse', I.bass_synth(lo * octv, S.spb * 0.45, acc * grow, r, tau=0.12, cutoff_k=0.45),
                  i * 4 + k * 0.5, 0, 0.6, jitter=0.002)
    # slow rising pad (one long render per chord, global brightness + level ramp)
    T = S.n
    tt = tvec(T)
    ramp = np.clip(tt / 33.0, 0, 1)
    padbuf = np.zeros((2, T))
    for i, c in enumerate(bars):
        sig = I.pad([F(x) for x in PADV[c]] + [F(PADV[c][0]) * 2], S.bar * 0.97, r, attack=0.6, release=0.8,
                    cutoff=2600, amp=0.5, detune_cents=12)
        place(padbuf, sig, S.tb(i * 4), edge_fade=True)
    dark = lp(padbuf, 500, 2)
    padbuf = dark * (1 - ramp) + padbuf * ramp
    padbuf *= undb(-10 + 10 * ramp)
    S.buses['pad']['buf'] += padbuf
    # lie motif in minor on felt piano: C-B-A-E
    mot = 'C5:1 B4:1 A4:1 E4:3'
    for st, v, octv in [(2, 0.5, 0), (6, 0.55, 0), (8, 0.6, 1), (10, 0.6, 0)]:
        melody(S, 'pno', mot, st * 4, _ipiano, vel=v, p=0.15, octave=octv, release=0.8)
    melody(S, 'pno', 'C6:1 B5:1 A5:2', 12 * 4, _ipiano, vel=0.55, p=0.15, release=1.2)
    # strings double the motif at bar 8 and hold tension
    S.put('str', I.strings([F('C5'), F('A4')], S.spb * 1, r, attack=0.3, release=0.6, amp=0.5), 8 * 4)
    S.put('str', I.strings([F('B4'), F('G#4')], S.spb * 1, r, attack=0.2, release=0.6, amp=0.5), 8 * 4 + 1)
    S.put('str', I.strings([F('A4'), F('E4')], S.spb * 1, r, attack=0.2, release=0.6, amp=0.5), 8 * 4 + 2)
    S.put('str', I.strings([F('E4'), F('B3')], S.spb * 3, r, attack=0.2, release=1.0, amp=0.5), 8 * 4 + 3)
    for bar, chord, amp in [(10, ['D4', 'F4', 'A4'], 0.42), (11, ['E4', 'G#4', 'B4', 'D5'], 0.45),
                            (12, ['A3', 'E4', 'B4', 'C5'], 0.48), (13, ['G#3', 'E4', 'B4', 'D5'], 0.5)]:
        S.put('str', I.strings([F(x) for x in chord], S.bar * 0.97, r, attack=1.5 if bar == 10 else 0.6,
                               release=0.8 if bar < 13 else 1.5, amp=amp), bar * 4, jitter=0)
    # ticking hats (16ths, accented 8ths) from bar 2
    for i in range(2, 14):
        for k in range(16):
            v = 0.5 if k % 4 == 0 else (0.35 if k % 2 == 0 else 0.2)
            S.put('perc', I.hat_tick(v, r), i * 4 + k * 0.25, 0.35 if k % 2 else 0.2, 0.7, jitter=0.002)
    for b in (4, 8, 12):
        S.put('perc', I.boom(0.7 if b < 12 else 0.85, r), b * 4, 0, 0.9)
    S.put('fx', I.cym_swell(S.bar, r), 11 * 4, 0, 0.18, jitter=0)
    S.put('fx', I.cym_swell(S.bar * 0.5, r), 7 * 4 + 2, 0, 0.12, jitter=0)
    x = S.mix(rt60=2.0, predelay=0.025, damp=0.55)
    x, m = master(x, fout=2.0)
    return x, m


# ----------------------------------------------------------------------------
# M4  tender / sad  (68 BPM, 75.0 s, A minor / F major) with true silence
# ----------------------------------------------------------------------------
def _tender_section(S, bars, lh_start, mel, vel_lh=0.32, vel_rh=0.5, str_from=4, str_amp=0.35,
                    last_bar_sustain=None, first_single=None):
    r = S.rng
    for i, c in enumerate(bars):
        if i < lh_start:
            continue
        ch = CH[c]
        bass = ch[0]
        last = (i == len(bars) - 1)
        hold = (last_bar_sustain if last and last_bar_sustain else S.bar * 1.05)
        S.put('pno', I.piano(F(bass), hold, _humanvel(r, vel_lh + 0.05), r, release=0.6), i * 4, -0.2)
        if not last:
            arp = [ch[1], ch[2], ch[3]]
            for k, nn in enumerate(arp):
                S.put('pno', I.piano(F(nn), S.spb * (3 - k) + 0.3, _humanvel(r, vel_lh - 0.04), r, release=0.6),
                      i * 4 + 1 + k, -0.1 + 0.05 * k)
        else:
            for k, nn in enumerate(ch[1:]):
                S.put('pno', I.piano(F(nn), hold, _humanvel(r, vel_lh), r, release=0.8), i * 4 + 0.03 * (k + 1), -0.1)
        if i >= str_from:
            sd = S.bar * (1.0 if not last else 0.9)
            S.put('str', I.strings([F(x) for x in PADV[c]], sd, r, attack=1.6 if i == str_from else 0.7,
                                   release=0.8 if not last else 1.6, cutoff=1900,
                                   amp=str_amp), i * 4, 0, jitter=0)
    melody(S, 'mel', mel, 0, _ipiano, vel=vel_rh, p=0.15, release=0.7)


def m4_tender():
    dur = 75.0
    n = ns(dur)
    # --- section 1: 0 .. 42.0 s
    S1 = Score(68, dur, seed=404)
    for b, sd in [('pno', 0.4), ('str', 0.4), ('mel', 0.42)]:
        S1.bus(b, sd)
    S1.buses['mel']['gain'] = 1.25
    bars1 = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C/E', 'Dm', 'Esus4']
    mel1 = ('r:4 r:4 '
            'E5:2 D5:1 C5:1  G4:3 r:1  '
            'A4:1 C5:1 E5:1.5 D5:.5  C5:3 r:1  '
            'E5:2 D5:1 C5:1  G4:2 B4:1 D5:1  '
            'E5:1.5 D5:.5 C5:1 A4:1  G4:2 C5:2  '
            'F5:1 E5:1 D5:1 C5:1  B4:3')
    _tender_section(S1, bars1, 0, mel1, last_bar_sustain=3.2, str_amp=0.14, vel_lh=0.28)
    x1 = S1.mix(rt60=2.6, predelay=0.03, damp=0.6)
    # natural decay into the silence: fade 40.4 -> 42.0, then hard zero
    a, b = ns(40.4), ns(42.0)
    w = np.cos(np.linspace(0, 1, b - a) * np.pi / 2) ** 2
    x1[:, a:b] *= w
    x1[:, b:] = 0.0
    # --- section 2: from 45.5 s
    S2 = Score(68, dur, seed=405, t0=45.5)
    for b, sd in [('pno', 0.4), ('str', 0.42), ('mel', 0.42)]:
        S2.bus(b, sd)
    S2.buses['mel']['gain'] = 1.25
    bars2 = ['F', 'C', 'Am', 'F', 'C', 'G', 'F', 'Cadd9']
    r = S2.rng
    # single piano note alone at 45.5 s
    S2.put('pno', I.piano(F('C5'), S2.spb * 2.2, 0.42, r, release=0.8), 0, 0.15, jitter=0)
    mel2 = ('r:4 '
            'E5:2 D5:1 C5:1  A4:3 C5:1  '
            'A4:1 C5:1 F5:2  E5:2 D5:1 C5:1  '
            'D5:2 B4:1 G4:1  A4:1 C5:1 E5:2  D5:1 C5:3')
    # LH enters at beat 2 of bar 0 (bass F2 + fifth), then full pattern from bar 1
    S2.put('pno', I.piano(F('F2'), S2.spb * 2.2, 0.3, r, release=0.6), 2, -0.2)
    S2.put('pno', I.piano(F('C3'), S2.spb * 1.4, 0.26, r, release=0.6), 3, -0.1)
    _tender_section(S2, bars2, 1, mel2, vel_lh=0.3, vel_rh=0.52, str_from=1, str_amp=0.19,
                    last_bar_sustain=4.6)
    S2.put('str', I.strings([F('F3'), F('A3'), F('C4')], S2.bar * 0.6, r, attack=2.5, release=1.5,
                            cutoff=1500, amp=0.16), 1.5, 0, jitter=0)
    # strings re-enter gently and warm up over the section
    S2.buses['str']['buf'] *= np.interp(tvec(S2.n), [45.5, 48.0, 60.0], [0.45, 0.55, 1.0])
    # warm bell at the final chord
    S2.put('str', I.soft_bell(F('G5'), 0.12, r, length_s=4.0), 7 * 4 + 1, 0.3)
    S2.put('str', I.soft_bell(F('E6'), 0.1, r, length_s=4.0), 7 * 4 + 2, -0.3)
    x2 = S2.mix(rt60=2.6, predelay=0.03, damp=0.6)
    x2[:, :ns(45.5)] = 0.0
    x = x1 + x2
    x, m = master(x, fout=1.5, zero_ranges=[(42.0, 45.5)], comp=False)
    return x, m


# ----------------------------------------------------------------------------
# M5  emotional reveal  (72 BPM, 56.0 s)
# ----------------------------------------------------------------------------
def m5_reveal():
    dur = 56.0
    S = Score(72, dur, seed=505)
    for b, sd in [('pno', 0.35), ('str', 0.4), ('low', 0.3), ('vln', 0.4), ('bell', 0.5), ('fx', 0.45)]:
        S.bus(b, sd)
    r = S.rng
    bars = ['Am', 'F', 'C', 'G'] * 3 + ['F', 'G', 'C', 'C']
    T = S.n
    tt = tvec(T)
    # global intensity curve: builds, peaks 45..52 s, decays to 0 by ~55.5 s
    inten = np.interp(tt, [0, 6.7, 13.3, 26.7, 40, 45, 52, 54, 55.5, 56],
                      [0.15, 0.25, 0.35, 0.55, 0.78, 1.0, 1.0, 0.45, 0.0, 0.0])

    def I_at(beat):
        return float(np.interp(S.tb(beat), tt, inten))

    # piano arpeggios: 8ths, 16ths from bar 8
    for i, c in enumerate(bars):
        ch = CH[c]
        up = [ch[0], ch[1], ch[2], ch[3], transpose(ch[2], 12), ch[3], ch[2], ch[1]]
        sub = 2 if i < 8 else 4
        steps = 4 * sub
        for k in range(steps):
            if i == 15 and k > 0:
                break
            nn = up[k % 8]
            if sub == 4 and k >= 8:
                nn = transpose(nn, 12) if nm(nn) < nm('C5') else nn
            beat = i * 4 + k / sub
            v = 0.25 + 0.45 * I_at(beat) + (0.08 if k % sub == 0 else 0)
            d = S.spb * (1.5 if k == 0 else 0.8)
            if i == 15:
                d = S.bar
            S.put('pno', I.piano(F(nn), d, _humanvel(r, v, 0.04), r, release=0.5, bright=0.2 * I_at(beat)),
                  beat, -0.15 + 0.3 * (k % 8) / 7, 0.8)
        if i >= 12:
            # octave bass reinforcement
            S.put('pno', I.piano(F(transpose(ch[0], -12)), S.bar, 0.6, r, release=0.6), i * 4, -0.2, 0.7)
    # final low C
    S.put('pno', I.piano(F('C2'), 3.0, 0.55, r, release=1.0), 15 * 4, -0.2, 0.8)
    # low strings from bar 2
    for i, c in enumerate(bars):
        if i < 2:
            continue
        rt = CH[c][0]
        lo = transpose(rt, -12) if nm(rt) >= nm('E3') else rt
        S.put('low', I.strings([F(lo), F(lo) * 2], S.bar * 0.97, r, attack=0.6, release=0.6, cutoff=1200, amp=0.5),
              i * 4, 0, I_at(i * 4) ** 1.2, jitter=0)
    # mid string pad from bar 4 (brightness follows intensity)
    for i, c in enumerate(bars):
        if i < 4:
            continue
        nb = S.bar * 0.97 if i < 15 else S.bar * 0.7
        g = I_at(i * 4 + 2)
        sig = I.strings([F(x) for x in PADV[c]] + [F(PADV[c][0]) * 2], nb, r, attack=1.2 if i == 4 else 0.6,
                        release=0.8 if i < 15 else 1.6,
                        cutoff=1200 + 3200 * g, amp=0.55)
        S.put('str', sig, i * 4, 0, g, jitter=0)
    # violins: augmented lie motif, climax states it at the top
    vl = [(8, [('E5', 2), ('D5', 1), ('C5', 1)]), (9, [('G4', 4)]), (10, [('E5', 2), ('G5', 2)]),
          (11, [('D5', 4)]), (12, [('A5', 2), ('C6', 2)]), (13, [('B5', 2), ('D6', 2)]),
          (14, [('E6', 2), ('D6', 1), ('C6', 1)]), (15, [('G5', 4)])]
    for bar, notes in vl:
        b = 0
        for nn, d in notes:
            beat = bar * 4 + b
            g = I_at(beat)
            sig = I.strings([F(nn), F(nn) / 2], S.spb * d * 1.02, r, attack=0.25 + 0.1 * d, release=0.5 if bar < 15 else 2.0,
                            cutoff=2500 + 2500 * g, voices=6, amp=0.75, vib_depth=0.004)
            S.put('vln', sig, beat, 0.15, 0.4 + 0.6 * g, jitter=0)
            b += d
    # piano RH motif (bars 4-7)
    melody(S, 'pno', 'E5:2 D5:1 C5:1  G4:4  E5:2 D5:1 C5:1  D5:4', 4 * 4, _ipiano, vel=0.55, p=0.2, release=0.8)
    # bells on the climax
    melody(S, 'bell', 'A5:2 C6:2  B5:2 D6:2  E6:2 D6:1 C6:1  G5:4', 12 * 4, _ibell, vel=0.18, p=-0.3, octave=1)
    # booms + swell into the arrival (bar 14 = 46.7 s)
    S.put('fx', I.boom(0.5, r, 3.0), 12 * 4, 0, 0.9)
    S.put('fx', I.cym_swell(S.bar, r), 13 * 4, 0, 0.22, jitter=0)
    S.put('fx', I.boom(0.85, r, 4.0), 14 * 4, 0, 1.0)
    S.put('fx', I.cym_swell(S.bar, r), 7 * 4, 0, 0.1, jitter=0)
    x = S.mix(rt60=2.8, predelay=0.03, damp=0.55)
    # conductor: overall dynamic arc (about -9 dB at the start -> 0 dB at the peak)
    x *= undb(-9.0 + 9.0 * np.clip((inten - 0.15) / 0.85, 0, 1))
    # decay to silence by 56.0 s
    a, b = ns(52.5), ns(55.8)
    x[:, a:b] *= np.cos(np.linspace(0, 1, b - a) * np.pi / 2) ** 2
    x[:, b:] = 0.0
    x, m = master(x, fout=0.2, comp=False)
    return x, m


# ----------------------------------------------------------------------------
# M6  warm resolution  (80 BPM, 20.0 s, C major)
# ----------------------------------------------------------------------------
def m6_resolve():
    S = Score(80, 20.0, seed=606)
    for b, sd in [('pno', 0.38), ('pad', 0.4), ('bell', 0.5), ('mel', 0.4)]:
        S.bus(b, sd)
    S.buses['mel']['gain'] = 1.3
    r = S.rng
    bars = ['C', 'Am', 'F', 'G', 'F', 'C']
    for i, c in enumerate(bars):
        last = i == len(bars) - 1
        segs = [(c, 0, 4)] if i != 4 else [('F', 0, 2), ('G', 2, 2)]
        for cc, off, ln in segs:
            ch = CH[cc]
            S.put('pno', I.piano(F(ch[0]), S.spb * ln * (1.6 if last else 1.0), 0.42, r, release=0.8), i * 4 + off, -0.2)
            if last:
                for k, nn in enumerate(ch[1:]):
                    S.put('pno', I.piano(F(nn), 4.5, 0.36, r, release=1.0), i * 4 + 0.04 * (k + 1), -0.1)
            else:
                for k in range(1, ln):
                    nn = ch[1 + (k - 1) % 3]
                    S.put('pno', I.piano(F(nn), S.spb * (ln - k) + 0.2, _humanvel(r, 0.32), r, release=0.6),
                          i * 4 + off + k, -0.1)
            S.put('pad', I.pad([F(x) for x in PADV[cc]], S.spb * ln * (1.0 if not last else 1.3), r,
                               attack=0.8 if i == 0 else 0.4, release=0.7 if not last else 1.6, cutoff=1500,
                               amp=0.34), i * 4 + off, jitter=0)
    mel = ('E5:1.5 D5:.5 C5:1 G4:1  A4:1 C5:1 E5:2  F5:1 E5:1 D5:1 C5:1  D5:2 G4:1 B4:1  '
           'C5:1 A4:1 B4:1 D5:1  E5:1 D5:1 C5:3')
    melody(S, 'mel', mel, 0, _ipiano, vel=0.55, p=0.15, release=0.8)
    melody(S, 'bell', 'C5:1 A4:1 B4:1 D5:1  E5:1 D5:1 C5:2', 4 * 4, _ibell, vel=0.16, p=-0.3, octave=1)
    for k, nn in enumerate(['C6', 'E6', 'G6', 'C7']):
        S.put('bell', I.soft_bell(F(nn), 0.12, r, length_s=4.0), 5 * 4 + 2 + k * 0.5, -0.4 + 0.25 * k)
    x = S.mix(rt60=2.4, predelay=0.03, damp=0.5)
    x, m = master(x, fout=1.5)
    return x, m


# ----------------------------------------------------------------------------
# M7  cliffhanger  (70 BPM, 25.0 s)
# ----------------------------------------------------------------------------
def m7_cliffhanger():
    dur = 25.0
    S = Score(70, dur, seed=707)
    for b, sd in [('drone', 0.25), ('box', 0.55), ('pulse', 0.1), ('str', 0.45)]:
        S.bus(b, sd)
    r = S.rng
    T = S.n
    tt = tvec(T)
    dr = I.drone([F('A1'), F('E2'), F('A2')], dur, r, cutoff=420, wobble=0.12, amp=0.55)
    dr *= np.interp(tt, [0, 3, 18, 21, 25], [0.0, 0.8, 1.0, 0.7, 0.5])
    S.buses['drone']['buf'] += dr
    # heartbeat pulse on each beat (70 BPM) until the final chord
    for k in range(2, 21):
        v = 0.55 + 0.25 * min(k, 14) / 14
        S.put('pulse', I.heart_pulse(v, r), k, 0, 0.9, jitter=0.0)
    # music box lie motif, ominous (E-D-C-G#), slightly detuned / warbly
    def box(notes, start, vel, cents_sd, octave=0):
        for b, d, nn in seq(notes):
            if nn is None:
                continue
            name = transpose(nn, 12 * octave)
            cents = float(np.clip(r.normal(0, cents_sd), -30, 30))
            S.put('box', I.music_box(F(name), vel, r, length_s=2.5, detune_cents=cents), start + b,
                  r.uniform(-0.3, 0.3))
    box('E5:1 D5:1 C5:1 G#4:1', 4, 0.5, 10)
    box('E5:1 D5:1 C5:1 G#4:1', 10, 0.5, 15)
    box('E6:1 D6:1 C6:1 G#5:1', 10.02, 0.22, 20)
    box('E5:1 D5:1 C5:2', 16, 0.48, 18)
    box('B5:4', 21, 0.35, 12)
    # high tremolo strings creeping in
    trem = I.strings([F('E5'), F('A5')], S.bar * 2.2, r, attack=3.0, release=1.5, cutoff=3000, amp=0.3)
    tm = 1 - 0.5 * (0.5 + 0.5 * np.sin(TWO_PI * 9 * tvec(length(trem))))
    S.put('str', trem * tm, 8, 0, 0.6, jitter=0)
    # final unresolved chord: F - B - E - A (Fmaj7#11, no 5th) from beat 20 (~17.1 s)
    fin = I.strings([F('F2'), F('F3'), F('B3'), F('E4'), F('A4')], 8.5, r, attack=1.8, release=0.1,
                    cutoff=2200, amp=0.75)
    S.put('str', fin, 20, 0, 1.0, jitter=0)
    S.put('str', I.pad([F('F3'), F('B3'), F('E4'), F('A4')], 8.5, r, attack=1.5, release=0.1, cutoff=1300,
                       amp=0.4), 20, 0, 1.0, jitter=0)
    S.put('box', I.boom(0.6, r, 4.0), 20, 0, 0.6)
    x = S.mix(rt60=3.0, predelay=0.04, damp=0.5)
    x, m = master(x, fout=3.5)
    return x, m


CUES = {
    'm1_curious': (m1_curious, 56.0, '92 BPM curious/quirky: pizz plucks, marimba, soft pad, shaker; introduces the lie motif'),
    'm2_comedy': (m2_comedy, 35.0, '112 BPM bouncy comedy: marimba/pluck oom-pah bass, claps on 2&4, cheeky melody, button ending'),
    'm3_tension': (m3_tension, 35.0, '96 BPM uneasy tension: pulsing low synth 8ths, ticking hats, rising pad, lie motif in minor; 2 s fade'),
    'm4_tender': (m4_tender, 75.0, '68 BPM tender: felt piano + warm strings; TRUE SILENCE 42.0-45.5 s, resumes with a single piano note'),
    'm5_reveal': (m5_reveal, 56.0, '72 BPM emotional reveal: piano arpeggios + swelling strings, peak 45-52 s, silent by 56 s'),
    'm6_resolve': (m6_resolve, 20.0, '80 BPM warm resolution in C: piano + pad + soft bells, lie motif resolves to the tonic'),
    'm7_cliffhanger': (m7_cliffhanger, 25.0, '70 BPM ominous: low drone, detuned music-box motif, heartbeat pulse, unresolved chord fade'),
}


def make_music(names=None):
    out = {}
    for name, (fn, dur, desc) in CUES.items():
        if names and name not in names:
            continue
        x, mask = fn()
        assert length(x) == ns(dur), (name, length(x))
        path = write_cue(name, x, mask)
        out[name] = (path, dur, desc)
    return out


if __name__ == '__main__':
    import sys
    make_music(sys.argv[1:] or None)

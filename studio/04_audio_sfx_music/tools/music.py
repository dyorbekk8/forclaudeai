"""Documentary tension bed in D minor, ~90 BPM. Writes ../music/*.wav at -20 LUFS."""
import os
import numpy as np
import pyloudnorm as pyln
from scipy import signal
from common import SR, rng, lp, hp, bp, remove_dc, write, fade, limiter

OUT = os.path.join(os.path.dirname(__file__), '..', 'music')
os.makedirs(OUT, exist_ok=True)

BPM = 90
BEAT = 60 / BPM
BAR = 4 * BEAT


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def polyblep_saw(freq, n, phase0=0.0):
    dt = freq / SR
    phase = (phase0 + dt * np.arange(n)) % 1.0
    y = 2 * phase - 1
    # polyBLEP correction
    m1 = phase < dt
    t1 = phase[m1] / dt
    y[m1] -= t1 + t1 - t1 * t1 - 1
    m2 = phase > 1 - dt
    t2 = (phase[m2] - 1) / dt
    y[m2] -= t2 * t2 + t2 + t2 + 1
    return y


def peaking(x, f0, gain_db, q):
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    alpha = np.sin(w0) / (2 * q)
    b = [1 + alpha * A, -2 * np.cos(w0), 1 - alpha * A]
    a = [1 + alpha / A, -2 * np.cos(w0), 1 - alpha / A]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x, axis=0)


def stereo_ir(dur, seed, damp=3500):
    r = rng(seed)
    n = int(dur * SR)
    env = np.exp(-np.arange(n) / (dur * SR / 6.9))
    ch = []
    for _ in range(2):
        z = lp(r.standard_normal(n) * env, damp, 2)
        z[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ch.append(z / np.sqrt(np.sum(z ** 2)))
    return np.stack(ch, axis=1)


def reverb(x, ir, wet=0.35):
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    w = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - wet) + w * wet


def pad_note(freq, dur, seed, cutoff=1100, att=1.2, rel=2.0, voices=5):
    r = rng(seed)
    n = int((dur + rel) * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    for v in range(voices):
        det = (v - (voices - 1) / 2) * 0.0045
        s = polyblep_saw(freq * (1 + det), n, r.random())
        p = (v / (voices - 1)) * 2 - 1
        a = (p * 0.8 + 1) * np.pi / 4
        L += s * np.cos(a)
        R += s * np.sin(a)
    t = np.arange(n) / SR
    env = np.minimum(1, t / att) * np.where(t < dur, 1.0, np.exp(-(t - dur) / (rel / 4)))
    lfo = 1 + 0.25 * np.sin(2 * np.pi * 0.11 * t + r.random() * 6)
    st = np.stack([L, R], axis=1) * env[:, None] / voices
    # slow-moving cutoff via two filtered copies crossfaded
    lo = lp(st, cutoff * 0.7, 2)
    hi = lp(st, cutoff * 1.3, 2)
    mix = ((lfo - 0.75) / 0.5)[:, None]
    return lo * (1 - mix) + hi * mix


def karplus(freq, dur, seed, damp=0.35, bright=0.4):
    r = rng(seed)
    n = int(dur * SR)
    N = int(round(SR / freq))
    exc = np.zeros(n)
    exc[:N] = lp(r.standard_normal(N), 2000 + 4000 * bright, 2)
    g = 0.996 - 0.02 * damp
    a = np.zeros(N + 2)
    a[0] = 1.0
    a[N] = -g / 2
    a[N + 1] = -g / 2
    y = signal.lfilter([1.0], a, exc)
    y = lp(y, 1800 + 2500 * bright, 2)      # palm-muted tone
    t = np.arange(n) / SR
    return y * np.exp(-t * (2.0 + 4.0 * damp))


# chords: root midi + voicing (D minor: i - VI - iv - v)
PROG = [
    ('Dm', [50, 57, 62, 65]),   # D3 A3 D4 F4
    ('Bb', [46, 53, 58, 62]),   # Bb2 F3 Bb3 D4
    ('Gm', [43, 50, 55, 58]),   # G2 D3 G3 Bb3
    ('Asus', [45, 52, 57, 62]),  # A2 E3 A3 D4 (sus4, tension)
]
ARP = {  # pluck tones per chord (upper register, chord tones)
    'Dm': [62, 69, 65, 74], 'Bb': [62, 70, 65, 74], 'Gm': [62, 67, 70, 74], 'Asus': [64, 69, 62, 76],
}
SUB = {'Dm': 38, 'Bb': 34, 'Gm': 31, 'Asus': 33}


def render_bed(n_bars, sections, seed=7, tail_s=4.0):
    """sections(bar) -> dict of layer gains. Returns (buffer_with_tail, loop_len_samples)."""
    L = int(n_bars * BAR * SR)
    buf = np.zeros((L + int(tail_s * SR), 2))
    r = rng(seed)
    chord_bars = 4
    for bar in range(0, n_bars, chord_bars):
        name, notes = PROG[(bar // chord_bars) % 4]
        g = sections(bar)
        start = int(bar * BAR * SR)
        dur = chord_bars * BAR
        # pads
        if g.get('pad', 0) > 0:
            for k, m in enumerate(notes):
                pn = pad_note(midi(m), dur, seed * 100 + bar * 10 + k, cutoff=g.get('cut', 1100))
                e = min(len(pn), len(buf) - start)
                buf[start:start + e] += pn[:e] * g['pad'] * 0.22
        # sub pulse: heartbeat on beats 1 and 3 (+ ghost on the "and" of 1)
        if g.get('sub', 0) > 0:
            f = midi(SUB[name])
            for b in range(chord_bars * 4):
                if b % 2:
                    continue
                for off, amp in ((0.0, 1.0), (0.32 * BEAT, 0.45)):
                    st = start + int((b * BEAT + off) * SR)
                    tt = np.arange(int(0.55 * SR)) / SR
                    hit = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7) * (1 - np.exp(-tt * 400))
                    hit = np.tanh(hit * 1.5)
                    e = min(len(hit), len(buf) - st)
                    buf[st:st + e] += (hit[:e] * g['sub'] * amp * 0.28)[:, None]
        # muted pluck ostinato on 8ths, sparse pattern
        if g.get('pluck', 0) > 0:
            pattern = [1, 0, 1, 1, 0, 1, 0, 1]
            tones = ARP[name]
            for b in range(chord_bars * 8):
                if not pattern[b % 8] or r.random() < 0.18:
                    continue
                m = tones[(b // 2) % len(tones)]
                pk = karplus(midi(m), 0.9, seed + bar * 97 + b, damp=0.5, bright=0.3)
                st = start + int(b * BEAT / 2 * SR)
                p = 0.35 if (b % 2) else -0.35
                a = (p + 1) * np.pi / 4
                e = min(len(pk), len(buf) - st)
                vel = 0.7 + 0.3 * r.random()
                buf[st:st + e, 0] += pk[:e] * np.cos(a) * g['pluck'] * 0.16 * vel
                buf[st:st + e, 1] += pk[:e] * np.sin(a) * g['pluck'] * 0.16 * vel
        # air shaker on 8ths
        if g.get('air', 0) > 0:
            for b in range(chord_bars * 8):
                st = start + int(b * BEAT / 2 * SR)
                tt = np.arange(int(0.09 * SR)) / SR
                z = hp(r.standard_normal(len(tt)), 6000, 2) * np.exp(-tt * 45) * (0.6 if b % 2 else 1.0)
                e = min(len(z), len(buf) - st)
                buf[st:st + e] += (z[:e] * g['air'] * 0.03)[:, None]
    return buf, L


def master(x, lufs=-20.0):
    x = remove_dc(x)
    x = peaking(x, 1400, -4.0, 0.45)   # pocket for the voice
    x = hp(x, 28, 2)
    meter = pyln.Meter(SR)
    for _ in range(4):
        loud = meter.integrated_loudness(x)
        x = x * 10 ** ((lufs - loud) / 20)
        tp = np.max(np.abs(signal.resample_poly(x, 4, 1, axis=0)))
        if tp <= 10 ** (-1.3 / 20):
            break
        x = limiter(x, -1.6)
    return x


IR = stereo_ir(2.8, 5)


# ---------- main loop: 64 bars ----------
def main_sections(bar):
    sec = bar // 16
    return [
        {'pad': 1.0, 'sub': 0.8, 'pluck': 0.0, 'air': 0.0, 'cut': 900},
        {'pad': 1.0, 'sub': 1.0, 'pluck': 0.8, 'air': 0.0, 'cut': 1100},
        {'pad': 0.9, 'sub': 1.0, 'pluck': 1.0, 'air': 0.7, 'cut': 1300},
        {'pad': 1.0, 'sub': 0.9, 'pluck': 0.5, 'air': 0.3, 'cut': 1000},
    ][sec]


buf, L = render_bed(64, main_sections, seed=7)
buf = reverb(buf, IR, 0.32)
loop = buf[:L].copy()
tail = buf[L:]
loop[: len(tail)] += tail           # circular wrap: seamless loop
# fix the very first bars (no reverb/pad tail from "previous" pass yet in buf head is already handled by wrap)
loop = master(loop, -20.0)
write(os.path.join(OUT, 'bed_main_loop.wav'), loop)
print('main loop', L / SR, 's')

# ---------- cold open: 25 s, darker, builds to a hit ----------
dur = 25.0
n = int(dur * SR)
t = np.arange(n) / SR
r = rng(21)
co = np.zeros((n, 2))
# drone D1/D2 + A, slowly opening filter
for k, (m, a) in enumerate(((26, 0.5), (38, 0.6), (45, 0.35), (50, 0.25))):
    pn = pad_note(midi(m), dur, 300 + k, cutoff=400 + 300 * k, att=3.0, rel=0.5, voices=4)[:n]
    co += pn * a * 0.3
# tension semitone (Eb) swelling in at 10-20 s
eb = pad_note(midi(51), 12.0, 330, cutoff=700, att=4, rel=2, voices=4)
co[int(9 * SR):int(9 * SR) + len(eb)] += eb[: n - int(9 * SR)] * 0.14
# accelerating tick pulse (clock-like), from 1/beat to 4/beat
tick_t = 1.0
while tick_t < 23.2:
    st = int(tick_t * SR)
    tt = np.arange(int(0.04 * SR)) / SR
    z = (bp(r.standard_normal(len(tt)), 2000, 6000, 2) * np.exp(-tt * 250)
         + np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 200) * 0.5)
    prog = tick_t / 23.2
    co[st:st + len(z)] += (z * (0.05 + 0.12 * prog))[:, None]
    tick_t += BEAT * (1.0 - 0.75 * prog ** 1.5)
# rising noise riser last 6 s
u = np.clip((t - 17.0) / 6.3, 0, 1)
rz = bp(r.standard_normal(n), 1500, 9000, 2) * u ** 2.5 * (t < 23.3)
co += np.stack([rz, np.roll(rz, 41)], axis=1) * 0.22
# master gain curve: swell
co *= (0.55 + 0.45 * np.clip(t / 22, 0, 1) ** 1.4)[:, None]
# the hit at 23.3 s
hs = int(23.3 * SR)
ht = np.arange(n - hs) / SR
hit = np.sin(2 * np.pi * np.cumsum(38 + 80 * np.exp(-ht * 16)) / SR) * np.exp(-ht * 2.2)
hit = np.tanh(hit * 2.0) * 0.9
hit_noise = lp(r.standard_normal(len(ht)), 3000, 2) * np.exp(-ht * 9) * 0.35
chord = np.zeros(len(ht))
for m in (38, 45, 50, 53):
    chord += np.sin(2 * np.pi * midi(m) * ht) * np.exp(-ht * 1.3) * 0.12
co[hs:] *= np.exp(-ht * 6)[:, None]          # drop everything into the hit
co[hs:] += np.stack([hit + hit_noise + chord] * 2, axis=1)
co = reverb(co, IR, 0.3)
co = fade(co, 50, 40)
co = master(co, -20.0)
co = fade(co, 50, 40)
write(os.path.join(OUT, 'bed_cold_open.wav'), co)
print('cold open', len(co) / SR)

# ---------- outro: 20 s, resolving Gm - Bb - Dm(add9) ----------
dur = 20.0
n = int(dur * SR)
t = np.arange(n) / SR
ou = np.zeros((n + int(4 * SR), 2))
seq = [(0.0, 5.33, [43, 50, 55, 58]), (5.33, 5.33, [46, 53, 58, 62]), (10.67, 9.3, [38, 50, 57, 62, 64, 65])]
for i, (st_s, d, notes) in enumerate(seq):
    st = int(st_s * SR)
    for k, m in enumerate(notes):
        pn = pad_note(midi(m), d, 500 + i * 10 + k, cutoff=1000 - i * 150, att=1.5, rel=3.0)
        e = min(len(pn), len(ou) - st)
        ou[st:st + e] += pn[:e] * 0.2
# sparse plucks, thinning out
r = rng(31)
for b, m in enumerate([62, 65, 69, 74, 62, 70, 65, 74, 69, 65, 62]):
    st = int((b * BEAT * 1.5 + 0.2) * SR)
    pk = karplus(midi(m), 1.4, 600 + b, damp=0.45, bright=0.3)
    e = min(len(pk), len(ou) - st)
    ou[st:st + e] += (pk[:e] * 0.13 * (1 - b / 14))[:, None]
ou = ou[:n]
ou = reverb(ou, IR, 0.38)
ou *= np.clip((dur - t) / 6.0, 0, 1)[:, None] ** 1.3
ou = fade(ou, 30, 40)
ou = master(ou, -20.0)
ou = fade(ou, 30, 40)
write(os.path.join(OUT, 'bed_outro.wav'), ou)
print('outro', len(ou) / SR)

"""Lo-fi documentary bed (competitor style: steady light beat, soft keys, low under VO).
85 BPM, Am7 - Fmaj7 - Cmaj7 - G6, 16 bars loop (~45 s), tiled to 4 min by the mixer. -> music/lofi_loop.wav"""
import numpy as np, soundfile as sf, pyloudnorm as pyln, os
from scipy.signal import butter, sosfilt

SR, BPM = 48000, 85
beat = 60 / BPM
bars = 16
N = int(bars * 4 * beat * SR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)

def add(x, start, gl=1.0, gr=1.0):
    s = int(start * SR); e = min(N, s + len(x))
    L[s:e] += x[: e - s] * gl; R[s:e] += x[: e - s] * gr

def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.16) * 0.9

def snare():
    n = int(0.3 * SR)
    nz = sosfilt(butter(2, [1200, 6000], 'band', fs=SR, output='sos'), rng.standard_normal(n))
    tone = np.sin(2 * np.pi * 190 * np.arange(n) / SR) * env(n, 0.001, 0.05)
    return (nz * env(n, 0.001, 0.09) * 0.35 + tone * 0.3)

def hat(open_=False):
    n = int((0.2 if open_ else 0.06) * SR)
    nz = sosfilt(butter(2, 7000, 'high', fs=SR, output='sos'), rng.standard_normal(n))
    return nz * env(n, 0.0005, 0.06 if open_ else 0.018) * 0.12

def keys(freqs, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        mod = np.sin(2 * np.pi * f * 1.0 * t) * 1.2 * np.exp(-t * 2.5)
        x += np.sin(2 * np.pi * f * t + mod) / len(freqs)
    trem = 1 + 0.15 * np.sin(2 * np.pi * 4.2 * t)
    return x * env(n, 0.01, 1.6) * trem * 0.5

m = lambda n: 440 * 2 ** ((n - 69) / 12)
chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64]]
bassn = [45, 41, 48, 43]

for bar in range(bars):
    b0 = bar * 4 * beat
    swing = beat * 0.08
    for q in range(4):
        tq = b0 + q * beat
        if q in (0, 2) or (q == 3 and bar % 2):
            add(kick(), tq + (beat * 0.5 if q == 3 else 0))
        if q in (1, 3):
            add(snare(), tq, 0.9, 1.0)
        for e in range(2):
            add(hat(open_=(q == 3 and e == 1)), tq + e * beat / 2 + (swing if e else 0), 0.7, 1.0)
    ch = chords[(bar // 2) % 4]
    add(keys([m(n) for n in ch], 4 * beat * 2 if bar % 2 == 0 else 0.01), b0, 1.0, 0.85) if bar % 2 == 0 else None
    bn = m(bassn[(bar // 2) % 4])
    nb = int(beat * 1.8 * SR); tb = np.arange(nb) / SR
    bass = np.sin(2 * np.pi * bn * tb) * env(nb, 0.005, 0.5) * 0.35
    add(bass, b0); add(bass * 0.8, b0 + 2.5 * beat)

# vinyl crackle + low-pass "tape" feel
crackle = (rng.random(N) > 0.9993) * rng.standard_normal(N) * 0.08
hiss = sosfilt(butter(2, [2000, 9000], 'band', fs=SR, output='sos'), rng.standard_normal(N)) * 0.004
lp = butter(2, 5200, 'low', fs=SR, output='sos')
L = sosfilt(lp, L + crackle + hiss); R = sosfilt(lp, R + crackle * 0.8 + hiss)
x = np.stack([L, R], 1)
# vocal-pocket dip around 1.5 kHz
dip = sosfilt(butter(2, [900, 2600], 'band', fs=SR, output='sos'), x, axis=0)
x = x - 0.35 * dip
fade = int(0.01 * SR)
x[:fade] *= np.linspace(0, 1, fade)[:, None]; x[-fade:] *= np.linspace(1, 0, fade)[:, None]
meter = pyln.Meter(SR)
x = pyln.normalize.loudness(x, meter.integrated_loudness(x), -20.0)
x *= min(1, 0.7 / np.max(np.abs(x)))
out = os.path.join(os.path.dirname(__file__), '..', 'music', 'lofi_loop.wav')
sf.write(out, x.astype(np.float32), SR, subtype='PCM_24')
print('lofi', round(N / SR, 1), 's', round(meter.integrated_loudness(x), 1), 'LUFS')

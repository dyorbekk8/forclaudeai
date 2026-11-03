"""Generate the SFX library into ../library/. Deterministic (fixed seeds)."""
import os
import numpy as np
from scipy import signal
from common import (SR, t_axis, rng, fade, exp_decay, bp, lp, hp, remove_dc,
                    svf_vec, peak_normalize, write, pan, zero_mean_windowed)

OUT = os.path.join(os.path.dirname(__file__), '..', 'library')
os.makedirs(OUT, exist_ok=True)


def save(name, x, db=-3.0, fin=3.0, fout=4.0):
    x = remove_dc(x)
    x = fade(x, fin, fout)
    x = peak_normalize(x, db)
    x = fade(x, fin, fout)
    x = zero_mean_windowed(x)
    write(os.path.join(OUT, name + '.wav'), x)


def reverb_ir(dur, seed, stereo=False, damp=4000):
    r = rng(seed)
    n = int(dur * SR)
    env = np.exp(-np.arange(n) / (dur * SR / 6.9))
    chans = []
    for c in range(2 if stereo else 1):
        noise = r.standard_normal(n) * env
        noise = lp(noise, damp, 2)
        noise[0] = 0
        chans.append(noise / np.sqrt(np.sum(noise ** 2)))
    return np.stack(chans, axis=1) if stereo else chans[0]


def conv(x, ir):
    if ir.ndim == 2 and x.ndim == 1:
        return np.stack([signal.fftconvolve(x, ir[:, c]) for c in range(2)], axis=1)
    return signal.fftconvolve(x, ir)


# ---------- whooshes ----------
def whoosh(dur, f0, f1, seed, peak_pos=0.62, q=1.6, stereo=True, body=0.0):
    r = rng(seed)
    n = int(dur * SR)
    t = np.arange(n) / n
    noise = r.standard_normal(n)
    noise = lp(np.cumsum(noise) * 0.02 + noise * 0.5, 12000, 2)  # slightly pink
    curve = f0 * (f1 / f0) ** (np.clip(t / peak_pos, 0, 1) ** 1.3)
    curve = np.where(t > peak_pos, curve[int(peak_pos * n) - 1] * (1 - 0.35 * (t - peak_pos) / (1 - peak_pos)), curve)
    y = svf_vec(noise, curve, 'band', q)
    env = np.where(t < peak_pos, (t / peak_pos) ** 2.2, ((1 - t) / (1 - peak_pos)) ** 1.6)
    y = y * env
    if body > 0:
        tone = np.sin(2 * np.pi * np.cumsum(curve * 0.25) / SR) * env * body
        y = y + tone * np.std(y) * 3
    if stereo:
        p = np.sin(np.pi * (t - 0.5)) * 0.7
        a = (p + 1) * np.pi / 4
        return np.stack([y * np.cos(a), y * np.sin(a)], axis=1)
    return y


for i, (d, f0, f1, pp, q) in enumerate([(0.42, 350, 3200, 0.6, 1.5), (0.5, 500, 4200, 0.65, 1.8),
                                          (0.36, 300, 2600, 0.55, 1.4), (0.58, 250, 3600, 0.7, 1.6)], 1):
    save(f'whoosh_soft_{i}', whoosh(d, f0, f1, 100 + i, pp, q))

for i, (d, f0, f1, s) in enumerate([(0.9, 120, 6500, 201), (1.05, 90, 5200, 202)], 1):
    w = whoosh(d, f0, f1, s, 0.72, 1.1, body=0.6)
    n = w.shape[0]
    # low thump at the peak
    tt = t_axis(0.35)
    thump = np.sin(2 * np.pi * (55 + 60 * np.exp(-tt * 25)) * tt) * np.exp(-tt * 9)
    start = int(0.7 * n)
    seg = thump[: n - start]
    w[start:start + len(seg), 0] += seg * 0.5 * np.max(np.abs(w))
    w[start:start + len(seg), 1] += seg * 0.5 * np.max(np.abs(w))
    save(f'whoosh_hard_{i}', w)


# ---------- ticks / pops / clicks ----------
def tick(f, seed, dur=0.045, bright=1.0):
    r = rng(seed)
    t = t_axis(dur)
    tone = np.sin(2 * np.pi * f * t) * np.exp(-t * 180) + 0.4 * np.sin(2 * np.pi * f * 2.71 * t) * np.exp(-t * 260)
    tr = hp(r.standard_normal(len(t)), 3000, 2) * np.exp(-t * 900) * 0.6 * bright
    return tone + tr


for i, (f, s) in enumerate([(2400, 11), (3100, 12), (2750, 13)], 1):
    save(f'tick_{i}', tick(f, s), fin=0.3, fout=3)


def pop(f0, f1, seed, dur=0.12):
    r = rng(seed)
    t = t_axis(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 60)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 38) * (1 - np.exp(-t * 2000))
    air = bp(r.standard_normal(len(t)), 800, 3000, 2) * np.exp(-t * 120) * 0.15
    return body + air


for i, (f0, f1, s) in enumerate([(900, 320, 21), (1100, 380, 22), (800, 260, 23)], 1):
    save(f'pop_{i}', pop(f0, f1, s), fin=0.5, fout=4)


def click(seed, gap=0.012):
    r = rng(seed)
    t = t_axis(0.06)
    one = lambda: bp(r.standard_normal(len(t)), 1500, 7000, 2) * np.exp(-t * 700) + \
        np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 300) * 0.5
    x = one()
    g = int(gap * SR)
    x[g:] += 0.6 * one()[: len(t) - g]
    return x


save('click_1', click(31), fin=0.3, fout=3)
save('click_2', click(32, 0.018), fin=0.3, fout=3)

# ---------- counter tick loop (2 s, 12 ticks/s, loopable) ----------
r = rng(41)
loop = np.zeros(int(2.0 * SR))
period = int(SR / 12)
for k in range(24):
    tk = tick(2900 + r.uniform(-120, 120), 400 + k, dur=0.03, bright=0.8)
    tk = tk * np.linspace(1, 0, len(tk)) ** 0.5
    s = k * period
    loop[s:s + len(tk)] += tk * (0.85 + 0.15 * r.random())
loop = remove_dc(loop)
loop = peak_normalize(loop, -3)
loop[:2] = 0
loop[-2:] = 0
write(os.path.join(OUT, 'counter_tick_loop.wav'), loop)

# ---------- heat rise ----------
dur = 2.6
t = t_axis(dur)
n = len(t)
u = t / dur
r = rng(51)
f = 180 * (4.5 ** (u ** 1.6))
x = np.zeros(n)
for det in (-0.006, 0.0, 0.007):
    x += np.sin(2 * np.pi * np.cumsum(f * (1 + det)) / SR)
x += 0.35 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR)
shimmer = np.zeros(n)
for k, fr in enumerate([3200, 4100, 5300, 6700]):
    trem = 0.5 + 0.5 * np.sin(2 * np.pi * (6 + 18 * u ** 2) * t + k)
    shimmer += np.sin(2 * np.pi * fr * (1 + 0.15 * u) * t) * trem
noise = bp(r.standard_normal(n), 2000, 9000, 2)
y = x * 0.5 + shimmer * 0.12 * u ** 1.5 + noise * 0.25 * u ** 2.5
y = y * (u ** 1.8) * (1 - np.exp(-(1 - u) * 400))
save('heat_rise', y, fin=2, fout=3)


# ---------- glass shatter (tiny bulb) ----------
def shatter(seed, n_shards=46, tail=0.45):
    r = rng(seed)
    dur = 0.75
    n = int(dur * SR)
    y = np.zeros(n)
    t = t_axis(dur)
    # crack transient
    ct = t_axis(0.012)
    crack = hp(r.standard_normal(len(ct)), 1800, 4) * np.exp(-ct * 520)
    y[: len(ct)] += crack * 1.4
    # pressure pop (liquid release)
    pt = t_axis(0.06)
    popb = np.sin(2 * np.pi * (240 + 300 * np.exp(-pt * 90)) * pt) * np.exp(-pt * 70)
    y[: len(pt)] += popb * 0.35
    # tinkles: bar-mode inharmonic partials
    ratios = np.array([1.0, 2.756, 5.404, 8.933])
    for k in range(n_shards):
        start = int(SR * (r.exponential(0.06) + (0.0 if k < 6 else 0.004)))
        if start >= n - 100:
            continue
        f0 = r.uniform(3200, 8200)
        decay = r.uniform(0.015, 0.07)
        ln = int(SR * decay * 5)
        lt = np.arange(min(ln, n - start)) / SR
        sh = np.zeros(len(lt))
        for j, rr in enumerate(ratios):
            fr = f0 * rr / ratios[1] if j else f0 * 0.62
            if fr > SR * 0.45:
                continue
            sh += np.sin(2 * np.pi * fr * lt + r.uniform(0, 6.28)) * np.exp(-lt / (decay / (1 + j * 0.6))) / (1 + j * 0.8)
        amp = np.exp(-start / SR / 0.12) * r.uniform(0.3, 1.0)
        y[start:start + len(sh)] += sh * amp * 0.45
    # short bright tail
    tl = hp(r.standard_normal(n), 3500, 2) * np.exp(-t / (tail / 5)) * 0.12
    y += tl
    return y


for i, s in enumerate([61, 62, 63], 1):
    save(f'glass_shatter_{i}', shatter(s, 40 + 6 * i), fin=0.2, fout=5)


# ---------- water spray ----------
def spray_noise(dur, seed):
    r = rng(seed)
    n = int(dur * SR)
    w = r.standard_normal(n)
    hiss = bp(w, 1200, 11000, 2)
    mid = bp(r.standard_normal(n), 250, 1200, 2) * 0.35
    flutter = lp(r.standard_normal(n), 14, 2)
    flutter = 1 + 0.25 * flutter / (np.std(flutter) + 1e-9)
    drops = np.zeros(n)
    for _ in range(int(dur * 120)):
        s = r.integers(0, n - 400)
        dt = np.arange(300) / SR
        drops[s:s + 300] += np.sin(2 * np.pi * r.uniform(1500, 4500) * dt) * np.exp(-dt * 400) * r.uniform(0.1, 0.4)
    return (hiss + mid) * flutter + drops * 0.6


dur = 1.6
t = t_axis(dur)
y = spray_noise(dur, 71)
onset = np.minimum(1, t / 0.03) * (1 + 0.8 * np.exp(-t / 0.12))
release = np.clip((dur - t) / 0.55, 0, 1) ** 1.5
save('water_spray_burst', y * onset * release, fin=1, fout=5)

# loopable 3 s: crossfade tail into head
L = 3.0
X = 0.4
y = spray_noise(L + X, 72)
nL, nX = int(L * SR), int(X * SR)
head = y[:nX].copy()
tail = y[nL:nL + nX]
c = np.sin(np.linspace(0, np.pi / 2, nX)) ** 2
loopy = y[:nL].copy()
loopy[:nX] = head * c + tail * (1 - c)
loopy = remove_dc(loopy)
loopy = peak_normalize(loopy, -3)
write(os.path.join(OUT, 'water_spray_loop.wav'), loopy)


# ---------- stamp ----------
def stamp(seed, f_body=170, slap=0.6):
    r = rng(seed)
    t = t_axis(0.45)
    thump = np.sin(2 * np.pi * (48 + 70 * np.exp(-t * 35)) * t) * np.exp(-t * 14)
    body = np.sin(2 * np.pi * f_body * t) * np.exp(-t * 40) * 0.35
    paper = bp(r.standard_normal(len(t)), 700, 6000, 2) * np.exp(-t * 85) * slap
    paper = np.roll(paper, int(0.002 * SR))
    paper[: int(0.002 * SR)] = 0
    x = thump + body + paper
    return np.tanh(x * 1.6)


save('stamp_thud_1', stamp(81), fin=0.3, fout=5)
save('stamp_thud_2', stamp(82, 150, 0.75), fin=0.3, fout=5)


# ---------- sub hits ----------
def sub_hit(seed, f_end=42, dur=1.6):
    r = rng(seed)
    t = t_axis(dur)
    f = f_end + 90 * np.exp(-t * 18)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    x = np.tanh(x * 2.2) * 0.8
    click_ = hp(r.standard_normal(len(t)), 2500, 2) * np.exp(-t * 300) * 0.25
    air = lp(r.standard_normal(len(t)), 900, 2) * np.exp(-t * 4) * 0.08
    ir = reverb_ir(1.2, seed + 1)
    rv = conv(x * 0.3 + click_, ir)[: len(t)] * 0.25
    return x + click_ + air + rv


save('sub_hit_1', sub_hit(91), fin=0.3, fout=8)
save('sub_hit_2', sub_hit(92, 36, 1.9), fin=0.3, fout=8)

# ---------- riser 2 s ----------
dur = 2.0
t = t_axis(dur)
u = t / dur
r = rng(101)
noise = r.standard_normal(len(t))
curve = 300 * (25 ** (u ** 1.4))
nz = svf_vec(noise, curve, 'band', 1.2)
tone = np.zeros(len(t))
for k, det in enumerate((0.0, 0.004, -0.005)):
    tone += np.sin(2 * np.pi * np.cumsum(110 * (8 ** u) * (1 + det)) / SR)
y = (nz / (np.std(nz) + 1e-9) * 0.5 + tone * 0.25) * u ** 2.4
st = np.stack([y, np.roll(y, 37)], axis=1)
save('riser_2s', st, fin=2, fout=3)

# ---------- reverse swell 1 s ----------
r = rng(111)
t = t_axis(1.0)
hit = np.zeros(len(t))
for fr in (220, 330, 440, 660, 1320):
    hit += np.sin(2 * np.pi * fr * t + r.uniform(0, 6)) / (1 + fr / 600)
hit += bp(r.standard_normal(len(t)), 500, 6000, 2) * 0.4
hit *= np.exp(-t * 5)
ir = reverb_ir(1.0, 112, stereo=True)
wet = conv(hit, ir)[: len(t)]
rev = wet[::-1] * (1 - np.exp(-(1 - t[:, None]) * 300))
save('reverse_swell_1s', rev, fin=10, fout=2)

# ---------- paper slide ----------
r = rng(121)
t = t_axis(0.32)
u = t / 0.32
fr = bp(r.standard_normal(len(t)), 900, 7000, 2)
am = 0.6 + 0.4 * np.abs(lp(r.standard_normal(len(t)), 45, 2)) / 0.05
am = np.clip(am / np.max(am), 0, 1)
env = np.sin(np.pi * u) ** 0.8 * (1 - 0.5 * u)
save('paper_slide', fr * am * env, fin=3, fout=5)

# ---------- marker scribble ----------
r = rng(131)
t = t_axis(0.5)
n = len(t)
y = np.zeros(n)
strokes = [(0.0, 0.14), (0.15, 0.27), (0.29, 0.42), (0.43, 0.5)]
base = bp(r.standard_normal(n), 2500, 8000, 2)
for a, b in strokes:
    s, e = int(a * SR), int(b * SR)
    m = e - s
    w = np.sin(np.linspace(0, np.pi, m)) ** 0.6
    squeak = np.sin(2 * np.pi * r.uniform(2800, 3600) * np.arange(m) / SR) * 0.08
    y[s:e] += (base[s:e] + squeak) * w * r.uniform(0.7, 1.0)
save('marker_scribble', y, fin=2, fout=4)

# ---------- alarm bell (distant) ----------
dur = 2.2
n = int(dur * SR)
t = t_axis(dur)
r = rng(141)
bell_ratios = [0.5, 1.0, 1.183, 1.506, 2.0, 2.514, 2.662, 3.011]
bell_amps = [0.4, 1.0, 0.6, 0.5, 0.45, 0.3, 0.25, 0.15]
f0 = 1450
strike_rate = 18
dry = np.zeros(n)
bt = t_axis(0.6)
strike = np.zeros(len(bt))
for rr, aa in zip(bell_ratios, bell_amps):
    strike += aa * np.sin(2 * np.pi * f0 * rr * bt) * np.exp(-bt * (3 + rr * 2.5))
strike += hp(r.standard_normal(len(bt)), 3000, 2) * np.exp(-bt * 600) * 0.3
for k in range(int(dur * strike_rate)):
    s = int(k * SR / strike_rate + r.uniform(-0.002, 0.002) * SR)
    s = max(0, s)
    seg = strike[: n - s]
    dry[s:s + len(seg)] += seg * r.uniform(0.75, 1.0)
dry = bp(dry, 350, 3200, 2)
ir = reverb_ir(1.4, 142, stereo=True, damp=2500)
wet = conv(dry, ir)[:n]
dist = np.stack([dry, dry], axis=1) * 0.25 + wet * 0.9
env = np.minimum(1, t / 0.25)[:, None] * np.minimum(1, (dur - t) / 0.4)[:, None]
save('alarm_bell_distant', dist * env, db=-3, fin=5, fout=5)

print('sfx done')

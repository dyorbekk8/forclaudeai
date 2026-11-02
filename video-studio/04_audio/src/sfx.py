"""Procedural SFX library. Each generator returns a mono (n,) or stereo (2, n)
float array; make_sfx() finalises (DC removal, fades, -3 dBFS peak) and writes.
"""
import os
import numpy as np
from dsp import *  # noqa

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sfx')

LOOPABLE = {'crowd_murmur', 'cafeteria_ambience', 'room_tone_home', 'room_tone_care'}


def R(seed):
    return np.random.default_rng(seed)


# ----------------------------------------------------------------------------
# shared building blocks
# ----------------------------------------------------------------------------
def glint(f, dur, rng, bright=0.25):
    """Tiny high sine 'ting' with fast attack and slight shimmer."""
    n = ns(dur)
    t = tvec(n)
    vib = 1 + 0.002 * np.sin(TWO_PI * rng.uniform(5, 9) * t)
    s = np.sin(phase_of(f * vib) + rng.uniform(0, TWO_PI))
    s += bright * np.sin(phase_of(2.01 * f * vib)) * np.exp(-t / (dur / 7))
    e = (1 - np.exp(-t / 0.0015)) * np.exp(-t / (dur / 4.5))
    return fade(s * e, 0, dur * 0.2)


def click(n_sec, rng, lo=2000, hi=9000, tau=0.0008):
    n = ns(n_sec)
    x = white(n, rng) * np.exp(-tvec(n) / tau)
    return bp(x, lo, hi, 2)


def noise_burst(dur, rng, lo=None, hi=None, tau=None, kind='white'):
    n = ns(dur)
    x = white(n, rng) if kind == 'white' else pink(n, rng)
    if lo and hi:
        x = bp(x, lo, hi, 2)
    elif hi:
        x = lp(x, hi, 2)
    elif lo:
        x = hp(x, lo, 2)
    if tau:
        x *= exp_decay(n, tau, 0.0005)
    return x


def bell_tone(f, dur, rng, ratios=(1, 2.0, 3.0, 4.16, 5.43, 6.8),
              amps=(1, .45, .22, .16, .09, .05), base_tau=0.8, tau_fall=1.6,
              attack=0.001, strike=0.02):
    n = ns(dur)
    taus = [base_tau / (1 + tau_fall * i) for i in range(len(ratios))]
    y = partials(n, f, ratios, amps, taus, rng, attack=attack)
    if strike:
        y[:ns(0.01)] += strike * click(0.01, rng, 2000, 12000, 0.001)
    return y


def loopify(x, n, xf):
    """x has length >= n + xf. Return length-n buffer that loops seamlessly
    (equal-power crossfade of the tail into the head), then rotate so that
    the loop point sits on a near-zero sample."""
    xs = x if x.ndim == 2 else x[None, :]
    head = xs[:, :xf]
    tail = xs[:, n:n + xf]
    a = np.linspace(0, np.pi / 2, xf)
    out = xs[:, :n].copy()
    out[:, :xf] = head * np.sin(a) + tail * np.cos(a)
    # rotate to a quiet zero-ish point (both channels small, sign change)
    mag = np.sum(np.abs(out), axis=0)
    mag2 = mag + np.roll(mag, 1)
    k = int(np.argmin(mag2[ns(0.5):n - ns(0.5)])) + ns(0.5)
    out = np.roll(out, -k, axis=1)
    return out if x.ndim == 2 else out[0]


# ----------------------------------------------------------------------------
# 1. signature: pop_age
# ----------------------------------------------------------------------------
def pop_age(v):
    rng = R(100 + v)
    P = {1: dict(f0=310, f1=118, sn=['E7', 'G7', 'C8', 'E8'], c2=0.010, wf=58),
         2: dict(f0=285, f1=112, sn=['D7', 'G7', 'B7', 'D8'], c2=0.008, wf=55),
         3: dict(f0=335, f1=126, sn=['G7', 'C8', 'E8', 'G8'], c2=0.012, wf=62)}[v]
    dur = 0.62
    n = ns(dur)
    mono = np.zeros(n)
    # --- crack: two micro snaps (knuckle-crack character)
    for t0, a, cf in [(0.000, 1.0, 2600), (P['c2'], 0.55, 3300)]:
        c = click(0.008, rng, 1200, 9000, 0.0009) * 0.8
        imp = np.zeros(ns(0.03))
        imp[0] = 1
        c2 = resonator(imp, cf, 0.004) * 0.6 + resonator(imp, cf * 1.9, 0.0018) * 0.3
        c = np.concatenate([c, np.zeros(len(c2) - len(c))]) + c2
        place(mono, c * a * 0.55, t0)
    # --- tonal pop 300 -> 120 Hz with a 'plop' layer for small speakers
    m = ns(0.2)
    t = tvec(m)
    f = P['f1'] + (P['f0'] - P['f1']) * np.exp(-t / 0.022)
    ph = phase_of(f)
    pop = (np.sin(ph) + 0.38 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph))
    pop *= (1 - np.exp(-t / 0.0012)) * np.exp(-t / 0.05)
    plop_f = 2.4 * f
    plop = np.sin(phase_of(plop_f)) * (1 - np.exp(-t / 0.001)) * np.exp(-t / 0.018)
    place(mono, 0.85 * pop + 0.22 * plop, 0.003)
    # --- low whomp (sub ~60 Hz, 120 ms)
    m = ns(0.16)
    t = tvec(m)
    f = P['wf'] + 45 * np.exp(-t / 0.025)
    w = np.sin(phase_of(f))
    w *= (1 - np.exp(-t / 0.004)) * np.exp(-t / 0.045)
    w = soft_sat(w * 1.4, 1.6) / 1.4 * 0.9
    place(mono, w * 0.95, 0.002)
    mono = hp(mono, 30, 2)
    st = pan(mono, 0) / np.sqrt(2)
    # --- sparkle tail (quiet high glints, panned, with small bright verb)
    sp = np.zeros((2, n))
    notes = P['sn']
    times = [0.07, 0.12, 0.17, 0.235]
    for i, (nn, t0) in enumerate(zip(notes, times)):
        g = glint(hz(nn), rng.uniform(0.16, 0.24), rng)
        g *= 0.11 * (0.85 ** i)
        place(sp, pan(g, rng.uniform(-0.6, 0.6)), t0 + rng.uniform(-0.008, 0.008))
    # a few extra tiny glints
    for k in range(4):
        g = glint(hz(notes[rng.integers(0, 4)]) * 2 ** (rng.integers(0, 2) * 0), 0.12, rng)
        place(sp, pan(g * 0.045, rng.uniform(-0.8, 0.8)), rng.uniform(0.1, 0.33))
    sp = hp(sp, 2500, 2)
    sp = sp + 0.6 * reverb(sp, rt60=0.7, predelay=0.01, damp=0.2, seed=3, low_cut=2000)
    st = st + sp + 0.12 * reverb(st, rt60=0.35, predelay=0.005, damp=0.6, seed=4)
    return fade(st, 0.0005, 0.12)


# ----------------------------------------------------------------------------
# whooshes
# ----------------------------------------------------------------------------
def _whoosh(dur, f_start, f_peak, f_end, peak_pos, bw, pan0, pan1, seed,
            air=0.25, body=0.35, sharp=1.0):
    rng = R(seed)
    n = ns(dur)
    tp = peak_pos * dur

    def fc(t):
        t = np.clip(t, 0, dur)
        lf = np.where(t < tp,
                      np.log(f_start) + (np.log(f_peak) - np.log(f_start)) * np.clip(t / tp, 0, 1) ** 1.3,
                      np.log(f_peak) + (np.log(f_end) - np.log(f_peak)) * np.clip((t - tp) / (dur - tp), 0, 1) ** 0.8)
        return np.exp(lf)

    def amp(t):
        w1 = tp * 0.42 / sharp
        w2 = (dur - tp) * 0.28 / sharp
        w = np.where(t < tp, w1, w2)
        return 1.0 / (1.0 + ((t - tp) / w) ** 2)

    common = pink(n, rng) * 0.7 + white(n, rng) * 0.3
    chans = []
    for ch in range(2):
        x = 0.82 * common + 0.18 * (pink(n, rng) * 0.7 + white(n, rng) * 0.3)
        y = stft_shape(x, lambda f, t: bell_gain(f, fc(t), bw * 0.75) * amp(t), nfft=1024, hop=128)
        a_ = stft_shape(x, lambda f, t: hp_gain(f, 4500, 2) * lp_gain(f, 12000, 2) * amp(t) ** 1.5,
                        nfft=1024, hop=128)
        b_ = stft_shape(x, lambda f, t: bell_gain(f, 180, 1.2) * amp(t) ** 2, nfft=2048, hop=256)
        chans.append(y + air * a_ + body * b_)
    st = np.vstack(chans)
    t = tvec(n)
    p = pan0 + (pan1 - pan0) / (1 + np.exp(-(t - tp) / (dur * 0.12)))
    a = (np.clip(p, -1, 1) + 1) * np.pi / 4
    st = np.vstack([st[0] * np.cos(a), st[1] * np.sin(a)]) * np.sqrt(2)
    return fade(st, 0.004, 0.03)


def whoosh_fast(v):
    cfg = {1: (0.35, 450, 2600, 900, 0.55, 0.9, -0.7, 0.7),
           2: (0.35, 380, 2100, 700, 0.5, 1.0, 0.6, -0.6),
           3: (0.35, 550, 3200, 1200, 0.6, 0.8, -0.5, 0.8)}[v]
    return _whoosh(*cfg, seed=200 + v, air=0.3, body=0.3, sharp=1.1)


def whoosh_slow(v):
    cfg = {1: (0.9, 220, 1500, 400, 0.58, 1.1, -0.8, 0.8),
           2: (0.9, 260, 1200, 350, 0.5, 1.2, 0.7, -0.7)}[v]
    return _whoosh(*cfg, seed=210 + v, air=0.2, body=0.5, sharp=0.9)


def swish_whip(v):
    cfg = {1: (0.25, 900, 5200, 1800, 0.45, 0.6, -0.6, 0.6),
           2: (0.25, 1100, 6000, 2200, 0.4, 0.55, 0.6, -0.6)}[v]
    return _whoosh(*cfg, seed=220 + v, air=0.45, body=0.12, sharp=1.8)


# ----------------------------------------------------------------------------
# UI
# ----------------------------------------------------------------------------
def pop_ui(v):
    rng = R(300 + v)
    f0 = {1: 520, 2: 640, 3: 760}[v]
    n = ns(0.085)
    t = tvec(n)
    f = f0 * (1 + 1.1 * (1 - np.exp(-t / 0.014)))
    ph = phase_of(f)
    s = np.sin(ph) + 0.15 * np.sin(2 * ph)
    s *= (1 - np.exp(-t / 0.0008)) * np.exp(-t / 0.017)
    c = click(0.004, rng, 2500, 9000, 0.0004) * 0.15
    s[:len(c)] += c
    return fade(s, 0.0003, 0.015)


def blip(v):
    rng = R(310 + v)
    f0 = {1: hz('A5'), 2: hz('C6'), 3: hz('E6')}[v]
    n = ns(0.13)
    t = tvec(n)
    f = f0 * (1 - 0.02 * (1 - np.exp(-t / 0.03)))
    ph = phase_of(f)
    s = np.sin(ph) + 0.18 * np.sin(2 * ph) * np.exp(-t / 0.02) + 0.05 * np.sin(3 * ph) * np.exp(-t / 0.01)
    s *= (1 - np.exp(-t / 0.0025)) * np.exp(-t / 0.035)
    s = lp(s, 6000, 2)
    return fade(s, 0.001, 0.02)


def _tick(f0, rng, body=0.25, dur=0.035):
    n = ns(dur)
    exc = np.zeros(n)
    exc[:ns(0.0004)] = rng.standard_normal(ns(0.0004))
    y = modal(exc, [f0, f0 * 2.31, f0 * 4.07], [0.006, 0.0032, 0.0016], [1, 0.45, 0.2])
    y += body * resonator(exc, f0 * 0.34, 0.004)
    y += 0.1 * hp(exc, 3000)
    return fade(y, 0.0001, 0.004)


def tick(v):
    rng = R(320 + v)
    return _tick({1: 2600, 2: 3100, 3: 2200}[v], rng)


def counter_roll():
    rng = R(330)
    dur = 1.5
    n = ns(dur)
    y = np.zeros(n)
    iv = np.concatenate([np.geomspace(0.09, 0.03, 8), np.full(8, 0.03), np.geomspace(0.035, 0.1, 5)])
    tt_ = 0.01 + np.concatenate([[0], np.cumsum(iv)])
    for i, t0 in enumerate(tt_):
        f0 = 2700 if i % 2 == 0 else 2950
        place(y, _tick(f0 * rng.uniform(0.99, 1.01), rng) * rng.uniform(0.75, 0.9), t0)
    td = tt_[-1] + 0.08
    d = bell_tone(hz('E6'), dur - td, rng, base_tau=0.35, strike=0.01)
    d += 0.5 * bell_tone(hz('B6'), dur - td, rng, base_tau=0.25, strike=0)
    place(y, d * 1.05, td)
    st = widen(y, 0.15)
    st = st + 0.15 * reverb(st, rt60=0.6, seed=5, damp=0.3)
    return fade(st, 0.001, 0.15)


def ding(v):
    rng = R(340 + v)
    dur = 1.3
    n = ns(dur)
    y = np.zeros(n)
    if v == 1:
        y += bell_tone(hz('G6'), dur, rng, base_tau=0.6)
        y += 0.35 * bell_tone(hz('G7'), dur, rng, base_tau=0.3, strike=0)
    else:
        a = bell_tone(hz('E6'), dur, rng, base_tau=0.5)
        b = bell_tone(hz('B6'), dur - 0.09, rng, base_tau=0.55)
        y += 0.8 * a
        place(y, b, 0.09)
    st = widen(y, 0.2)
    st = st + 0.25 * reverb(st, rt60=1.0, seed=6, damp=0.35, low_cut=600)
    return fade(st, 0.0005, 0.2)


def chime_soft():
    rng = R(350)
    dur = 2.2
    n = ns(dur)
    st = np.zeros((2, n))
    notes = ['C6', 'E6', 'G6', 'B6', 'D7', 'G7']
    for i, nn in enumerate(notes):
        t0 = 0.02 + i * 0.075
        b = bell_tone(hz(nn), dur - t0, rng, base_tau=0.9, attack=0.004, strike=0.004,
                      amps=(1, .25, .1, .06, .03, .02))
        place(st, pan(b * (0.55 - 0.04 * i), -0.5 + i * 0.2), t0)
    # soft shimmer
    t = tvec(n)
    sh = np.zeros(n)
    for f in [hz('C7'), hz('G7'), hz('E8')]:
        sh += np.sin(TWO_PI * f * t * rng.uniform(0.998, 1.002)) * (0.5 + 0.5 * np.sin(TWO_PI * rng.uniform(5, 8) * t))
    sh *= env_pts(n, [(0, 0), (0.3, 1), (dur, 0)]) * 0.03
    st += widen(sh, 0.5)
    st = st + 0.55 * reverb(st, rt60=2.2, predelay=0.02, seed=7, damp=0.25, low_cut=500)
    return fade(st, 0.002, 0.5)


# ----------------------------------------------------------------------------
# impacts / risers
# ----------------------------------------------------------------------------
def thud_impact(v):
    rng = R(400 + v)
    dur = 1.5
    n = ns(dur)
    t = tvec(n)
    endf = {1: 38, 2: 32}[v]
    f = endf + 65 * np.exp(-t / 0.07)
    sub = np.sin(phase_of(f)) * (1 - np.exp(-t / 0.002)) * np.exp(-t / (0.42 if v == 1 else 0.55))
    sub = soft_sat(sub * 1.6, 1.5)
    fp = 60 + 70 * np.exp(-t / 0.015)
    punch = np.sin(phase_of(fp)) * np.exp(-t / 0.06)
    tr = lp(white(n, rng), 2500 if v == 1 else 1800, 2) * np.exp(-t / 0.012)
    tr = hp(tr, 90)
    rum = lp(brown(n, rng), 300, 2) * exp_decay(n, 0.35, 0.01)
    y = 1.0 * sub + 0.45 * punch + 0.45 * tr + 0.25 * rum
    if v == 2:
        # darker, with a low metallic overtone for drama
        y += 0.06 * partials(n, 97, [1, 2.76, 5.4], [1, .5, .2], [0.5, 0.25, 0.1], rng)
    y = hp(y, 25)
    st = pan(y, 0) / np.sqrt(2)
    wet = reverb(st, rt60=2.4, predelay=0.02, damp=0.8, seed=8, low_cut=60, bright=0.6)
    st = st + 0.38 * wet
    return fade(st, 0.0005, 0.35)


def _riser(dur, seed):
    rng = R(seed)
    n = ns(dur)
    t = tvec(n)
    p = t / dur
    # noise sweep
    nz = pink(n, rng) * 0.5 + white(n, rng) * 0.5

    def fcn(tt):
        pp = np.clip(tt / dur, 0, 1)
        return 300 * (9000 / 300) ** (pp ** 1.4)

    def ampf(tt):
        return np.clip(tt / dur, 0, 1) ** 2.2
    nzs = [stft_shape(nz if ch == 0 else 0.8 * nz + 0.2 * white(n, rng),
                      lambda f, tt: bell_gain(f, fcn(tt), 1.1) * ampf(tt), nfft=1024, hop=256)
           for ch in range(2)]
    nzs = np.vstack(nzs)
    # tonal rise: detuned saws, filter opening
    tone = np.zeros((2, n))
    base = 110 * 2 ** (2.6 * p ** 1.35)
    for i, (det, pn) in enumerate([(-0.012, -0.6), (0.0, 0.0), (0.011, 0.6)]):
        s = saw(base * (1 + det), phase0=rng.uniform())
        s = stft_shape(s, lambda f, tt: lp_gain(f, 400 * 18 ** np.clip(tt / dur, 0, 1), 2), nfft=1024, hop=256)
        tone += pan(s, pn) / np.sqrt(2)
    trem = 1 - 0.35 * (0.5 + 0.5 * np.sin(phase_of(4 + 22 * p ** 2)))
    tone *= p ** 1.8 * trem
    sub = np.sin(phase_of(45 + 40 * p)) * p ** 2 * 0.3
    st = 0.7 * nzs + 0.45 * tone + sub
    st = st + 0.2 * reverb(st, rt60=1.0, seed=9, damp=0.4)
    st = fade(st, 0.01, 0.004)  # abrupt end (4 ms anti-click only)
    return st


def riser():
    return _riser(2.0, 410)


def riser_short():
    return _riser(1.0, 411)


def reverse_swell():
    rng = R(420)
    dur = 1.6
    n = ns(dur)
    t = tvec(n)
    met = np.zeros(n)
    for f in [205.3, 304.4, 369.6, 522.7, 540.0, 800.0]:
        met += square(f * 1.9, n, phase0=rng.uniform())
    met = hp(met, 3500, 2)
    nz = hp(white(n, rng), 5000, 2)
    cym = (0.5 * met + 0.8 * nz) * exp_decay(n, 0.45, 0.001)
    cym = peq(cym, 8000, 4, 0.8)
    st = widen(cym, 0.4)
    st = st + 0.8 * reverb(st, rt60=1.6, seed=10, damp=0.3, low_cut=800)
    st = st[:, ::-1]
    st = st[:, n - ns(1.2):]
    st = st * env_pts(length(st), [(0, 0), (0.6, 0.6), (1.2, 1.0)])
    return fade(st, 0.01, 0.006)


def stamp_thud():
    rng = R(430)
    dur = 0.45
    n = ns(dur)
    t = tvec(n)
    body = np.sin(phase_of(85 + 90 * np.exp(-t / 0.012))) * (1 - np.exp(-t / 0.0015)) * np.exp(-t / 0.05)
    slap = hp(lp(white(n, rng), 1800, 2), 150) * np.exp(-t / 0.014)
    squish = bp(white(n, rng), 300, 900) * exp_decay(n, 0.03, 0.004) * 0.4
    knock = modal(np.r_[1.0, np.zeros(n - 1)], [420, 980], [0.03, 0.012], [0.3, 0.15])
    y = body + 0.7 * slap + squish + knock
    y = soft_sat(y, 1.2)
    st = pan(y, 0) / np.sqrt(2)
    st = st + 0.18 * reverb(st, rt60=0.45, seed=11, damp=0.6)
    return fade(st, 0.0005, 0.08)


def _heart_thump(rng, amp=1.0, f_end=45, length_s=0.3):
    n = ns(length_s)
    t = tvec(n)
    f = f_end + 28 * np.exp(-t / 0.02)
    y = np.sin(phase_of(f)) * (1 - np.exp(-t / 0.006)) * np.exp(-t / 0.075)
    y += 0.4 * lp(white(n, rng), 140, 2) * exp_decay(n, 0.03, 0.004)
    y = soft_sat(y * 1.8, 1.8) / 1.8
    return y * amp


def heartbeat():
    rng = R(440)
    n = ns(1.6)
    y = np.zeros(n)
    for t0 in [0.06, 0.86]:
        place(y, _heart_thump(rng, 1.0, 46), t0)
        place(y, _heart_thump(rng, 0.7, 52), t0 + 0.17)
    y = lp(y, 700, 2)
    st = pan(y, 0) / np.sqrt(2)
    return fade(st, 0.002, 0.15)


# ----------------------------------------------------------------------------
# phones, bells
# ----------------------------------------------------------------------------
def phone_buzz():
    rng = R(450)
    dur = 1.2
    n = ns(dur)
    y = np.zeros(n)
    table_f = [230, 640, 1480, 3200]
    table_tau = [0.02, 0.012, 0.006, 0.003]
    for (a, b) in [(0.03, 0.47), (0.66, 1.1)]:
        m = ns(b - a)
        t = tvec(m)
        f = 172 * (1 - 0.18 * np.exp(-t / 0.03)) * (1 + 0.006 * np.sin(TWO_PI * 7 * t))
        ph = phase_of(f)
        motor = np.tanh(3.5 * np.sin(ph)) * 0.35
        # rattle impulses once per cycle (phone chattering on the table)
        wraps = np.where(np.diff(np.floor(ph / TWO_PI)) > 0)[0]
        imp = np.zeros(m)
        imp[wraps] = rng.uniform(0.5, 1.0, len(wraps))
        rat = modal(imp, table_f, table_tau, [1, .7, .4, .2])
        env = env_pts(m, [(0, 0), (0.02, 1), (b - a - 0.04, 1), (b - a, 0)])
        seg = (motor + 0.6 * rat) * env
        place(y, seg, a)
    y = bp(y, 90, 5500, 2)
    y = soft_sat(y / np.max(np.abs(y)) * 1.2, 1.3)
    st = widen(y, 0.12)
    st = st + 0.1 * reverb(st, rt60=0.4, seed=12, damp=0.6)
    return fade(st, 0.002, 0.03)


def _strike_bells(dur, strike_times, bells, rng, soft=True, boost=0.0):
    """Hammer strikes exciting modal bells; bells = list of (freqs, taus, gains)."""
    n = ns(dur)
    y = np.zeros(n)
    base_burst = lp(white(ns(0.002), rng), 3000 if soft else 8000, 1)
    for i, (t0, bi) in enumerate(strike_times):
        exc = np.zeros(n)
        k = ns(t0)
        if k >= n:
            continue
        burst = base_burst * rng.uniform(0.9, 1.0) * (1 + boost * np.exp(-t0 / 0.12))
        exc[k:k + len(burst)] += burst[:max(0, n - k)]
        fr, ta, ga = bells[bi]
        y += modal(exc, fr, ta, ga)
    return y


def phone_ring():
    rng = R(460)
    dur = 2.5
    f1, f2 = 1180, 1420
    ratios = [1, 2.52, 4.1, 5.9]
    b1 = ([f1 * r for r in ratios], [0.15, 0.08, 0.04, 0.02], [1, .35, .15, .06])
    b2 = ([f2 * r for r in ratios], [0.15, 0.08, 0.04, 0.02], [1, .35, .15, .06])
    strikes = []
    for a, b in [(0.03, 0.83), (1.33, 2.13)]:
        t = a
        i = 0
        while t < b:
            strikes.append((t + rng.uniform(-0.002, 0.002), i % 2))
            t += 1 / 40.0
            i += 1
    y = _strike_bells(dur, strikes, [b1, b2], rng, soft=True)
    y = lp(y, 5000, 2)
    # gentle ramp within each ring
    st = widen(y, 0.2)
    st = st + 0.15 * reverb(st, rt60=0.6, seed=13, damp=0.4)
    return fade(st, 0.003, 0.2)


def school_bell():
    rng = R(470)
    dur = 1.8
    n = ns(dur)
    f0 = 820
    bellm = ([f0 * r for r in [1, 2.32, 4.25, 6.63]], [0.3, 0.18, 0.1, 0.05], [1, .45, .25, .1])
    strikes = []
    t = 0.01
    rate = f0 / 30.0  # hammer locked to the bell -> steady, even ring
    while t < 1.42:
        strikes.append((t + rng.uniform(-0.0002, 0.0002), 0))
        t += 1 / rate
    y = _strike_bells(dur, strikes, [bellm], rng, soft=False, boost=2.5)
    # mechanical buzz of the armature
    tt = tvec(n)
    buzz = square(27.0, n) * env_pts(n, [(0, 0), (0.01, 1), (1.42, 1), (1.45, 0)])
    buzz = bp(buzz, 300, 2500) * 0.15
    y = y / np.max(np.abs(y)) + buzz
    st = widen(y, 0.2)
    st = st + 0.3 * reverb(st, rt60=1.3, seed=14, damp=0.5)
    return fade(st, 0.002, 0.25)


def bike_bell():
    rng = R(480)
    dur = 0.8
    f = 2350
    bellm = ([f, f * 1.0045, f * 2.31, f * 3.86, f * 5.1],
             [0.45, 0.45, 0.2, 0.08, 0.04], [1, .45, .35, .15, .06])
    y = _strike_bells(dur, [(0.01, 0), (0.135, 0)], [bellm], rng, soft=False)
    st = widen(y, 0.2)
    st = st + 0.12 * reverb(st, rt60=0.7, seed=15)
    return fade(st, 0.001, 0.15)


# ----------------------------------------------------------------------------
# breakage / foley
# ----------------------------------------------------------------------------
def glass_break():
    rng = R(490)
    dur = 1.2
    n = ns(dur)
    st = np.zeros((2, n))
    t = tvec(n)
    imp = hp(white(n, rng), 1200, 2) * np.exp(-t / 0.012)
    thud = np.sin(phase_of(130 + 90 * np.exp(-t / 0.01))) * np.exp(-t / 0.03) * 0.5
    crash = bp(white(n, rng), 2000, 11000, 2) * exp_decay(n, 0.11, 0.002) * 0.45
    st += pan(imp + thud + crash, 0) / np.sqrt(2)
    # shards
    times = list(np.abs(rng.exponential(0.07, 110)))
    times += list(0.24 + np.abs(rng.exponential(0.03, 25)))
    times += list(0.43 + np.abs(rng.exponential(0.03, 14)))
    times += list(rng.uniform(0.5, 0.95, 10))
    for t0 in times:
        if t0 > dur - 0.05:
            continue
        f = np.exp(rng.uniform(np.log(2300), np.log(10500)))
        tau = np.clip(0.06 * (4000 / f) ** 1.2 * rng.uniform(0.5, 1.8), 0.012, 0.25)
        m = min(ns(tau * 6), n)
        exc = np.zeros(m)
        exc[:ns(0.0003)] = rng.standard_normal(ns(0.0003))
        s = modal(exc, [f, f * 1.47, f * 2.31], [tau, tau * 0.6, tau * 0.35], [1, .5, .3])
        a = rng.uniform(0.2, 1.0) * np.exp(-t0 / 0.35) * 0.55
        place(st, pan(s * a, rng.uniform(-0.8, 0.8)), t0)
    st = hp(st, 150, 2)
    st = st + 0.18 * reverb(st, rt60=0.6, seed=16, damp=0.4)
    return fade(st, 0.0005, 0.15)


def cookie_crunch():
    rng = R(500)
    dur = 0.4
    n = ns(dur)
    t = tvec(n)
    dens = env_pts(n, [(0, 0), (0.005, 1.0), (0.09, 0.6), (0.13, 0.05), (0.18, 0.5), (0.24, 0.1),
                       (0.27, 0.35), (0.32, 0.05), (0.4, 0)])
    imp = (rng.uniform(size=n) < dens * 900 / SR) * rng.exponential(1.0, n)
    grains = signal.lfilter(rng.standard_normal(ns(0.0015)) * np.hanning(ns(0.0015)), [1], imp)
    crisp = bp(grains, 900, 6500, 2)
    body = bp(white(n, rng), 150, 700, 2) * onepole_smooth(dens, 0.01) * 0.25
    y = crisp + body
    y = peq(y, 2500, 3, 1.0)
    st = widen(y, 0.15)
    return fade(st, 0.001, 0.03)


def _step(rng, amp=1.0, hard=True):
    n = ns(0.18)
    t = tvec(n)
    heel = hp(lp(white(n, rng), 1300, 2), 60) * np.exp(-t / 0.011)
    heel += 0.6 * np.sin(phase_of(80 + 40 * np.exp(-t / 0.01))) * np.exp(-t / 0.028)
    exc = np.zeros(n)
    exc[0] = 1
    if hard:
        heel += 0.12 * modal(exc, [1750, 3100], [0.01, 0.005], [1, 0.5])
    toe = bp(white(n, rng), 800, 4500, 2) * np.exp(-t / 0.007) * 0.45
    y = heel + delay(toe, rng.uniform(0.045, 0.065))
    scuff = bp(white(n, rng), 2000, 7000, 2) * env_pts(n, [(0, 0), (0.05, 0), (0.07, 0.05), (0.12, 0)])
    y += scuff
    return y * amp


def _footsteps(seed, hall=False):
    rng = R(seed)
    dur = 3.0
    n = ns(dur)
    st = np.zeros((2, n))
    for k in range(6):
        t0 = 0.12 + 0.47 * k + rng.uniform(-0.015, 0.015)
        a = (0.95 if k % 2 == 0 else 0.82) * rng.uniform(0.92, 1.05)
        s = _step(rng, a)
        place(st, pan(s, -0.12 if k % 2 == 0 else 0.12), t0)
    st = lp(st, 9000, 2)
    if hall:
        e = echo(st, d=0.16, fb=0.28, n_rep=6, lp_f=2500) - st
        st = st + 0.5 * e + 0.45 * reverb(st, rt60=1.7, predelay=0.03, seed=17, damp=0.5)
        st = fade(st, 0.001, 0.35)
    else:
        st = st + 0.14 * reverb(st, rt60=0.45, seed=18, damp=0.5)
        st = fade(st, 0.001, 0.2)
    return st


def footsteps_walk():
    return _footsteps(510)


def footsteps_hall():
    return _footsteps(511, hall=True)


def _creak(dur, rng, rates):
    n = ns(dur)
    t = tvec(n)
    rate = np.interp(t, np.linspace(0, dur, len(rates)), rates)
    imp = np.zeros(n)
    ph = 0.0
    i = 0
    while True:
        r = rate[min(i, n - 1)] * rng.uniform(0.85, 1.15)
        i += int(SR / r)
        if i >= n:
            break
        imp[i] = rng.uniform(0.6, 1.0)
    y = modal(imp, [380, 650, 1150, 1900, 2900], [0.025, 0.018, 0.01, 0.006, 0.004],
              [0.6, 1.0, 0.8, 0.5, 0.25])
    return y


def door_open():
    rng = R(520)
    dur = 1.0
    n = ns(dur)
    y = np.zeros(n)
    for t0, f, a in [(0.02, 1900, 1.0), (0.075, 2400, 0.7)]:
        exc = np.zeros(ns(0.06))
        exc[:ns(0.0004)] = rng.standard_normal(ns(0.0004))
        c = modal(exc, [f, f * 1.93, f * 3.1], [0.014, 0.008, 0.004], [1, .5, .3])
        place(y, c * a * 0.8, t0)
    cr = _creak(0.78, rng, [60, 140, 260, 220, 160, 110])
    cr *= env_pts(len(cr), [(0, 0), (0.08, 0.8), (0.4, 1.0), (0.65, 0.6), (0.78, 0)])
    place(y, cr * 0.5, 0.17)
    air = lp(pink(n, rng), 400, 2) * env_pts(n, [(0, 0), (0.3, 0.1), (0.9, 0)])
    y += air
    st = widen(y, 0.15)
    st = st + 0.2 * reverb(st, rt60=0.7, seed=19, damp=0.5)
    return fade(st, 0.001, 0.08)


def door_close():
    rng = R(530)
    dur = 0.6
    n = ns(dur)
    t = tvec(n)
    y = np.zeros(n)
    sw = lp(pink(n, rng), 600, 2) * env_pts(n, [(0, 0), (0.07, 0.25), (0.1, 0)])
    y += sw
    m = ns(0.5)
    tt = tvec(m)
    exc = np.zeros(m)
    exc[:ns(0.002)] = lp(rng.standard_normal(ns(0.002)), 2000)
    thud = modal(exc, [95, 180, 410, 760], [0.06, 0.04, 0.025, 0.012], [1, .8, .5, .25]) * 4
    thud += lp(white(m, rng), 900, 2) * np.exp(-tt / 0.02) * 0.6
    place(y, thud, 0.1)
    exc = np.zeros(ns(0.05))
    exc[0] = 1
    latch = modal(exc, [2200, 4300], [0.01, 0.005], [1, 0.4]) * 0.25
    place(y, latch, 0.118)
    y = soft_sat(y / np.max(np.abs(y)), 1.3)
    st = pan(y, 0) / np.sqrt(2)
    st = st + 0.25 * reverb(st, rt60=0.6, seed=20, damp=0.5)
    return fade(st, 0.001, 0.1)


def paper_rustle():
    rng = R(540)
    dur = 0.8
    n = ns(dur)
    g = env_pts(n, [(0, 0), (0.04, 1), (0.2, 0.45), (0.3, 0.95), (0.48, 0.35), (0.57, 0.8),
                    (0.72, 0.1), (0.8, 0)])
    gs = onepole_smooth(g, 0.02)
    # crinkles: dense random grains of varying length and colour
    y = np.zeros(n)
    for L, rate, lo, hi, amp in [(0.0015, 2500, 1500, 9000, 1.0), (0.004, 900, 700, 5000, 0.8),
                                 (0.0008, 5000, 3000, 12000, 0.5)]:
        imp = (rng.uniform(size=n) < gs * rate / SR) * rng.exponential(1.0, n) ** 1.3
        k = ns(L)
        grains = signal.lfilter(rng.standard_normal(k) * np.hanning(k), [1], imp)
        y += amp * bp(grains, lo, hi, 2)
    # sliding / friction bed with fast random amplitude flutter
    flutter = onepole_smooth(rng.uniform(0.2, 1.0, n), 0.004)
    sl = bp(white(n, rng), 1500, 10000, 2) * gs * flutter * 0.35
    y = np.tanh(y / (np.percentile(np.abs(y), 99.7) + 1e-9))
    y = y / (np.max(np.abs(y)) + 1e-9) + sl
    y = peq(y, 3500, 2, 0.8)
    st = np.vstack([y, 0.75 * y + 0.25 * delay(y, 0.0007)])
    return fade(st, 0.002, 0.05)


def pencil_scribble():
    rng = R(550)
    dur = 1.2
    n = ns(dur)
    t = tvec(n)
    strokes = np.abs(np.sin(np.pi * phase_of(7.0 + 1.0 * np.sin(TWO_PI * 0.8 * t)) / TWO_PI)) ** 0.6
    gate = env_pts(n, [(0, 0), (0.04, 1), (0.55, 1), (0.6, 0), (0.68, 0), (0.72, 1), (1.12, 1), (1.18, 0)])
    grain = 0.6 + 0.4 * (rng.uniform(size=n) < 0.3)
    nz = white(n, rng) * grain
    y = bp(nz, 1800, 7500, 2)
    y = peq(y, 4200, 6, 2.0)
    y *= strokes * gate
    y += 0.15 * bp(white(n, rng), 200, 600) * strokes * gate
    st = widen(y, 0.1)
    return fade(st, 0.003, 0.03)


def camera_shutter():
    rng = R(560)
    dur = 0.4
    n = ns(dur)
    y = np.zeros(n)
    for t0, f, a in [(0.015, 2200, 1.0), (0.105, 2700, 0.85)]:
        m = ns(0.06)
        exc = np.zeros(m)
        exc[:ns(0.0005)] = rng.standard_normal(ns(0.0005))
        c = modal(exc, [f, f * 2.13, f * 3.6], [0.008, 0.005, 0.003], [1, .6, .3])
        c += 0.5 * hp(white(m, rng), 2000) * np.exp(-tvec(m) / 0.002)
        c += 0.8 * resonator(exc, 180, 0.01)
        place(y, c * a, t0)
    m = ns(0.16)
    tt = tvec(m)
    wh = saw(380 + 60 * tt / 0.16, m) * 0.15 + bp(white(m, rng), 1000, 4000) * 0.3
    wh *= (1 + 0.4 * np.sin(TWO_PI * 60 * tt)) * env_pts(m, [(0, 0), (0.02, 1), (0.13, 0.8), (0.16, 0)])
    wh = bp(wh, 300, 5000)
    place(y, wh * 0.35, 0.17)
    st = widen(y, 0.12)
    st = st + 0.1 * reverb(st, rt60=0.4, seed=21)
    return fade(st, 0.0005, 0.04)


# ----------------------------------------------------------------------------
# comedy / magic
# ----------------------------------------------------------------------------
def boing_comic():
    rng = R(570)
    dur = 0.6
    n = ns(dur)
    t = tvec(n)
    f = 170 * (1 + 0.45 * np.exp(-t / 0.2) * np.sin(TWO_PI * 11 * t)) * (1 + 0.25 * (1 - np.exp(-t / 0.04)))
    ph = phase_of(f)
    idx = 1.8 * np.exp(-t / 0.08) + 0.3
    y = np.sin(ph + idx * np.sin(2 * ph))
    y += 0.25 * np.sin(2 * ph) * np.exp(-t / 0.1)
    y *= (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.2)
    y = lp(y, 5000)
    st = widen(y, 0.15)
    return fade(st, 0.001, 0.08)


def record_scratch():
    rng = R(580)
    dur = 0.6
    n = ns(dur)
    # source "record": warm chord + drums-ish noise
    sl = ns(3.0)
    st_ = tvec(sl)
    src = np.zeros(sl)
    for f in [hz('C3'), hz('E4'), hz('G4'), hz('C5')]:
        src += saw(f, sl, rng.uniform())
    src = lp(src, 2500) * 0.4 + bp(white(sl, rng), 400, 4000) * 0.5 * (0.5 + 0.5 * np.sign(np.sin(TWO_PI * 4 * st_)))
    t = tvec(n)
    v = np.interp(t, [0, 0.04, 0.07, 0.17, 0.2, 0.3, 0.33, 0.42, 0.45, 0.6],
                  [1.0, 1.0, -2.6, -2.2, 2.8, 2.4, -1.8, -1.4, 0.3, 0.0])
    pos = 1.0 * SR + np.cumsum(v)
    y = np.interp(pos, np.arange(sl), src)
    y *= np.clip(np.abs(v), 0, 1) ** 0.6
    crack = (rng.uniform(size=n) < 0.0015) * rng.uniform(-1, 1, n)
    y += hp(crack, 2000) * 0.3 + hp(white(n, rng), 3000) * 0.015
    y = bp(y, 120, 7000)
    st = widen(y, 0.1)
    return fade(st, 0.001, 0.04)


def sparkle():
    rng = R(590)
    dur = 1.0
    n = ns(dur)
    st = np.zeros((2, n))
    scale = ['C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'D7', 'E7', 'G7', 'A7', 'C8']
    for i in range(26):
        t0 = 0.6 * (i / 26) ** 1.3 + rng.uniform(0, 0.05)
        idx = min(len(scale) - 1, int(i / 26 * len(scale) * 0.7 + rng.integers(0, 4)))
        g = glint(hz(scale[idx]), rng.uniform(0.1, 0.28), rng, bright=0.3)
        place(st, pan(g * rng.uniform(0.3, 0.7), rng.uniform(-0.85, 0.85)), t0)
    air = hp(white(n, rng), 8000) * env_pts(n, [(0, 0), (0.15, 1), (0.8, 0)]) * 0.04
    st += widen(air, 0.6)
    st = hp(st, 900)
    st = st + 0.5 * reverb(st, rt60=1.2, seed=22, damp=0.2, low_cut=1500)
    return fade(st, 0.001, 0.25)


def magic_shimmer():
    rng = R(600)
    dur = 1.5
    n = ns(dur)
    t = tvec(n)
    st = np.zeros((2, n))
    gl = ['C5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'D7', 'E7', 'G7', 'A7', 'C8']
    for i, nm_ in enumerate(gl):
        t0 = 0.02 + i * 0.038
        b = bell_tone(hz(nm_), dur - t0, rng, ratios=(1, 2, 3), amps=(1, .2, .05),
                      base_tau=0.5, attack=0.003, strike=0.0)
        place(st, pan(b * 0.25, -0.7 + 1.4 * i / len(gl)), t0)
    cl = np.zeros((2, n))
    for k, nm_ in enumerate(['C6', 'G6', 'E7', 'C8', 'G7']):
        f = hz(nm_) * rng.uniform(0.997, 1.003)
        trem = 0.5 + 0.5 * np.sin(TWO_PI * rng.uniform(6, 12) * t + rng.uniform(0, 6))
        s = np.sin(TWO_PI * f * t + rng.uniform(0, 6)) * trem
        cl += pan(s, rng.uniform(-0.8, 0.8))
    cl *= env_pts(n, [(0, 0), (0.5, 0.06), (0.8, 0.05), (1.5, 0)])
    st += cl
    st = hp(st, 400)
    st = st + 0.7 * reverb(st, rt60=2.0, seed=23, damp=0.2, low_cut=700)
    return fade(st, 0.002, 0.35)


def swallow_gulp():
    rng = R(610)
    dur = 0.4
    n = ns(dur)
    y = np.zeros(n)
    place(y, click(0.01, rng, 600, 3000, 0.0015) * 0.4, 0.02)
    m = ns(0.2)
    t = tvec(m)
    f = 230 - 90 * (1 - np.exp(-t / 0.05))
    src = saw(f, m)
    v = modal(src, [480, 900, 2300], [0.004, 0.003, 0.002], [1, .5, .15])
    v *= env_pts(m, [(0, 0), (0.02, 1), (0.12, 0.6), (0.2, 0)])
    place(y, v * 0.08, 0.05)
    m = ns(0.08)
    t = tvec(m)
    bl = np.sin(phase_of(260 * (1 + 1.4 * (1 - np.exp(-t / 0.02))))) * (1 - np.exp(-t / 0.001)) * np.exp(-t / 0.02)
    place(y, bl * 0.9, 0.2)
    y = lp(y, 4000)
    st = pan(y, 0) / np.sqrt(2)
    st = st + 0.08 * reverb(st, rt60=0.3, seed=24)
    return fade(st, 0.001, 0.04)


def sigh_air():
    rng = R(620)
    dur = 0.8
    n = ns(dur)
    t = tvec(n)
    nz = pink(n, rng) * 0.5 + white(n, rng) * 0.5
    y = stft_shape(nz, lambda f, tt: (bell_gain(f, 750 - 120 * np.clip(tt / dur, 0, 1), 0.5)
                                      + 0.7 * bell_gain(f, 1250 - 150 * np.clip(tt / dur, 0, 1), 0.45)
                                      + 0.35 * bell_gain(f, 2600, 0.5) + 0.15 * hp_gain(f, 4000)))
    y *= env_pts(n, [(0, 0), (0.12, 0.9), (0.25, 1.0), (0.55, 0.45), (0.8, 0)]) ** 1.3
    st = widen(y, 0.1)
    return fade(st, 0.005, 0.05)


def shaver_buzz():
    rng = R(630)
    dur = 1.5
    n = ns(dur)
    t = tvec(n)
    spin = env_pts(n, [(0, 0.55), (0.12, 1.0), (1.35, 1.0), (1.5, 0.7)])
    f = 118 * spin * (1 + 0.004 * np.sin(TWO_PI * 3 * t))
    ph = phase_of(f)
    motor = np.tanh(2.0 * np.sin(ph)) + 0.4 * np.sin(2 * ph + 0.3) + 0.12 * lp(saw(f * 6.0), 3000)
    whine = np.sin(phase_of(f * 31)) * 0.04
    stub = (rng.uniform(size=n) < 0.004 * env_pts(n, [(0, 0), (0.35, 0), (0.45, 1), (1.1, 1), (1.2, 0)]))
    stub = bp(stub * rng.uniform(0.5, 1, n), 2500, 8000) * 3
    y = motor + whine + stub
    y = bp(y, 90, 6500)
    y = peq(y, 1600, 4, 1.2)
    y = peq(y, 4000, -4, 1.0)
    y *= env_pts(n, [(0, 0), (0.06, 1), (1.4, 1), (1.5, 0)])
    st = widen(y, 0.1)
    return fade(st, 0.003, 0.04)


def bus_brake():
    rng = R(640)
    dur = 1.5
    n = ns(dur)
    t = tvec(n)
    sq_n = ns(0.45)
    tt = tvec(sq_n)
    sq = np.sin(phase_of(1650 * (1 + 0.01 * np.sin(TWO_PI * 7 * tt)) * (1 - 0.06 * tt)))
    sq += 0.3 * np.sin(phase_of(3300 * (1 - 0.06 * tt)))
    sq *= env_pts(sq_n, [(0, 0), (0.05, 0.5), (0.35, 0.4), (0.45, 0)]) * 0.12
    y = np.zeros(n)
    place(y, sq, 0.0)
    hiss = white(n, rng)
    hiss = stft_shape(hiss, lambda f, tt_: hp_gain(f, 2200, 2) * lp_gain(f, 11000, 2)
                      * (1 + 0.6 * bell_gain(f, 5500 - 1500 * np.clip((tt_ - 0.4) / 1.0, 0, 1), 0.7)))
    hiss *= env_pts(n, [(0, 0), (0.38, 0), (0.41, 1.0), (0.6, 0.75), (1.1, 0.25), (1.5, 0)])
    y += 0.55 * hiss
    st = widen(y, 0.3)
    st = st + 0.15 * reverb(st, rt60=0.8, seed=25, damp=0.4)
    return fade(st, 0.002, 0.08)


def card_shuffle():
    rng = R(650)
    dur = 1.0
    n = ns(dur)
    y = np.zeros(n)
    t0 = 0.03
    k = 0
    while t0 < 0.62:
        m = ns(0.012)
        c = bp(white(m, rng), 1800, 7000) * np.exp(-tvec(m) / 0.0025)
        c += 0.3 * lp(white(m, rng), 900) * np.exp(-tvec(m) / 0.004)
        place(y, c * rng.uniform(0.5, 1.0), t0)
        t0 += max(0.007, 0.016 - 0.008 * k / 50) * rng.uniform(0.8, 1.2)
        k += 1
    m = ns(0.22)
    br = bp(pink(m, rng), 800, 6000) * env_pts(m, [(0, 0), (0.05, 1), (0.22, 0)]) * 0.5
    place(y, br, 0.66)
    st = widen(y, 0.2)
    st = st + 0.1 * reverb(st, rt60=0.4, seed=26)
    return fade(st, 0.001, 0.05)


def tv_static_off():
    rng = R(660)
    dur = 0.5
    n = ns(dur)
    t = tvec(n)
    stat = white(n, rng) * (0.7 + 0.3 * (rng.uniform(size=n) < 0.05))
    stat = bp(stat, 300, 12000)
    stat *= env_pts(n, [(0, 0), (0.005, 1), (0.22, 1), (0.27, 0)])
    stat = stft_shape(stat, lambda f, tt: lp_gain(f, 12000 * 0.03 ** np.clip((tt - 0.18) / 0.1, 0, 1), 2))
    zf = 3200 * (0.03 ** np.clip((t - 0.2) / 0.14, 0, 1))
    zip_ = np.sin(phase_of(zf)) * env_pts(n, [(0, 0), (0.19, 0), (0.21, 0.35), (0.34, 0.2), (0.38, 0)])
    th = np.zeros(n)
    m = ns(0.12)
    place(th, np.sin(phase_of(70 + 40 * np.exp(-tvec(m) / 0.01))) * np.exp(-tvec(m) / 0.03), 0.33)
    y = 0.5 * stat + zip_ + 0.5 * th
    st = widen(y, 0.2)
    return fade(st, 0.002, 0.08)


def glitch():
    rng = R(670)
    dur = 0.4
    n = ns(dur)
    st = np.zeros((2, n))
    t0 = 0.0
    while t0 < 0.36:
        L = rng.choice([0.012, 0.02, 0.03, 0.045])
        m = ns(L)
        kind = rng.integers(0, 4)
        if kind == 0:
            s = square(rng.choice([220, 440, 880, 1760, 3520]), m) * 0.5
        elif kind == 1:
            s = white(m, rng) * 0.4
            hold = rng.integers(4, 30)
            s = np.repeat(s[::hold], hold)[:m]
        elif kind == 2:
            s = np.sin(phase_of(np.linspace(rng.uniform(200, 4000), rng.uniform(100, 3000), m))) * 0.6
            s = np.round(s * 4) / 4
        else:
            s = np.zeros(m)
        g = (np.sin(TWO_PI * rng.uniform(30, 60) * tvec(m)) > -0.3).astype(float)
        s = fade(s * g, 0.0005, 0.0008)
        place(st, pan(s, rng.choice([-0.8, -0.3, 0.3, 0.8])), t0)
        t0 += L
    st = hp(st, 80)
    return fade(st, 0.001, 0.02)


# ----------------------------------------------------------------------------
# ambiences (loopable)
# ----------------------------------------------------------------------------
VOWELS = [(730, 1090, 2440), (270, 2290, 3010), (530, 1840, 2480), (660, 1720, 2410),
          (570, 840, 2410), (440, 1020, 2240), (300, 870, 2240), (640, 1190, 2390),
          (490, 1350, 1690)]


def _voice(dur, rng, female):
    n = ns(dur)
    y = np.zeros(n)
    t = rng.uniform(0, 0.8)
    base = rng.uniform(175, 240) if female else rng.uniform(95, 140)
    while t < dur - 0.1:
        nsyl = rng.integers(3, 12)
        f_start = base * rng.uniform(0.95, 1.2)
        for s in range(nsyl):
            L = rng.uniform(0.08, 0.22)
            m = ns(L)
            prog = s / max(nsyl - 1, 1)
            f0 = f_start * (1 - 0.18 * prog) * (1 + 0.08 * rng.standard_normal())
            ff = f0 * (1 + 0.06 * np.sin(np.linspace(0, np.pi, m)) * rng.choice([-1, 1]))
            src = saw(ff, phase0=rng.uniform()) + 0.05 * white(m, rng)
            F = VOWELS[rng.integers(0, len(VOWELS))]
            sc = 1.12 if female else 1.0
            v = modal(src, [F[0] * sc, F[1] * sc, F[2] * sc], [0.006, 0.004, 0.003], [1, .6, .3])
            v *= env_pts(m, [(0, 0), (0.015, 1), (L * 0.7, 0.8), (L, 0)])
            if rng.uniform() < 0.3:
                c = bp(white(ns(0.04), rng), 3000, 7000) * exp_decay(ns(0.04), 0.012, 0.003) * 0.3
                v = np.concatenate([c, v])
            place(y, v, t)
            t += L * rng.uniform(0.85, 1.05)
            if t > dur:
                break
        t += rng.uniform(0.25, 0.9)
    return y


def _crowd(dur, rng, n_voices, rt=1.0, wet=0.45, lpf=3200):
    n = ns(dur)
    st = np.zeros((2, n))
    for k in range(n_voices):
        v = _voice(dur, rng, female=(k % 2 == 0))
        dist = rng.uniform(0.3, 1.0)
        v = lp(v, lpf * (1.2 - 0.6 * dist))
        place(st, pan(v * (1.1 - dist * 0.7) / np.sqrt(n_voices), rng.uniform(-0.9, 0.9)), 0)
    st = hp(st, 120)
    st = st + wet * reverb(st, rt60=rt, predelay=0.02, seed=27, damp=0.55)
    return st


def crowd_murmur():
    rng = R(700)
    dur, xf = 6.0, 1.0
    st = _crowd(dur + xf + 1.0, rng, 22)[:, ns(1.0):]  # skip reverb build-up
    bed = lp(pink(length(st), rng), 1500) * 0.02
    st = st + widen(bed, 0.4)
    return loopify(st, ns(dur), ns(xf))


def cafeteria_ambience():
    rng = R(710)
    dur, xf = 8.0, 1.0
    total = dur + xf + 1.0
    n = ns(total)
    st = _crowd(total, rng, 30, rt=1.5, wet=0.6, lpf=2800) * 0.9
    clinks = np.zeros((2, n))
    for k in range(45):
        t0 = rng.uniform(0, total - 0.3)
        f = np.exp(rng.uniform(np.log(2400), np.log(6500)))
        m = ns(0.35)
        exc = np.zeros(m)
        exc[:ns(0.0003)] = rng.standard_normal(ns(0.0003))
        c = modal(exc, [f, f * 2.76, f * 5.4], [0.12, 0.05, 0.02], [1, .4, .15])
        place(clinks, pan(c * rng.uniform(0.05, 0.25), rng.uniform(-0.9, 0.9)), t0)
    for k in range(4):  # plates / trays
        t0 = rng.uniform(0.2, total - 0.6)
        for j in range(rng.integers(2, 5)):
            f = np.exp(rng.uniform(np.log(900), np.log(2600)))
            m = ns(0.3)
            exc = np.zeros(m)
            exc[:ns(0.001)] = rng.standard_normal(ns(0.001))
            c = modal(exc, [f, f * 1.6, f * 2.9], [0.08, 0.04, 0.02], [1, .6, .3])
            place(clinks, pan(c * 0.12, rng.uniform(-0.7, 0.7)), t0 + j * rng.uniform(0.02, 0.06))
    clinks = clinks + 0.6 * reverb(clinks, rt60=1.5, seed=28, damp=0.5)
    hvac = lp(brown(n, rng), 250) * 0.05
    st = st + 0.5 * clinks + widen(hvac, 0.3)
    st = st[:, ns(1.0):]
    return loopify(st, ns(dur), ns(xf))


def room_tone_home():
    rng = R(720)
    dur, xf = 10.0, 1.5
    n = ns(dur + xf)
    t = tvec(n)
    bedL = lp(brown(n, rng), 500) * 0.5 + lp(pink(n, rng), 2500) * 0.12
    bedR = lp(brown(n, rng), 500) * 0.5 + lp(pink(n, rng), 2500) * 0.12
    am = 1 + 0.15 * np.sin(TWO_PI * 0.1 * t)
    hum = (np.sin(TWO_PI * 60 * t) * 0.35 + np.sin(TWO_PI * 120 * t + 0.4) * 0.5
           + np.sin(TWO_PI * 180 * t + 1.1) * 0.15 + np.sin(TWO_PI * 240 * t) * 0.06) * am
    whine = np.sin(TWO_PI * 410 * t) * 0.012 * am
    hum = (hum * 0.09 + whine)
    st = np.vstack([bedL + 0.9 * hum, bedR + 0.8 * hum])
    st = hp(st, 30)
    return loopify(st, ns(dur), ns(xf))


def room_tone_care():
    rng = R(730)
    dur, xf = 10.0, 1.5
    n = ns(dur + xf)
    bed = np.vstack([lp(pink(n, rng), 3500) * 0.1 + lp(brown(n, rng), 400) * 0.2 for _ in range(2)])
    bed = hp(bed, 40)
    bed = loopify(bed, ns(dur), ns(xf))
    # clock ticks: placed circularly so the loop stays exact (10 per loop)
    m = ns(dur)
    ticks = np.zeros(m + ns(0.5))
    for k in range(10):
        f0 = 3000 if k % 2 == 0 else 2550
        tk = _tick(f0 * rng.uniform(0.995, 1.005), rng, body=0.6, dur=0.05)
        tk = lp(tk, 6000) * 0.35
        place(ticks, tk, 0.5 + k * 1.0)
    ticks[:ns(0.5)] += ticks[m:]
    ticks = ticks[:m]
    tst = pan(ticks, 0.25)
    tst = tst + 0.4 * reverb(np.concatenate([tst, tst], axis=1), rt60=0.5, seed=29)[:, m:]
    st = bed + tst
    # re-rotate to a near-zero sample (keeps loop exact)
    mag = np.sum(np.abs(st), axis=0)
    mag2 = mag + np.roll(mag, 1)
    k = int(np.argmin(mag2[ns(0.1):ns(0.45)])) + ns(0.1)
    return np.roll(st, -k, axis=1)


def clock_tick():
    rng = R(740)
    dur = 4.0
    n = ns(dur)
    y = np.zeros(n)
    for k in range(8):
        f0 = 3000 if k % 2 == 0 else 2400
        tk = _tick(f0 * rng.uniform(0.995, 1.005), rng, body=0.7, dur=0.06)
        exc = np.zeros(ns(0.06))
        exc[0] = 1
        tk += 0.25 * resonator(exc, 950 if k % 2 == 0 else 780, 0.012)
        place(y, tk * (1.0 if k % 2 == 0 else 0.85), 0.05 + 0.5 * k)
    y = lp(y, 7000)
    st = widen(y, 0.1)
    st = st + 0.2 * reverb(st, rt60=0.5, seed=30, damp=0.5)
    return fade(st, 0.001, 0.2)


# ----------------------------------------------------------------------------
# registry
# ----------------------------------------------------------------------------
def registry():
    R_ = {}
    for v in (1, 2, 3):
        R_[f'pop_age_{v}'] = (lambda v=v: pop_age(v), 'Signature age-up: knuckle crack-pop + sub whomp + sparkle tail')
        R_[f'whoosh_fast_{v}'] = (lambda v=v: whoosh_fast(v), 'Fast whoosh, band-pass sweep with pan movement')
        R_[f'pop_ui_{v}'] = (lambda v=v: pop_ui(v), 'Small bubbly pop for text badges')
        R_[f'blip_{v}'] = (lambda v=v: blip(v), 'Soft UI blip')
        R_[f'tick_{v}'] = (lambda v=v: tick(v), 'Clean counter tick')
    for v in (1, 2):
        R_[f'whoosh_slow_{v}'] = (lambda v=v: whoosh_slow(v), 'Slow whoosh with pan movement')
        R_[f'swish_whip_{v}'] = (lambda v=v: swish_whip(v), 'Very fast whip-pan swish')
        R_[f'ding_{v}'] = (lambda v=v: ding(v), 'Bright notification chime')
        R_[f'thud_impact_{v}'] = (lambda v=v: thud_impact(v), 'Deep cinematic impact: sub drop + transient + tail')
    simple = {
        'counter_roll': (counter_roll, 'Accelerating counter ticks settling into a soft ding'),
        'chime_soft': (chime_soft, 'Gentle magical rolled chime for warm moments'),
        'riser': (riser, 'Tension riser (noise + rising tone), abrupt end for a hit'),
        'riser_short': (riser_short, 'Short tension riser, abrupt end'),
        'reverse_swell': (reverse_swell, 'Reverse-cymbal swell, ends at peak'),
        'stamp_thud': (stamp_thud, 'Rubber stamp hit'),
        'heartbeat': (heartbeat, 'Two soft low heartbeats (lub-dub)'),
        'phone_buzz': (phone_buzz, 'Phone vibrating on a table, two pulses'),
        'phone_ring': (phone_ring, 'Gentle classic phone ring, two rings'),
        'school_bell': (school_bell, 'Electric school bell'),
        'glass_break': (glass_break, 'Glass cup shattering on a floor'),
        'cookie_crunch': (cookie_crunch, 'Cookie bite crunch'),
        'footsteps_walk': (footsteps_walk, '6 soft steps on a hard floor'),
        'footsteps_hall': (footsteps_hall, '6 steps in a hallway with echo'),
        'door_open': (door_open, 'Door latch click + creak'),
        'door_close': (door_close, 'Door close thud + latch'),
        'paper_rustle': (paper_rustle, 'Paper rustle'),
        'pencil_scribble': (pencil_scribble, 'Pencil scribbling on paper'),
        'camera_shutter': (camera_shutter, 'Camera shutter click-clack + wind'),
        'boing_comic': (boing_comic, 'Comedic spring boing'),
        'record_scratch': (record_scratch, 'Vinyl record scratch / stop'),
        'sparkle': (sparkle, 'Twinkly glints'),
        'magic_shimmer': (magic_shimmer, 'Magical harp-like shimmer'),
        'crowd_murmur': (crowd_murmur, 'Indistinct crowd chatter (seamless loop)'),
        'cafeteria_ambience': (cafeteria_ambience, 'Cafeteria chatter + cutlery clinks (seamless loop)'),
        'room_tone_home': (room_tone_home, 'Warm home room tone + faint fridge hum (seamless loop)'),
        'room_tone_care': (room_tone_care, 'Quiet care-home room tone + faint 1 s clock tick (seamless loop)'),
        'clock_tick': (clock_tick, 'Clock tick-tock, 8 beats'),
        'swallow_gulp': (swallow_gulp, 'Comedic gulp'),
        'sigh_air': (sigh_air, 'Breathy sigh, noise only'),
        'shaver_buzz': (shaver_buzz, 'Electric razor buzz'),
        'bus_brake': (bus_brake, 'Bus brake squeal + air brake hiss'),
        'card_shuffle': (card_shuffle, 'Card riffle shuffle'),
        'bike_bell': (bike_bell, 'Bicycle bell ring-ring'),
        'tv_static_off': (tv_static_off, 'TV static switching off'),
        'glitch': (glitch, 'Digital glitch stutter'),
    }
    R_.update(simple)
    return R_


def make_sfx(names=None):
    reg = registry()
    out = {}
    for name, (fn, desc) in reg.items():
        if names and name not in names and name.rsplit('_', 1)[0] not in names:
            continue
        x = fn()
        base = name.rsplit('_', 1)[0] if name[-1].isdigit() else name
        path = os.path.join(OUT, name + '.wav')
        if base in LOOPABLE or name in LOOPABLE:
            # loops: no fades (seam is continuous and starts on a near-zero sample)
            x = x - np.mean(x, axis=-1, keepdims=True)
            x = normalize_peak(x, -3.0)
            write_wav(path, x)
        else:
            finish_sfx(x, path)
        out[name] = (path, length(x) / SR, desc)
        print(f'  sfx {name:22s} {length(x) / SR:5.2f}s')
    return out


if __name__ == '__main__':
    import sys
    make_sfx(sys.argv[1:] or None)

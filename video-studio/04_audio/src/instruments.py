"""Synthesised instruments for the score. All return mono (n,) unless noted."""
import numpy as np
from dsp import *  # noqa


def _rng(rng):
    return rng if rng is not None else np.random.default_rng(0)


# ----------------------------------------------------------------------------
# felt piano: inharmonic additive partials, two-string detune, two-stage decay,
# felt low-pass, hammer thump, damper release.
# ----------------------------------------------------------------------------
def piano(f, dur, vel=0.6, rng=None, release=0.35, bright=0.0, max_len=9.0):
    rng = _rng(rng)
    tail = release + 0.05
    n = ns(min(dur + tail, max_len))
    t = tvec(n)
    B = 0.00008 * (f / 110.0) ** 0.8
    tau0 = float(np.clip(3.6 * (220.0 / f) ** 0.6, 0.6, 9.0))
    fc = 350 + 2400 * vel ** 1.6 + 1800 * bright
    y = np.zeros(n)
    kmax = int(min(30, 15000 / f))
    hp_pos = 1.0 / 8.3  # hammer strike position -> comb on harmonics
    for k in range(1, kmax + 1):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 16000:
            break
        a = (1.0 / k ** 0.85) / (1.0 + (fk / fc) ** 2)
        a *= 0.5 + 0.5 * abs(np.sin(np.pi * k * hp_pos))
        if a < 0.0015:
            continue
        tk = tau0 / (1 + 0.11 * (k - 1))
        m = min(n, ns(tk * 7.0) + 1)
        tt = t[:m]
        env = 0.6 * np.exp(-tt / (tk * 0.16)) + 0.4 * np.exp(-tt / tk)
        d = rng.uniform(0.15, 0.5) * 1e-3 * (1 if k < 12 else 0.5)
        p1, p2 = rng.uniform(0, TWO_PI, 2)
        s = 0.5 * (np.sin(TWO_PI * fk * tt + p1) + np.sin(TWO_PI * fk * (1 + d) * tt + p2))
        y[:m] += a * env * s
    # attack (felt) + hammer thump
    y *= 1 - np.exp(-t / (0.0035 - 0.0015 * vel))
    hm = ns(0.04)
    thump = lp(rng.standard_normal(hm), 900 + 1500 * vel, 2) * np.exp(-tvec(hm) / 0.006)
    y[:hm] += 0.035 * vel * thump * (f / 261.0) ** -0.2
    # damper
    off = ns(dur)
    if off < n:
        r = tvec(n - off)
        y[off:] *= np.exp(-r / (release / 4.5))
    y = fade(y, 0, 0.02)
    return y * (0.25 + 0.75 * vel) ** 1.4


# ----------------------------------------------------------------------------
# marimba: modal bar (1 : 3.98 : 9.85), soft mallet
# ----------------------------------------------------------------------------
def marimba(f, vel=0.7, rng=None, max_len=2.5, mallet_hard=0.5):
    rng = _rng(rng)
    tau1 = float(np.clip(1.0 * (220.0 / f) ** 0.75, 0.16, 1.3))
    n = ns(min(tau1 * 6.5, max_len))
    y = partials(n, f, [1, 3.98, 9.85, 2.0], [1, 0.22 + 0.3 * vel * mallet_hard, 0.07 * vel * mallet_hard, 0.03],
                 [tau1, tau1 * 0.2, tau1 * 0.06, tau1 * 0.3], rng, attack=0.0008 + 0.0012 * (1 - mallet_hard))
    m = ns(0.02)
    mal = lp(rng.standard_normal(m), 1200 + 2500 * mallet_hard, 2) * np.exp(-tvec(m) / 0.0015)
    y[:m] += 0.08 * vel * mal
    y = fade(y, 0, 0.02)
    return y * (0.3 + 0.7 * vel)


# ----------------------------------------------------------------------------
# pizzicato / pluck: Karplus-Strong (block-vectorised), fractional-delay tuned
# ----------------------------------------------------------------------------
def pluck(f, vel=0.7, rng=None, t60=0.55, bright=0.5, length_s=None, body=True):
    rng = _rng(rng)
    P = SR / f
    N = int(np.floor(P - 0.5))
    fr = P - 0.5 - N
    c0, c1, c2 = 0.5 * (1 - fr), 0.5, 0.5 * fr
    g = 10 ** (-3.0 / (t60 * f))
    n = ns(length_s if length_s else t60 * 1.3)
    exc = rng.uniform(-1, 1, N)
    exc = lp(exc, 600 + 5000 * bright * vel, 2)
    exc -= exc.mean()
    # pluck position comb
    exc = exc - 0.6 * np.roll(exc, max(1, N // 5))
    H = N + 2
    y = np.zeros(n + H)
    x = np.zeros(n + H)
    x[H:H + N] = exc[:min(N, n)]
    start = H
    end_all = n + H
    while start < end_all:
        end = min(start + N, end_all)
        idx = np.arange(start, end)
        y[idx] = x[idx] + g * (c0 * y[idx - N] + c1 * y[idx - N - 1] + c2 * y[idx - N - 2])
        start = end
    y = y[H:]
    if body:
        y = peq(y, 260, 4, 1.2)
        y = peq(y, 3000, -3, 0.8)
    y = hp(y, 60)
    y = fade(y, 0.0005, 0.03)
    return y / (np.max(np.abs(y)) + 1e-9) * (0.3 + 0.7 * vel)


# ----------------------------------------------------------------------------
# sustained synths (stereo)
# ----------------------------------------------------------------------------
def _env_ar(n, attack, rel_start_s, release):
    t = tvec(n)
    a = np.clip(t / max(attack, 1e-3), 0, 1)
    a = np.sin(a * np.pi / 2) ** 2
    r = np.clip((t - rel_start_s) / max(release, 1e-3), 0, 1)
    r = np.cos(r * np.pi / 2) ** 2
    return a * r


def pad(freqs, dur, rng=None, attack=1.2, release=1.8, cutoff=1600, detune_cents=9, voices=3,
        spread=0.7, amp=1.0):
    rng = _rng(rng)
    n = ns(dur + release)
    t = tvec(n)
    out = np.zeros((2, n))
    for f in freqs:
        for v in range(voices):
            c = (v - (voices - 1) / 2) * detune_cents
            drift = 1 + 0.0012 * np.sin(TWO_PI * rng.uniform(0.1, 0.3) * t + rng.uniform(0, 6))
            s = saw(f * 2 ** (c / 1200) * drift, phase0=rng.uniform())
            p = spread * ((v / max(voices - 1, 1)) * 2 - 1) if voices > 1 else 0
            out += pan(s, p) / np.sqrt(2)
    out = lp(out, cutoff, 2)
    out = lp(out, cutoff * 1.6, 1)
    out = hp(out, 70, 2)
    out *= _env_ar(n, attack, dur, release)
    return out * amp / (len(freqs) * voices) ** 0.5


def strings(freqs, dur, rng=None, attack=0.6, release=1.2, cutoff=2600, voices=5, amp=1.0,
            vib_depth=0.0028, spread=0.8, bright_curve=None, dark_cutoff=None):
    """Ensemble strings. If bright_curve (n-length 0..1) is given, crossfades
    between a dark (dark_cutoff) and bright (cutoff) filtered version."""
    rng = _rng(rng)
    n = ns(dur + release)
    t = tvec(n)
    out = np.zeros((2, n))
    vib_env = np.clip((t - 0.25) / 0.8, 0, 1)
    for f in freqs:
        for v in range(voices):
            cents = rng.normal(0, 6)
            vib = 1 + vib_depth * vib_env * np.sin(TWO_PI * rng.uniform(4.8, 5.8) * t + rng.uniform(0, 6))
            drift = 1 + 0.0015 * np.sin(TWO_PI * rng.uniform(0.07, 0.25) * t + rng.uniform(0, 6))
            s = saw(f * 2 ** (cents / 1200) * vib * drift, phase0=rng.uniform())
            p = spread * rng.uniform(-1, 1)
            out += pan(s, p) / np.sqrt(2)
    out = hp(out, 90, 2)
    # body resonances
    out = peq(out, 450, 3, 1.0)
    out = peq(out, 1500, 2, 1.2)
    out = peq(out, 3500, -3, 1.0)
    if bright_curve is not None:
        dark = lp(out, dark_cutoff or cutoff * 0.35, 4)
        brt = lp(out, cutoff, 4)
        bc = fit(bright_curve, n)
        out = dark * (1 - bc) + brt * bc
    else:
        out = lp(out, cutoff, 4)
    out = lp(out, max(cutoff * 2.2, 5000), 2)  # tame saw fizz above the passband
    # bow noise (subtle)
    bn = lp(bp(rng.standard_normal(n), 2000, 6000, 2), 6000, 2) * 0.006
    out += np.vstack([bn, np.roll(bn, 37)])
    out *= _env_ar(n, attack, dur, release)
    return out * amp / (len(freqs) * voices) ** 0.5


def bass_synth(f, dur, vel=0.8, rng=None, tau=0.18, cutoff_k=0.35):
    """Plucky filtered-saw bass via additive partials whose decay speeds up with
    harmonic number (emulates a decaying low-pass envelope)."""
    rng = _rng(rng)
    n = ns(dur + 0.05)
    t = tvec(n)
    y = np.zeros(n)
    kmax = int(min(60, 5000 / f))
    for k in range(1, kmax + 1):
        tk = tau / (1 + cutoff_k * (k - 1))
        sustain = 0.25 / k ** 1.5
        env = sustain + (1 - sustain) * np.exp(-t / tk)
        y += (1.0 / k) * env * np.sin(TWO_PI * k * f * t)
    y += 0.6 * np.sin(TWO_PI * f * t)  # sub reinforcement
    y *= _env_ar(n, 0.004, dur, 0.04)
    return y * vel


def drone(freqs, dur, rng=None, cutoff=500, wobble=0.25, amp=1.0):
    rng = _rng(rng)
    n = ns(dur)
    t = tvec(n)
    out = np.zeros((2, n))
    for f in freqs:
        for v in range(3):
            c = (v - 1) * 7
            s = saw(f * 2 ** (c / 1200) * (1 + 0.001 * np.sin(TWO_PI * 0.13 * t + v)), phase0=rng.uniform())
            out += pan(s, (v - 1) * 0.6) / np.sqrt(2)
    dark = lp(out, cutoff * 0.6, 2)
    brt = lp(out, cutoff * 1.8, 2)
    lfo = 0.5 + 0.5 * np.sin(TWO_PI * wobble * t - np.pi / 2)
    out = dark * (1 - lfo) + brt * lfo
    out += pan(np.sin(TWO_PI * freqs[0] * t) * 0.8, 0) / np.sqrt(2)
    out = hp(out, 30)
    return out * amp / len(freqs) ** 0.5


# ----------------------------------------------------------------------------
# bells
# ----------------------------------------------------------------------------
def soft_bell(f, vel=0.6, rng=None, length_s=3.0):
    rng = _rng(rng)
    n = ns(length_s)
    base = float(np.clip(1.8 * (880 / f) ** 0.5, 0.6, 3.0))
    y = partials(n, f, [1, 2.0, 2.76, 4.0, 5.4], [1, .28, .12, .06, .03],
                 [base, base * 0.5, base * 0.3, base * 0.2, base * 0.12], rng, attack=0.002)
    return fade(y, 0, 0.05) * vel


def music_box(f, vel=0.6, rng=None, length_s=2.5, detune_cents=0.0):
    rng = _rng(rng)
    f = f * 2 ** (detune_cents / 1200)
    n = ns(length_s)
    base = float(np.clip(1.6 * (1000 / f) ** 0.35, 0.6, 2.5))
    t = tvec(n)
    wob = 1 + 0.0015 * np.sin(TWO_PI * 4.5 * t) * np.exp(-t / 0.5)
    y = np.sin(phase_of(f * wob) + rng.uniform(0, 6)) * np.exp(-t / base)
    y += 0.25 * np.sin(TWO_PI * f * 5.4 * t) * np.exp(-t / (base * 0.12))
    y += 0.08 * np.sin(TWO_PI * f * 8.93 * t) * np.exp(-t / (base * 0.05))
    y += 0.05 * np.sin(TWO_PI * f * 2.0 * t) * np.exp(-t / (base * 0.5))
    y *= 1 - np.exp(-t / 0.0008)
    m = ns(0.006)
    y[:m] += 0.05 * hp(rng.standard_normal(m), 4000) * np.exp(-tvec(m) / 0.001)
    return fade(y, 0, 0.05) * vel


# ----------------------------------------------------------------------------
# percussion
# ----------------------------------------------------------------------------
def kick_soft(vel=0.7, rng=None):
    rng = _rng(rng)
    n = ns(0.45)
    t = tvec(n)
    f = 46 + 70 * np.exp(-t / 0.03)
    y = np.sin(phase_of(f)) * (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.16)
    y += 0.08 * lp(rng.standard_normal(n), 3000) * np.exp(-t / 0.004)
    y = soft_sat(y * 1.3, 1.2)
    return fade(y, 0, 0.05) * vel


def shaker(vel=0.5, rng=None, length_s=0.09):
    rng = _rng(rng)
    n = ns(length_s)
    y = bp(rng.standard_normal(n), 4500, 12000, 2)
    y *= env_pts(n, [(0, 0), (length_s * 0.35, 1), (length_s, 0)]) ** 1.5
    return y * vel * 0.5


def clap(vel=0.7, rng=None):
    rng = _rng(rng)
    n = ns(0.25)
    t = tvec(n)
    e = np.zeros(n)
    for k, d in enumerate([0.0, 0.009, 0.017]):
        e += (t >= d) * np.exp(-np.clip(t - d, 0, None) / 0.006) * (0.7 + 0.15 * k)
    e += (t >= 0.025) * np.exp(-np.clip(t - 0.025, 0, None) / 0.06) * 0.6
    y = bp(rng.standard_normal(n), 900, 5000, 2) * e
    y = peq(y, 1400, 4, 1.5)
    return fade(y, 0, 0.03) * vel * 0.6


def hat_tick(vel=0.5, rng=None, open_=False):
    rng = _rng(rng)
    n = ns(0.12 if open_ else 0.045)
    t = tvec(n)
    met = np.zeros(n)
    for fr in [205.3, 304.4, 369.6, 522.7, 540.0, 800.0]:
        met += square(fr * 2.2, n, phase0=rng.uniform())
    y = 0.6 * met + 0.8 * rng.standard_normal(n)
    y = hp(y, 7000, 2)
    y = lp(y, 14000, 2)
    y *= np.exp(-t / (0.04 if open_ else 0.009)) * (1 - np.exp(-t / 0.0003))
    return fade(y, 0, 0.005) * vel * 0.5


def snap(vel=0.6, rng=None):
    rng = _rng(rng)
    n = ns(0.12)
    t = tvec(n)
    y = bp(rng.standard_normal(n), 1500, 6000, 2) * np.exp(-t / 0.012)
    y += 0.4 * np.sin(TWO_PI * 1900 * t) * np.exp(-t / 0.008)
    return fade(y, 0, 0.02) * vel * 0.6


def boom(vel=0.8, rng=None, length_s=2.5):
    rng = _rng(rng)
    n = ns(length_s)
    t = tvec(n)
    f = 36 + 40 * np.exp(-t / 0.08)
    y = np.sin(phase_of(f)) * (1 - np.exp(-t / 0.01)) * np.exp(-t / 0.7)
    y += 0.2 * lp(rng.standard_normal(n), 500) * np.exp(-t / 0.08)
    y = soft_sat(y * 1.4, 1.3)
    return fade(y, 0, 0.3) * vel


def heart_pulse(vel=0.7, rng=None):
    rng = _rng(rng)
    n = ns(0.6)
    y = np.zeros(n)
    for d, a, fe in [(0.0, 1.0, 44), (0.19, 0.65, 50)]:
        m = ns(0.3)
        t = tvec(m)
        s = np.sin(phase_of(fe + 22 * np.exp(-t / 0.02))) * (1 - np.exp(-t / 0.008)) * np.exp(-t / 0.08)
        place(y, s * a, d)
    y = soft_sat(y * 1.6, 1.5)
    y = lp(y, 400)
    return fade(y, 0, 0.05) * vel


def cym_swell(length_s=2.0, rng=None):
    """Reverse-cymbal style swell (stereo), ends at its peak."""
    rng = _rng(rng)
    n = ns(length_s)
    t = tvec(n)
    met = np.zeros(n)
    for fr in [205.3, 304.4, 369.6, 522.7, 540.0, 800.0]:
        met += square(fr * 1.7, n, phase0=rng.uniform())
    y = hp(0.4 * met + rng.standard_normal(n), 4000, 2)
    y = lp(y, 13000, 2)
    y *= (t / length_s) ** 3
    st = widen(y, 0.4)
    return fade(st, 0.01, 0.01)

"""Core DSP toolkit for procedural sound design.

Everything is numpy/scipy, 48 kHz. Signals are float64.
Mono signals are 1-D arrays; stereo signals are shape (2, n) (channels first).
"""
import os
import warnings
import numpy as np
from scipy import signal
from scipy.io import wavfile
from scipy.ndimage import minimum_filter1d

SR = 48000
TWO_PI = 2.0 * np.pi


# ----------------------------------------------------------------------------
# basics
# ----------------------------------------------------------------------------
def ns(t):
    """seconds -> samples"""
    return int(round(t * SR))


def tvec(n):
    return np.arange(n) / SR


def midi_hz(m):
    return 440.0 * 2.0 ** ((np.asarray(m, dtype=float) - 69.0) / 12.0)


NOTE_IDX = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def nm(name):
    """'C#4' -> midi number (C4 = 60)."""
    letter = name[0].upper()
    rest = name[1:]
    acc = 0
    while rest and rest[0] in '#b':
        acc += 1 if rest[0] == '#' else -1
        rest = rest[1:]
    octave = int(rest)
    return 12 * (octave + 1) + NOTE_IDX[letter] + acc


def hz(name):
    return float(midi_hz(nm(name)))


def is_stereo(x):
    return x.ndim == 2


def to_stereo(x):
    return x if x.ndim == 2 else np.vstack([x, x])


def length(x):
    return x.shape[-1]


def db(x):
    return 20 * np.log10(np.maximum(x, 1e-12))


def undb(d):
    return 10 ** (d / 20.0)


# ----------------------------------------------------------------------------
# noise
# ----------------------------------------------------------------------------
def white(n, rng):
    return rng.standard_normal(n)


def colored(n, rng, exponent=1.0):
    """Noise with power spectrum ~ 1/f^exponent (1 = pink, 2 = brown)."""
    m = max(n, 16)
    X = np.fft.rfft(rng.standard_normal(m))
    f = np.fft.rfftfreq(m, 1.0 / SR)
    f[0] = f[1]
    X = X / f ** (exponent / 2.0)
    X[0] = 0
    y = np.fft.irfft(X, m)[:n]
    return y / (np.std(y) + 1e-12)


def pink(n, rng):
    return colored(n, rng, 1.0)


def brown(n, rng):
    return colored(n, rng, 2.0)


# ----------------------------------------------------------------------------
# filters
# ----------------------------------------------------------------------------
def _clipf(f):
    return float(np.clip(f, 5.0, SR * 0.49))


def lp(x, f, order=2):
    sos = signal.butter(order, _clipf(f), 'lowpass', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=-1)


def hp(x, f, order=2):
    sos = signal.butter(order, _clipf(f), 'highpass', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=-1)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [_clipf(lo), _clipf(hi)], 'bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=-1)


def biquad_peak(f0, gain_db, q):
    A = 10 ** (gain_db / 40)
    w0 = TWO_PI * f0 / SR
    alpha = np.sin(w0) / (2 * q)
    b = np.array([1 + alpha * A, -2 * np.cos(w0), 1 - alpha * A])
    a = np.array([1 + alpha / A, -2 * np.cos(w0), 1 - alpha / A])
    return b / a[0], a / a[0]


def peq(x, f0, gain_db, q=1.0):
    b, a = biquad_peak(f0, gain_db, q)
    return signal.lfilter(b, a, x, axis=-1)


def shelf(x, f0, gain_db, kind='low', s=0.8):
    A = 10 ** (gain_db / 40)
    w0 = TWO_PI * f0 / SR
    cw, sw = np.cos(w0), np.sin(w0)
    alpha = sw / 2 * np.sqrt((A + 1 / A) * (1 / s - 1) + 2)
    if kind == 'low':
        b = [A * ((A + 1) - (A - 1) * cw + 2 * np.sqrt(A) * alpha),
             2 * A * ((A - 1) - (A + 1) * cw),
             A * ((A + 1) - (A - 1) * cw - 2 * np.sqrt(A) * alpha)]
        a = [(A + 1) + (A - 1) * cw + 2 * np.sqrt(A) * alpha,
             -2 * ((A - 1) + (A + 1) * cw),
             (A + 1) + (A - 1) * cw - 2 * np.sqrt(A) * alpha]
    else:
        b = [A * ((A + 1) + (A - 1) * cw + 2 * np.sqrt(A) * alpha),
             -2 * A * ((A - 1) + (A + 1) * cw),
             A * ((A + 1) + (A - 1) * cw - 2 * np.sqrt(A) * alpha)]
        a = [(A + 1) - (A - 1) * cw + 2 * np.sqrt(A) * alpha,
             2 * ((A - 1) - (A + 1) * cw),
             (A + 1) - (A - 1) * cw - 2 * np.sqrt(A) * alpha]
    b = np.array(b) / a[0]
    a = np.array(a) / a[0]
    return signal.lfilter(b, a, x, axis=-1)


def resonator(x, f, tau, gain=1.0):
    """2-pole resonator: impulse in -> decaying sine (unit amplitude) out."""
    f = min(f, SR * 0.45)
    r = np.exp(-1.0 / (tau * SR))
    w = TWO_PI * f / SR
    b = [gain * np.sin(w)]
    a = [1.0, -2 * r * np.cos(w), r * r]
    return signal.lfilter(b, a, x, axis=-1)


def modal(x, freqs, taus, gains):
    y = np.zeros_like(x, dtype=float)
    for f, t, g in zip(freqs, taus, gains):
        if f < SR * 0.45:
            y += resonator(x, f, t, g)
    return y


def stft_shape(x, gain_fn, nfft=1024, hop=256):
    """Time-varying spectral shaping. gain_fn(f[:,None], t[None,:]) -> gains.

    Good for filtering noise with arbitrary moving band shapes (whooshes,
    risers). x mono."""
    n = len(x)
    pad = nfft
    xp = np.concatenate([np.zeros(pad), x, np.zeros(pad)])
    f, t, Z = signal.stft(xp, fs=SR, nperseg=nfft, noverlap=nfft - hop,
                          boundary=None, padded=True)
    t = t - pad / SR
    G = gain_fn(f[:, None], t[None, :])
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        _, y = signal.istft(Z * G, fs=SR, nperseg=nfft, noverlap=nfft - hop,
                            boundary=False)
    y = y[pad:pad + n]
    if len(y) < n:
        y = np.concatenate([y, np.zeros(n - len(y))])
    return y


def bell_gain(f, fc, bw_oct):
    """Gaussian band in log-frequency."""
    ff = np.maximum(f, 1.0)
    return np.exp(-0.5 * (np.log2(ff / fc) / bw_oct) ** 2)


def lp_gain(f, fc, order=2):
    return 1.0 / np.sqrt(1.0 + (np.maximum(f, 0) / fc) ** (2 * order))


def hp_gain(f, fc, order=2):
    ff = np.maximum(f, 1e-3)
    return 1.0 / np.sqrt(1.0 + (fc / ff) ** (2 * order))


# ----------------------------------------------------------------------------
# envelopes
# ----------------------------------------------------------------------------
def env_pts(n, pts):
    """Piecewise-linear envelope from (time_sec, value) points."""
    times = [p[0] for p in pts]
    vals = [p[1] for p in pts]
    return np.interp(tvec(n), times, vals)


def adsr(n, a=0.01, d=0.1, s=0.7, r=0.2, curve=3.0):
    """ADSR with exponential-ish segments; release occupies the last r secs."""
    t = tvec(n)
    total = n / SR
    rel_start = max(total - r, 0)
    e = np.ones(n) * s
    ia = t < a
    e[ia] = (t[ia] / max(a, 1e-6))
    idd = (t >= a) & (t < a + d)
    e[idd] = s + (1 - s) * np.exp(-curve * (t[idd] - a) / max(d, 1e-6))
    ir = t >= rel_start
    level_at_rel = e[np.argmax(ir)] if ir.any() else s
    e[ir] = level_at_rel * (1 - (t[ir] - rel_start) / max(r, 1e-6)) ** 2
    return e


def exp_decay(n, tau, attack=0.001):
    t = tvec(n)
    return (1 - np.exp(-t / max(attack, 1e-5))) * np.exp(-t / tau)


def fade(x, fin=0.003, fout=0.01, shape='cos'):
    x = x.copy()
    n = length(x)
    a = min(ns(fin), n // 2)
    b = min(ns(fout), n // 2)
    if a > 0:
        r = np.linspace(0, 1, a)
        w = np.sin(r * np.pi / 2) ** 2 if shape == 'cos' else r
        x[..., :a] *= w
    if b > 0:
        r = np.linspace(1, 0, b)
        w = np.sin(r * np.pi / 2) ** 2 if shape == 'cos' else r
        x[..., n - b:] *= w
    return x


# ----------------------------------------------------------------------------
# oscillators
# ----------------------------------------------------------------------------
def phase_of(freq, n=None, phase0=0.0):
    if np.isscalar(freq):
        return phase0 + TWO_PI * freq * tvec(n)
    return phase0 + TWO_PI * np.cumsum(freq) / SR


def sine(freq, n=None, phase0=0.0):
    return np.sin(phase_of(freq, n, phase0))


def _polyblep(t, dt):
    dt = np.broadcast_to(dt, t.shape)
    y = np.zeros_like(t)
    m1 = t < dt
    x = t[m1] / dt[m1]
    y[m1] = x + x - x * x - 1.0
    m2 = t > 1.0 - dt
    x = (t[m2] - 1.0) / dt[m2]
    y[m2] = x * x + x + x + 1.0
    return y


def saw(freq, n=None, phase0=0.0):
    """Band-limited (polyBLEP) sawtooth, freq scalar or per-sample array."""
    if np.isscalar(freq):
        f = np.full(n, float(freq))
    else:
        f = np.asarray(freq, dtype=float)
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    y = 2.0 * ph - 1.0
    y -= _polyblep(ph, dt)
    return y


def square(freq, n=None, phase0=0.0, pw=0.5):
    if np.isscalar(freq):
        f = np.full(n, float(freq))
    else:
        f = np.asarray(freq, dtype=float)
    a = saw(f, phase0=phase0)
    b = saw(f, phase0=(phase0 + pw) % 1.0)
    return 0.5 * (a - b)


def partials(n, f0, ratios, amps, taus, rng=None, attack=0.0015):
    """Sum of exponentially decaying sine partials (modal synthesis)."""
    t = tvec(n)
    y = np.zeros(n)
    for r, a, tau in zip(ratios, amps, taus):
        f = f0 * r
        if f >= SR * 0.45 or a == 0:
            continue
        m = min(n, ns(tau * 9) + 1)
        ph = rng.uniform(0, TWO_PI) if rng is not None else 0.0
        y[:m] += a * np.sin(TWO_PI * f * t[:m] + ph) * np.exp(-t[:m] / tau)
    if attack > 0:
        y *= 1 - np.exp(-t / attack)
    return y


# ----------------------------------------------------------------------------
# stereo
# ----------------------------------------------------------------------------
def pan(x, p):
    """Constant-power pan. p scalar or array in [-1, 1]. Returns (2, n)."""
    if x.ndim == 2:
        x = x.mean(axis=0)
    a = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.vstack([x * np.cos(a), x * np.sin(a)]) * np.sqrt(2)


def delay(x, d_sec):
    d = ns(d_sec)
    if d <= 0:
        return x.copy()
    y = np.zeros_like(x)
    y[..., d:] = x[..., :-d]
    return y


def widen(x, amount=0.3, d_ms=11.0):
    """Mono -> stereo with complementary comb (mono-compatible)."""
    if x.ndim == 2:
        x = x.mean(axis=0)
    dd = delay(x, d_ms / 1000.0)
    return np.vstack([x + amount * dd, x - amount * dd])


def place(buf, x, t, gain=1.0, edge_fade=True):
    """Mix x into buf starting at time t (sec). Handles mono/stereo."""
    i = ns(t)
    n = length(buf)
    if i >= n:
        return buf
    if i < 0:
        x = x[..., -i:]
        i = 0
    m = min(length(x), n - i)
    if edge_fade and length(x) > 16:
        x = x.copy()
        fo = min(ns(0.003), length(x) // 4)
        fi = min(5, length(x) // 4)
        x[..., :fi] *= np.linspace(0, 1, fi)
        x[..., length(x) - fo:] *= np.linspace(1, 0, fo) ** 2
    if buf.ndim == 2 and x.ndim == 1:
        buf[:, i:i + m] += gain * x[:m]
    elif buf.ndim == 1 and x.ndim == 2:
        buf[i:i + m] += gain * x[:, :m].mean(axis=0)
    else:
        buf[..., i:i + m] += gain * x[..., :m]
    return buf


def fit(x, n):
    if length(x) >= n:
        return x[..., :n]
    pad = [(0, 0)] * (x.ndim - 1) + [(0, n - length(x))]
    return np.pad(x, pad)


# ----------------------------------------------------------------------------
# reverb (convolution with synthetic, frequency-dependent decaying noise IR)
# ----------------------------------------------------------------------------
_IR_CACHE = {}


def make_ir(rt60=1.6, predelay=0.015, damp=0.5, seed=7, er_density=12,
            bright=1.0, low_rt_mult=1.15):
    key = (round(rt60, 3), round(predelay, 4), round(damp, 3), seed, er_density,
           round(bright, 3), round(low_rt_mult, 3))
    if key in _IR_CACHE:
        return _IR_CACHE[key]
    rng = np.random.default_rng(seed)
    n = ns(rt60 * 1.15) + 1
    t = tvec(n)
    bands = [(20, 300, low_rt_mult), (300, 1500, 1.0), (1500, 5000, 1 - 0.45 * damp),
             (5000, 20000, max(0.12, 1 - 0.85 * damp))]
    ir = np.zeros((2, n))
    for ch in range(2):
        nz = rng.standard_normal(n)
        acc = np.zeros(n)
        for lo, hi, mult in bands:
            b = bp(nz, lo, min(hi, SR * 0.45), order=2) if lo > 20 else lp(nz, hi, 2)
            rt = rt60 * mult
            acc += b * 10 ** (-3 * t / rt)
        # diffusion build-up
        acc *= 1 - np.exp(-t / 0.012)
        # early reflections
        er = np.zeros(n)
        for k in range(er_density):
            tk = rng.uniform(0.004, 0.07)
            er[ns(tk)] += rng.choice([-1, 1]) * rng.uniform(0.3, 1.0) * np.exp(-tk / 0.05)
        er = lp(er, 7000 * bright)
        acc = acc / (np.sqrt(np.sum(acc ** 2)) + 1e-12) + 0.35 * er / (np.sqrt(np.sum(er ** 2)) + 1e-12)
        if bright != 1.0:
            acc = lp(acc, 9000 * bright, 1)
        ir[ch] = acc
    # gentle decorrelation already from independent noise; normalise energy
    ir /= np.sqrt(np.sum(ir ** 2) / 2)
    ir = np.concatenate([np.zeros((2, ns(predelay))), ir], axis=1)
    _IR_CACHE[key] = ir
    return ir


def reverb(x, rt60=1.6, predelay=0.015, damp=0.5, seed=7, bright=1.0,
           low_cut=150.0, keep_len=True, low_rt_mult=1.15):
    """Returns the WET signal (stereo)."""
    ir = make_ir(rt60, predelay, damp, seed, bright=bright, low_rt_mult=low_rt_mult)
    xs = to_stereo(x)
    if low_cut:
        xs = hp(xs, low_cut, 2)
    out = np.vstack([signal.fftconvolve(xs[0], ir[0]), signal.fftconvolve(xs[1], ir[1])])
    if keep_len:
        out = out[:, :length(xs)]
    return out * 0.5


def echo(x, d=0.14, fb=0.3, n_rep=6, lp_f=3500):
    y = x.copy()
    cur = x.copy()
    for k in range(n_rep):
        cur = lp(delay(cur, d), lp_f, 1) * fb
        y = y + cur
    return y


# ----------------------------------------------------------------------------
# dynamics / colour
# ----------------------------------------------------------------------------
def soft_sat(x, drive=1.5):
    return np.tanh(drive * x) / np.tanh(drive)


def onepole_smooth(x, tau, init=None):
    a = np.exp(-1.0 / (tau * SR))
    if init is None:
        return signal.lfilter([1 - a], [1, -a], x, axis=-1)
    y, _ = signal.lfilter([1 - a], [1, -a], x, axis=-1, zi=np.array([a * init]))
    return y


def compress(x, thresh_db=-18.0, ratio=2.0, attack=0.01, release=0.15, knee=6.0):
    """Gentle feed-forward RMS-ish compressor, linked stereo."""
    xs = x if x.ndim == 2 else x[None, :]
    det = np.max(np.abs(xs), axis=0)
    # attack/release envelope follower approximation: smooth power with release,
    # then a faster smoothing to emulate attack.
    pw = onepole_smooth(det ** 2, release)
    pw = np.maximum(pw, onepole_smooth(det ** 2, attack) * 0.5)
    lvl = 10 * np.log10(pw + 1e-12) + 3.0
    over = lvl - thresh_db
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio),
                           (1 - 1 / ratio) * (over + knee / 2) ** 2 / (2 * knee)))
    gr = onepole_smooth(gr, attack)
    g = undb(-gr)
    y = xs * g
    return y if x.ndim == 2 else y[0]


def limiter(x, ceiling_db=-1.2, lookahead=0.004, release=0.08):
    """Look-ahead brick-wall-ish limiter (min-filter + smoothing)."""
    xs = x if x.ndim == 2 else x[None, :]
    c = undb(ceiling_db)
    pk = np.max(np.abs(xs), axis=0)
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    w = max(ns(lookahead), 1)
    gmin = minimum_filter1d(g, size=2 * w + 1, mode='nearest')
    # smooth with moving average of width w (keeps g <= instantaneous need)
    k = np.ones(w) / w
    gs = np.convolve(gmin, k, mode='same')
    gs = np.minimum(gs, g)  # never exceed the instantaneous requirement
    # release smoothing: recovery is slowed, gain reduction stays immediate
    rel = onepole_smooth(gs, release, init=gs[0])
    gfinal = np.minimum(gs, rel)
    y = xs * gfinal
    # hard safety clip (should almost never act)
    y = np.clip(y, -c, c)
    return y if x.ndim == 2 else y[0]


# ----------------------------------------------------------------------------
# loudness (ITU-R BS.1770, 48 kHz coefficients)
# ----------------------------------------------------------------------------
def k_weight(x):
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]
    a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]
    a2 = [1.0, -1.99004745483398, 0.99007225036621]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=-1), axis=-1)


def lufs(x):
    xs = to_stereo(x) if x.ndim == 2 else x[None, :]
    y = k_weight(xs)
    blk = ns(0.4)
    hop = ns(0.1)
    n = y.shape[-1]
    if n < blk:
        z = np.mean(np.sum(y ** 2, axis=0) if xs.shape[0] > 1 else y[0] ** 2)
        return -0.691 + 10 * np.log10(z + 1e-12)
    zs = []
    for s in range(0, n - blk + 1, hop):
        seg = y[:, s:s + blk]
        zs.append(np.sum(np.mean(seg ** 2, axis=1)))
    zs = np.array(zs)
    L = -0.691 + 10 * np.log10(zs + 1e-12)
    zs1 = zs[L > -70]
    if len(zs1) == 0:
        return -120.0
    Lr = -0.691 + 10 * np.log10(np.mean(zs1)) - 10
    zs2 = zs[(L > -70) & (L > Lr)]
    return -0.691 + 10 * np.log10(np.mean(zs2))


# ----------------------------------------------------------------------------
# output
# ----------------------------------------------------------------------------
def remove_dc(x, f=18.0):
    x = x - np.mean(x, axis=-1, keepdims=True)
    return hp(x, f, 2)


def normalize_peak(x, peak_db=-3.0):
    pk = np.max(np.abs(x))
    if pk < 1e-12:
        return x
    return x * undb(peak_db) / pk


def write_wav(path, x, zero_mask=None):
    """Write 16-bit PCM with TPDF dither (no dither where signal is exactly 0)."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    xs = x if x.ndim == 2 else x[None, :]
    rng = np.random.default_rng(12345)
    scaled = xs * 32767.0
    d = (rng.uniform(-0.5, 0.5, scaled.shape) + rng.uniform(-0.5, 0.5, scaled.shape))
    d[scaled == 0] = 0
    q = np.round(scaled + d)
    q = np.clip(q, -32767, 32767).astype(np.int16)
    if zero_mask is not None:
        q[:, zero_mask] = 0
    # keep the very first/last sample at true zero when the signal was faded to ~0
    data = q.T if xs.shape[0] > 1 else q[0]
    wavfile.write(path, SR, data)


def remove_dc_windowed(x):
    """Remove residual DC with a Hann-shaped offset (keeps the ends at zero)."""
    n = length(x)
    w = np.hanning(n)
    return x - w * (np.sum(x, axis=-1, keepdims=True) / np.sum(w))


def finish_sfx(x, path, fin=0.002, fout=0.012, peak_db=-3.0, dc=True):
    if dc:
        x = remove_dc(x)
    x = fade(x, fin, fout)
    if dc:
        x = remove_dc_windowed(x)
    x = normalize_peak(x, peak_db)
    write_wav(path, x)
    return x

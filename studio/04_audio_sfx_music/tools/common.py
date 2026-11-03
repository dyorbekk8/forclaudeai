import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000


def t_axis(dur):
    return np.arange(int(round(dur * SR))) / SR


def rng(seed):
    return np.random.default_rng(seed)


def fade(x, ms_in=3.0, ms_out=4.0):
    x = np.array(x, dtype=np.float64, copy=True)
    n_in = max(1, int(SR * ms_in / 1000))
    n_out = max(1, int(SR * ms_out / 1000))
    ramp_in = np.sin(np.linspace(0, np.pi / 2, n_in)) ** 2
    ramp_out = np.cos(np.linspace(0, np.pi / 2, n_out)) ** 2
    if x.ndim == 1:
        x[:n_in] *= ramp_in
        x[-n_out:] *= ramp_out
        x[0] = 0.0
        x[-1] = 0.0
    else:
        x[:n_in] *= ramp_in[:, None]
        x[-n_out:] *= ramp_out[:, None]
        x[0] = 0.0
        x[-1] = 0.0
    return x


def env_adsr(n, a, d, s, r, sustain_level=0.6):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(0, n - a - d - r)
    e = np.concatenate([
        np.linspace(0, 1, max(a, 1), endpoint=False),
        np.linspace(1, sustain_level, max(d, 1), endpoint=False),
        np.full(s_n, sustain_level),
        np.linspace(sustain_level, 0, max(r, 1)),
    ])
    if len(e) < n:
        e = np.pad(e, (0, n - len(e)))
    return e[:n]


def exp_decay(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def bp(x, lo, hi, order=4):
    sos = signal.butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def lp(x, fc, order=4):
    sos = signal.butter(order, fc, btype='low', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def hp(x, fc, order=4):
    sos = signal.butter(order, fc, btype='high', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def remove_dc(x):
    sos = signal.butter(2, 15, btype='high', fs=SR, output='sos')
    y = signal.sosfiltfilt(sos, x, axis=0)
    return y - np.mean(y, axis=0)


def time_varying_filter(x, fc_curve, kind='low', q=0.707, block=256):
    """State-variable filter with per-sample cutoff (sampled per block)."""
    y = np.zeros_like(x)
    low = band = 0.0
    n = len(x)
    for i in range(0, n, block):
        fc = float(np.clip(fc_curve[min(i, n - 1)], 20, SR * 0.45))
        f = 2 * np.sin(np.pi * fc / SR)
        damp = 1.0 / q
        seg = x[i:i + block]
        out = np.empty_like(seg)
        for j, v in enumerate(seg):
            high = v - low - damp * band
            band += f * high
            low += f * band
            out[j] = low if kind == 'low' else (band if kind == 'band' else high)
        y[i:i + block] = out
    return y


def svf_vec(x, fc_curve, kind='band', q=1.0):
    """Faster approximation: apply short-time band filters with overlap-add."""
    hop = 512
    win = np.hanning(hop * 2)
    n = len(x)
    y = np.zeros(n + hop * 2)
    xp = np.pad(x, (0, hop * 2))
    for i in range(0, n, hop):
        fc = float(np.clip(fc_curve[min(i, n - 1)], 40, SR * 0.42))
        bw = fc / q
        lo, hi = max(20, fc - bw / 2), min(SR * 0.47, fc + bw / 2)
        seg = xp[i:i + hop * 2] * win
        if kind == 'band':
            sos = signal.butter(2, [lo, hi], btype='band', fs=SR, output='sos')
        else:
            sos = signal.butter(2, fc, btype='low', fs=SR, output='sos')
        y[i:i + hop * 2] += signal.sosfiltfilt(sos, seg)
    return y[:n]


def zero_mean_windowed(x):
    """Remove DC without touching the (already faded) boundary samples."""
    n = len(x)
    w = np.hanning(n)
    if x.ndim == 2:
        w = w[:, None]
    return x - w * (np.sum(x, axis=0) / np.sum(w, axis=0))


def limiter(x, ceiling_db=-1.5, lookahead_ms=5.0, release_ms=120.0, oversample=4):
    """Look-ahead peak limiter on true-peak estimate."""
    ceil = 10 ** (ceiling_db / 20)
    xx = x if x.ndim == 2 else x[:, None]
    up = signal.resample_poly(xx, oversample, 1, axis=0)
    env = np.max(np.abs(up), axis=1).reshape(-1, oversample).max(axis=1)[: len(xx)]
    gain = np.minimum(1.0, ceil / np.maximum(env, 1e-12))
    la = max(1, int(SR * lookahead_ms / 1000))
    # min over look-ahead window
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(gain, size=2 * la + 1, origin=0)
    rel = np.exp(-1.0 / (SR * release_ms / 1000))
    out = np.empty_like(g)
    cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else v + (cur - v) * rel
        out[i] = cur
    att = np.hanning(2 * la + 1)
    att /= att.sum()
    out = np.minimum(out, np.convolve(out, att, mode='same'))
    y = xx * out[:, None]
    return y if x.ndim == 2 else y[:, 0]


def peak_normalize(x, db=-3.0):
    p = np.max(np.abs(x))
    if p == 0:
        return x
    return x * (10 ** (db / 20) / p)


def write(path, x):
    x = np.asarray(x, dtype=np.float64)
    sf.write(path, x, SR, subtype='PCM_24')


def pan(x, p):
    """p in [-1,1] equal-power."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)

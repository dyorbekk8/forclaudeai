"""Self-QA: checks every WAV in sfx/ and music/ and renders spectrograms.

Checks: sample rate / bit depth, clipping, DC offset, start/end sample near
zero (click risk), largest sample-to-sample jump, peak / RMS / LUFS, exact
music durations, m4 true-silence window, loop-seam continuity for loops.

usage: python3 qa.py [--spec name1 name2 ...]
"""
import os
import sys
import json
import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dsp import lufs, SR  # noqa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QA_DIR = os.path.join(ROOT, 'qa')

MUSIC_LEN = {'m1_curious': 56.0, 'm2_comedy': 35.0, 'm3_tension': 35.0, 'm4_tender': 75.0,
             'm5_reveal': 56.0, 'm6_resolve': 20.0, 'm7_cliffhanger': 25.0}
LOOPS = {'crowd_murmur', 'cafeteria_ambience', 'room_tone_home', 'room_tone_care'}
EDGE_TOL = 0.002        # |first/last sample| (full scale = 1.0)
DC_TOL = 0.002


def load(path):
    sr, d = wavfile.read(path)
    assert d.dtype == np.int16, f'{path}: not 16-bit'
    x = d.astype(np.float64) / 32768.0
    if x.ndim == 1:
        x = x[None, :]
    else:
        x = x.T
    return sr, x


def check(path, kind):
    name = os.path.splitext(os.path.basename(path))[0]
    sr, x = load(path)
    n = x.shape[1]
    dur = n / sr
    pk = np.max(np.abs(x))
    rms = np.sqrt(np.mean(x ** 2))
    res = dict(name=name, kind=kind, sr=sr, ch=x.shape[0], dur=round(dur, 4),
               peak_db=round(20 * np.log10(pk + 1e-12), 2),
               rms_db=round(20 * np.log10(rms + 1e-12), 2),
               dc=float(np.max(np.abs(np.mean(x, axis=1)))),
               first=float(np.max(np.abs(x[:, 0]))), last=float(np.max(np.abs(x[:, -1]))),
               clip=int(np.sum(np.abs(x) >= 32766 / 32768)),
               max_jump=float(np.max(np.abs(np.diff(x, axis=1)))))
    probs = []
    if sr != 48000:
        probs.append('samplerate')
    if res['clip'] > 0:
        probs.append(f"clipping({res['clip']})")
    if res['dc'] > DC_TOL:
        probs.append(f"dc({res['dc']:.4f})")
    is_loop = name in LOOPS
    if is_loop:
        seam = float(np.max(np.abs(x[:, 0] - x[:, -1])))
        res['loop_seam_jump'] = seam
        typical = float(np.percentile(np.abs(np.diff(x, axis=1)), 99.9))
        if seam > max(typical, 0.003):
            probs.append(f'loop seam jump {seam:.4f}')
        if res['first'] > 0.01 or res['last'] > 0.01:
            probs.append('loop edge not near zero')
    else:
        if res['first'] > EDGE_TOL:
            probs.append(f"start not zero ({res['first']:.4f})")
        if res['last'] > EDGE_TOL:
            probs.append(f"end not zero ({res['last']:.4f})")
    if kind == 'sfx':
        if abs(res['peak_db'] + 3.0) > 0.3:
            probs.append(f"peak {res['peak_db']} != -3")
    if kind == 'music':
        res['lufs'] = round(lufs(x if x.shape[0] == 2 else x[0]), 2)
        exp = MUSIC_LEN.get(name)
        if exp is not None and abs(dur - exp) > 0.1:
            probs.append(f'duration {dur:.3f} != {exp}')
        if x.shape[0] != 2:
            probs.append('music not stereo')
        if res['peak_db'] > -1.0:
            probs.append(f"peak {res['peak_db']} > -1 dBFS")
        if name == 'm4_tender':
            a, b = int(42.0 * sr), int(45.5 * sr)
            seg = x[:, a:b]
            res['silence_42_455_max'] = float(np.max(np.abs(seg)))
            if np.any(seg != 0):
                probs.append('m4 silence window not digital zero')
            pre = x[:, int(41.0 * sr):a]
            res['m4_pre_silence_rms_db'] = round(20 * np.log10(np.sqrt(np.mean(pre ** 2)) + 1e-12), 1)
            post = x[:, b:b + int(0.5 * sr)]
            res['m4_post_resume_peak_db'] = round(20 * np.log10(np.max(np.abs(post)) + 1e-12), 1)
    res['problems'] = probs
    return res


def spectrogram(name, path, out_png):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    sr, x = load(path)
    m = x.mean(axis=0)
    dur = len(m) / sr
    nfft = 1024 if dur < 3 else 4096
    fig, axes = plt.subplots(2, 1, figsize=(12, 7), gridspec_kw={'height_ratios': [1, 3]})
    t = np.arange(len(m)) / sr
    axes[0].plot(t, x[0], lw=0.4)
    if x.shape[0] > 1:
        axes[0].plot(t, x[1], lw=0.4, alpha=0.6)
    axes[0].set_xlim(0, dur)
    axes[0].set_ylim(-1, 1)
    axes[0].set_title(f'{name}  ({dur:.2f}s)')
    axes[1].specgram(m + 1e-9, NFFT=nfft, Fs=sr, noverlap=nfft * 3 // 4, cmap='magma',
                     vmin=-130, scale='dB')
    axes[1].set_yscale('symlog', linthresh=200)
    axes[1].set_ylim(20, 24000)
    axes[1].set_xlim(0, dur)
    axes[1].set_xlabel('s')
    axes[1].set_ylabel('Hz')
    fig.tight_layout()
    fig.savefig(out_png, dpi=80)
    plt.close(fig)


def sheet(names, out_png, cols=4):
    """Contact sheet of small spectrograms (for quick visual review)."""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    rows = (len(names) + cols - 1) // cols
    fig, axes = plt.subplots(rows, cols, figsize=(4.2 * cols, 2.3 * rows))
    axes = np.atleast_2d(axes)
    for ax in axes.flat:
        ax.axis('off')
    for i, nm_ in enumerate(names):
        p = None
        for sub in ('sfx', 'music'):
            q = os.path.join(ROOT, sub, nm_ + '.wav')
            if os.path.exists(q):
                p = q
        if p is None:
            continue
        sr, x = load(p)
        m = x.mean(axis=0)
        dur = len(m) / sr
        nfft = 512 if dur < 1 else (1024 if dur < 4 else 4096)
        ax = axes.flat[i]
        ax.axis('on')
        ax.specgram(m + 1e-9, NFFT=nfft, Fs=sr, noverlap=nfft * 3 // 4, cmap='magma', vmin=-120, scale='dB')
        ax.set_yscale('symlog', linthresh=200)
        ax.set_ylim(30, 24000)
        ax2 = ax.twinx()
        ax2.plot(np.arange(len(m)) / sr, np.max(np.abs(x), axis=0), color='cyan', lw=0.5)
        ax2.set_ylim(0, 1.05)
        ax2.set_yticks([])
        ax.set_xlim(0, dur)
        ax.set_title(nm_, fontsize=9)
        ax.tick_params(labelsize=6)
    fig.tight_layout()
    fig.savefig(out_png, dpi=70)
    plt.close(fig)


def main(argv):
    specs = []
    if '--sheet' in argv:
        i = argv.index('--sheet')
        out = argv[i + 1]
        names = argv[i + 2:]
        sheet(names, os.path.join(QA_DIR, out))
        return 0
    if '--spec' in argv:
        specs = argv[argv.index('--spec') + 1:]
    os.makedirs(QA_DIR, exist_ok=True)
    results = []
    for kind, sub in (('sfx', 'sfx'), ('music', 'music')):
        d = os.path.join(ROOT, sub)
        for f in sorted(os.listdir(d)):
            if f.endswith('.wav'):
                results.append(check(os.path.join(d, f), kind))
    n_bad = 0
    for r in results:
        flag = 'OK  ' if not r['problems'] else 'FAIL'
        n_bad += bool(r['problems'])
        extra = f"  LUFS {r['lufs']:6.1f}" if 'lufs' in r else ''
        print(f"{flag} {r['kind']:5s} {r['name']:22s} {r['dur']:7.3f}s ch{r['ch']} pk {r['peak_db']:6.2f} "
              f"rms {r['rms_db']:6.1f}{extra}  dc {r['dc']:.4f} edge {r['first']:.4f}/{r['last']:.4f} "
              f"jump {r['max_jump']:.3f} {' '.join(r['problems'])}")
    with open(os.path.join(QA_DIR, 'qa_report.json'), 'w') as fh:
        json.dump(results, fh, indent=1)
    for nm_ in specs:
        for sub in ('sfx', 'music'):
            p = os.path.join(ROOT, sub, nm_ + '.wav')
            if os.path.exists(p):
                spectrogram(nm_, p, os.path.join(QA_DIR, f'spec_{nm_}.png'))
    print(f'\n{len(results)} files checked, {n_bad} with problems')
    return n_bad


if __name__ == '__main__':
    sys.exit(1 if main(sys.argv[1:]) else 0)

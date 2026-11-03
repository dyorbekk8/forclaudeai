"""Split a multi-line TTS take into per-line WAVs using DTW against a Kokoro reference.

usage: python3 align_split.py <take.mp3> <ids.json>
1. synthesise each line with Kokoro (male voice) -> reference with known boundaries
2. MFCC + DTW align take <-> reference, map each boundary into take time
3. snap each mapped boundary to the nearest silence gap in the take (within 0.6 s)
Writes out/lines/<id>.wav and prints a report (ms/char + snap distance).
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf, librosa
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 16000
OUT_SR = 48000
spec = {l["id"]: l for l in json.load(open(os.path.join(HERE, "..", "02_script", "lines.json")))["lines"]}

def load(path, sr):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def feats(y):
    m = librosa.feature.mfcc(y=y, sr=SR, n_mfcc=20, hop_length=160, n_fft=512)[1:]
    m = (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6)
    return m

def main():
    take = load(sys.argv[1], SR)
    ids = json.load(open(sys.argv[2]))
    k = Kokoro(os.path.join(HERE, "models/kokoro-v1.0.onnx"), os.path.join(HERE, "models/voices-v1.0.bin"))
    ref, bounds, t = [], [], 0.0
    for lid in ids:
        s, sr = k.create(spec[lid]["t"], voice="am_michael", speed=1.0, lang="en-us")
        s = librosa.resample(np.asarray(s, np.float32), orig_sr=sr, target_sr=SR)
        idx = np.where(np.abs(s) > 0.01 * np.abs(s).max())[0]
        s = s[idx[0]: idx[-1]]
        ref.append(s); ref.append(np.zeros(int(0.5 * SR), np.float32))
        bounds.append((t, t + len(s) / SR)); t += len(s) / SR + 0.5
    ref = np.concatenate(ref)
    A, Bf = feats(ref), feats(take)
    D, wp = librosa.sequence.dtw(X=A, Y=Bf, metric="cosine", subseq=False)
    wp = wp[::-1]
    fr = 160 / SR
    def map_t(tr):
        i = np.searchsorted(wp[:, 0], int(tr / fr))
        i = min(i, len(wp) - 1)
        return wp[i, 1] * fr
    # silence gaps in take
    hop = 160
    env = np.array([np.sqrt(np.mean(take[i:i + hop] ** 2) + 1e-12) for i in range(0, len(take) - hop, hop)])
    q = 20 * np.log10(env / env.max()) < -40
    gaps = []
    i = 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if j - i >= 12: gaps.append(((i + j) / 2 * fr, (j - i) * fr))
            i = j
        else:
            i += 1
    cuts = [0.0]
    report = []
    for n in range(len(ids) - 1):
        # boundary = middle between end of line n and start of line n+1 in reference
        tb = map_t((bounds[n][1] + bounds[n + 1][0]) / 2)
        cand = [g for g in gaps if g[0] > cuts[-1] + 0.2]
        g = min(cand, key=lambda g: abs(g[0] - tb) - 0.3 * g[1])
        report.append(round(g[0] - tb, 2))
        cuts.append(g[0])
    cuts.append(len(take) / SR)
    full = load(sys.argv[1], OUT_SR)
    os.makedirs(os.path.join(HERE, "out", "lines"), exist_ok=True)
    for n, lid in enumerate(ids):
        seg = full[int(cuts[n] * OUT_SR): int(cuts[n + 1] * OUT_SR)]
        e = np.abs(seg); thr = 10 ** (-45 / 20) * e.max()
        idx = np.where(e > thr)[0]
        seg = seg[max(0, idx[0] - int(0.02 * OUT_SR)): idx[-1] + int(0.06 * OUT_SR)].copy()
        f = int(0.008 * OUT_SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        seg *= 10 ** (-20 / 20) / np.sqrt(np.mean(seg ** 2))
        pk = np.abs(seg).max()
        if pk > 0.89: seg *= 0.89 / pk
        sf.write(os.path.join(HERE, "out", "lines", lid + ".wav"), seg, OUT_SR, subtype="PCM_16")
        d = len(seg) / OUT_SR
        refd = bounds[n][1] - bounds[n][0]
        snap = report[n - 1] if n else 0
        flag = "  <<< CHECK" if (d / refd < 0.6 or d / refd > 1.6 or abs(snap) > 0.4) else ""
        print(f"{lid} take {d:5.2f}s  ref {refd:5.2f}s  ratio {d / refd:4.2f}  snap {snap:+.2f}{flag}  {spec[lid]['t'][:45]}")

main()

"""Split a multi-line TTS take into per-line WAVs.

usage: python3 split_chunks.py <audio> <ids.json>
Lines in the take are separated by paragraph pauses. We find silence gaps,
then pick exactly K-1 cut points (DP) so each segment's duration best matches
its expected share (proportional to character count). Writes out/lines/<id>.wav
(trimmed, RMS-normalised, 48 kHz mono) and prints a report.
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
spec = {l["id"]: l for l in json.load(open(os.path.join(HERE, "..", "02_script", "lines.json")))["lines"]}

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def main():
    x = load(sys.argv[1]); ids = json.load(open(sys.argv[2])); K = len(ids)
    hop = int(0.01 * SR)
    env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop, hop)])
    db = 20 * np.log10(env / env.max())
    quiet = db < -42
    # silence runs (>= 150 ms)
    gaps = []
    i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if (j - i) >= 15 and i > 0 and j < len(quiet):
                gaps.append(((i + j) / 2 * 0.01, (j - i) * 0.01))
            i = j
        else:
            i += 1
    # expected boundaries by char share
    chars = np.array([len(spec[k]["t"]) + 8 for k in ids], float)
    speech_start = np.argmax(~quiet) * 0.01
    speech_end = (len(quiet) - np.argmax(~quiet[::-1])) * 0.01
    total = speech_end - speech_start
    exp_b = speech_start + np.cumsum(chars)[:-1] / chars.sum() * total
    # DP over gaps: segment cost = (log(dur/expected))^2, bonus for long (paragraph) gaps
    rate = total / chars.sum()
    pos = [speech_start] + [g[0] for g in gaps] + [speech_end]
    glen = [0.0] + [g[1] for g in gaps] + [0.0]
    P = len(pos)
    INF = 1e18
    D = np.full((K + 1, P), INF); B = np.zeros((K + 1, P), int)
    D[0, 0] = 0
    for k in range(1, K + 1):
        e = chars[k - 1] * rate
        for j in range(1, P):
            if k == K and j != P - 1: continue
            if k < K and j == P - 1: continue
            best, arg = INF, -1
            for i in range(j):
                if D[k - 1, i] >= INF: continue
                dur = pos[j] - pos[i] - (glen[i] / 2 if i else 0) - (glen[j] / 2 if j < P - 1 else 0)
                if dur <= 0.2: continue
                c = D[k - 1, i] + 4.0 * np.log(dur / e) ** 2 - 1.5 * glen[j]
                if c < best: best, arg = c, i
            D[k, j] = best; B[k, j] = arg
    sel = []; j = P - 1
    for k in range(K, 0, -1):
        i = B[k, j]
        if k > 1: sel.append(i)
        j = i
    sel = sel[::-1]
    print("gaps used:", [round(glen[i], 2) for i in sel], " smallest unused long gaps:", sorted([round(glen[i],2) for i in range(1, P-1) if i not in sel])[-3:])
    cuts = [0.0] + [pos[i] for i in sel] + [len(x) / SR]
    os.makedirs(os.path.join(HERE, "out", "lines"), exist_ok=True)
    for k, lid in enumerate(ids):
        seg = x[int(cuts[k] * SR): int(cuts[k + 1] * SR)]
        e = np.abs(seg); thr = 10 ** (-45 / 20) * e.max()
        idx = np.where(e > thr)[0]
        seg = seg[max(0, idx[0] - int(0.02 * SR)): idx[-1] + int(0.06 * SR)].copy()
        f = int(0.008 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        r = np.sqrt(np.mean(seg ** 2)); seg *= 10 ** (-20 / 20) / r
        pk = np.abs(seg).max()
        if pk > 0.89: seg *= 0.89 / pk
        sf.write(os.path.join(HERE, "out", "lines", lid + ".wav"), seg, SR, subtype="PCM_16")
        d = len(seg) / SR
        print(f"{lid} {d:5.2f}s  {d / len(spec[lid]['t']) * 1000:5.1f} ms/char  {spec[lid]['t'][:50]}")

main()

"""Cut a take at explicit boundary times (s). usage: cut_at.py take.mp3 ids.json t1,t2,..."""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32)
ids = json.load(open(sys.argv[2])); cuts = [0.0] + [float(v) for v in sys.argv[3].split(",")] + [len(x) / SR]
assert len(cuts) == len(ids) + 1
for n, lid in enumerate(ids):
    seg = x[int(cuts[n] * SR): int(cuts[n + 1] * SR)].copy()
    e = np.abs(seg); idx = np.where(e > 10 ** (-45 / 20) * e.max())[0]
    seg = seg[max(0, idx[0] - int(0.02 * SR)): idx[-1] + int(0.06 * SR)].copy()
    f = int(0.008 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    seg *= 10 ** (-20 / 20) / np.sqrt(np.mean(seg ** 2)); pk = np.abs(seg).max()
    if pk > 0.89: seg *= 0.89 / pk
    sf.write(os.path.join(HERE, "out", "lines", lid + ".wav"), seg, SR, subtype="PCM_16")
    print(lid, round(len(seg) / SR, 2))

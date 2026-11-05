"""Build the full voiceover from 02_script/lines.json with local Kokoro TTS.

Outputs (in 03_voiceover/out):
  lines/<id>.wav   trimmed per-line takes (48 kHz mono)
  vo_full.wav      assembled narration track
  timeline.json    {id, speaker, text, start, end} in seconds  -> drives the edit

Usage: python3 build_vo.py [--only id1,id2]   (re-renders only those lines)
"""
import json, os, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "out")
SR = 48000
LEAD_IN = 0.5

def resample(x, sr_in, sr_out):
    if sr_in == sr_out:
        return x
    n = int(round(len(x) * sr_out / sr_in))
    t_in = np.arange(len(x)) / sr_in
    t_out = np.arange(n) / sr_out
    return np.interp(t_out, t_in, x).astype(np.float32)

def trim(x, sr, thr_db=-45, pad=0.03):
    env = np.abs(x)
    thr = 10 ** (thr_db / 20) * max(env.max(), 1e-6)
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * 2 * sr))
    y = x[a:b].copy()
    f = int(0.008 * sr)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y

def rms_norm(x, target_db=-20.0):
    r = np.sqrt(np.mean(x ** 2) + 1e-12)
    g = 10 ** (target_db / 20) / r
    y = x * g
    pk = np.abs(y).max()
    if pk > 0.89:
        y *= 0.89 / pk
    return y

def main():
    spec = json.load(open(os.path.join(ROOT, "02_script", "lines.json")))
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))
    os.makedirs(os.path.join(OUT, "lines"), exist_ok=True)
    MD = os.path.join(ROOT, "..", "03_voiceover", "models")
    k = Kokoro(os.path.join(MD, "kokoro-v1.0.onnx"), os.path.join(MD, "voices-v1.0.bin"))
    for ln in spec["lines"]:
        p = os.path.join(OUT, "lines", ln["id"] + ".wav")
        want = (not os.path.exists(p)) or ("--force" in sys.argv) or (only is not None and ln["id"] in only)
        if not want:
            continue
        c = spec["cast"][ln["s"]]
        if ln["s"] == "CROWD":
            # layered crowd: several voices, slight offsets/speeds
            parts = []
            for j, (vv, sp) in enumerate([("af_sarah", 1.0), ("af_bella", 1.04), ("am_adam", 0.98), ("af_nicole", 1.06), ("am_liam", 1.02)]):
                s, sr = k.create(ln["t"], voice=vv, speed=sp, lang="en-us")
                a = trim(resample(np.asarray(s, np.float32), sr, SR), SR)
                parts.append(np.concatenate([np.zeros(int(j * 0.045 * SR), np.float32), a]) * (1.0 if j == 0 else 0.6))
            L = max(len(p) for p in parts)
            y = sum(np.pad(p, (0, L - len(p))) for p in parts)
            y = rms_norm(y, -22)
        else:
            s, sr = k.create(ln["t"], voice=c["voice"], speed=c["speed"], lang="en-us")
            y = rms_norm(trim(resample(np.asarray(s, np.float32), sr, SR), SR), -20 if ln["s"] == "N" else -21)
        sf.write(p, y, SR, subtype="PCM_16")
        print("tts", ln["id"], ln["s"], round(len(y) / SR, 2), flush=True)
    # assemble
    t = LEAD_IN
    chunks = [np.zeros(int(LEAD_IN * SR), np.float32)]
    tl = []
    for ln in spec["lines"]:
        y, _ = sf.read(os.path.join(OUT, "lines", ln["id"] + ".wav"), dtype="float32")
        d = len(y) / SR
        tl.append({"id": ln["id"], "speaker": ln["s"], "text": ln["t"], "start": round(t, 3), "end": round(t + d, 3)})
        chunks.append(y)
        chunks.append(np.zeros(int(ln["p"] * SR), np.float32))
        t += d + ln["p"]
    full = np.concatenate(chunks)
    sf.write(os.path.join(OUT, "vo_full.wav"), full, SR, subtype="PCM_16")
    json.dump({"duration": round(len(full) / SR, 3), "lines": tl}, open(os.path.join(OUT, "timeline.json"), "w"), indent=1)
    words = sum(len(l["t"].split()) for l in spec["lines"])
    print("TOTAL", round(len(full) / SR, 2), "s  words", words, "wpm", round(words / (len(full) / SR) * 60))

if __name__ == "__main__":
    main()

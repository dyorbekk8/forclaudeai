"""'Studio' voice chain on top of local Kokoro TTS — aims for an ElevenLabs-like narrator.

1. Timbre: blend of several male style vectors (richer than any single voice).
2. Depth: synthesise faster, then resample slower -> pitch down without phase-vocoder artefacts.
3. Prosody: each line is split into phrases; per-phrase speed follows the line's emotion,
   pauses follow punctuation ('...' long, '.' medium, '?'/'!' short), tiny natural speed jitter.
4. Studio chain: HPF, low-shelf warmth, mud cut, presence, air, de-esser, compressor,
   soft saturation, short room ambience, loudness-matched output.

usage: python3 voice_pro.py [--only id,id]   -> writes out/lines/<id>.wav (then run build_vo.py to assemble)
"""
import json, os, re, sys
import numpy as np, soundfile as sf
from scipy import signal
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(HERE)
SR = 48000
spec = json.load(open(os.path.join(EP, "02_script", "lines.json")))
MD = os.path.join(EP, "..", "03_voiceover", "models")
K = Kokoro(os.path.join(MD, "kokoro-v1.0.onnx"), os.path.join(MD, "voices-v1.0.bin"))

def blend(parts):
    return sum(w * K.get_voice_style(v) for v, w in parts)

VOICES = {  # style blend, pitch semitones, base speed
    "N": (blend([("am_michael", 0.55), ("am_fenrir", 0.30), ("am_onyx", 0.15)]), -1.2, 0.97),
    "MIA": (blend([("af_heart", 0.6), ("af_nicole", 0.4)]), +2.6, 1.04),
    "DOC": (blend([("bm_george", 0.7), ("am_michael", 0.3)]), -1.0, 0.95),
}
# emotion -> speed factor (per line id prefix / explicit ids)
SLOW = {"a06","a07","d06","e04","e06","h02","h05","i05","j03","j04","j05","j06","k03","k05","k06","l04","l05","l07"}
FAST = {"c03","c07","d02","d07","f04"}

def resample(x, sr_in, sr_out):
    if sr_in == sr_out: return x
    g = np.gcd(int(sr_in), int(sr_out))
    return signal.resample_poly(x, int(sr_out) // g, int(sr_in) // g).astype(np.float32)

def trim(x, thr_db=-46):
    e = np.abs(x); thr = 10 ** (thr_db / 20) * max(e.max(), 1e-6)
    i = np.where(e > thr)[0]
    if len(i) == 0: return x
    return x[max(0, i[0] - int(0.015 * SR)): i[-1] + int(0.05 * SR)]

def synth(text, style, speed, semis):
    # depth trick: synthesise at speed*r, play back r times slower -> pitch * 1/r
    r = 2 ** (-semis / 12)  # semis<0 -> r>1
    s, sr = K.create(text, voice=style, speed=float(speed * r), lang="en-us")
    x = np.asarray(s, np.float32)
    # playing back at sr/r == resample from sr to sr*r then treat as sr
    x = resample(x, sr, int(round(sr * r)))  # longer by r -> pitch lower when played at sr
    return resample(x, sr, SR)

def phrases(text):
    parts = re.findall(r"[^.!?]+(?:\.\.\.|[.!?]+)?", text)
    out = []
    for p in parts:
        p = p.strip()
        if not p: continue
        end = "..." if p.endswith("...") else (p[-1] if p[-1] in ".!?" else "")
        out.append((p, end))
    return out

PAUSE = {"...": 0.42, ".": 0.24, "?": 0.28, "!": 0.22, "": 0.12}

# ---------------- studio chain ----------------
def biquad(kind, f0, gain_db=0, q=0.707):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; cw, sw = np.cos(w), np.sin(w); al = sw / (2 * q)
    if kind == "peak":
        b = [1 + al * A, -2 * cw, 1 - al * A]; a = [1 + al / A, -2 * cw, 1 - al / A]
    elif kind == "low":
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) - (A - 1) * cw + sq), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - sq)]
        a = [(A + 1) + (A - 1) * cw + sq, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - sq]
    elif kind == "high":
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * cw + sq), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sq)]
        a = [(A + 1) - (A - 1) * cw + sq, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sq]
    elif kind == "hp":
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]; a = [1 + al, -2 * cw, 1 - al]
    return np.array(b) / a[0], np.array(a) / a[0]

def eq(x, chain):
    for k in chain:
        b, a = biquad(*k); x = signal.lfilter(b, a, x)
    return x

def envelope(x, att, rel):
    e = np.abs(x); out = np.zeros_like(e); v = 0.0
    ka, kr = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    # decimate for speed
    hop = 48; ed = e[::hop]; od = np.zeros_like(ed)
    ka, kr = np.exp(-hop / (att * SR)), np.exp(-hop / (rel * SR))
    for i, s in enumerate(ed):
        k = ka if s > v else kr; v = k * v + (1 - k) * s; od[i] = v
    return np.interp(np.arange(len(x)), np.arange(len(od)) * hop, od)

def deess(x, thr_db=-30, amt=0.6):
    b, a = signal.butter(2, [5000 / (SR / 2), 9500 / (SR / 2)], "band")
    band = signal.lfilter(b, a, x)
    env = envelope(band, 0.002, 0.04) + 1e-9
    thr = 10 ** (thr_db / 20) * np.abs(x).max()
    g = np.where(env > thr, (thr / env) ** amt, 1.0)
    return x - band * (1 - g)

def compress(x, thr_db=-20, ratio=3.0, makeup_db=3):
    env = envelope(x, 0.005, 0.09) + 1e-9
    lv = 20 * np.log10(env / (np.abs(x).max() + 1e-9))
    over = np.maximum(0, lv - thr_db)
    g = 10 ** ((-over * (1 - 1 / ratio) + makeup_db) / 20)
    return x * g

_ir = None
def room(x, wet_db=-25):
    global _ir
    if _ir is None:
        rng = np.random.default_rng(5); n = int(0.32 * SR)
        _ir = rng.normal(0, 1, n) * np.exp(-np.arange(n) / (0.06 * SR))
        _ir = signal.lfilter(*signal.butter(1, 5000 / (SR / 2)), _ir); _ir /= np.abs(_ir).sum()
        _ir = np.concatenate([np.zeros(int(0.012 * SR)), _ir])
    wet = signal.fftconvolve(x, _ir)[: len(x)]
    return x + wet * 10 ** (wet_db / 20) * 8

def studio(x, deep=True):
    x = eq(x, [("hp", 70, 0, 0.707), ("low", 130 if deep else 160, 2.5 if deep else 1.5, 0.7), ("peak", 330, -2.5, 1.0),
               ("peak", 3200, 2.5, 0.9), ("high", 9500, 2.0, 0.7)])
    x = deess(x)
    x = compress(x)
    x = np.tanh(x / (np.abs(x).max() + 1e-9) * 1.25) * 0.8
    x = room(x)
    return x.astype(np.float32)

def rms_norm(x, target_db):
    r = np.sqrt(np.mean(x ** 2) + 1e-12); y = x * (10 ** (target_db / 20) / r)
    pk = np.abs(y).max()
    return y * (0.89 / pk) if pk > 0.89 else y

def main():
    only = set(sys.argv[sys.argv.index("--only") + 1].split(",")) if "--only" in sys.argv else None
    os.makedirs(os.path.join(HERE, "out", "lines"), exist_ok=True)
    rng = np.random.default_rng(11)
    for ln in spec["lines"]:
        if only and ln["id"] not in only: continue
        if ln["s"] not in VOICES:  # crowd lines keep the layered version from build_vo.py
            continue
        style, semis, base = VOICES[ln["s"]]
        emo = 0.9 if ln["id"] in SLOW else 1.06 if ln["id"] in FAST else 1.0
        chunks = []
        ph = phrases(ln["t"])
        for j, (p, end) in enumerate(ph):
            sp = base * emo * (1 + rng.uniform(-0.03, 0.03))
            y = trim(synth(p, style, sp, semis))
            chunks.append(y)
            if j < len(ph) - 1:
                chunks.append(np.zeros(int(PAUSE[end] * (1.25 if emo < 1 else 1.0) * SR), np.float32))
        y = np.concatenate(chunks)
        y = studio(y, deep=ln["s"] in ("N", "DAD", "COACH", "KYLE"))
        f = int(0.01 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
        y = rms_norm(y, -19 if ln["s"] == "N" else -20)
        sf.write(os.path.join(HERE, "out", "lines", ln["id"] + ".wav"), y, SR, subtype="PCM_16")
        print(ln["id"], ln["s"], round(len(y) / SR, 2), flush=True)

if __name__ == "__main__":
    main()

"""EP07 mix: VO + ducked music + SFX cue sheet -> -14 LUFS master (EP02/06_edit/mix_master.wav)."""
import json, os, re, subprocess, tempfile
import numpy as np, soundfile as sf

EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STUDIO = os.path.dirname(EP)
SR = 48000
TL = json.load(open(f"{EP}/03_voiceover/out/timeline.json"))
LINES = {l["id"]: l for l in TL["lines"]}
DUR = TL["duration"] + 0.6
S = lambda i: LINES[i]["start"]
E = lambda i: LINES[i]["end"]

SHOTS = []
mid = lambda i, x: S(i) + (E(i) - S(i)) * x
for m in re.finditer(r"add\('([^']+)',\s*(.+?),\s*A\.(\w+)(?:\([^)]*\))?(?:,\s*'(\w+)')?\);", open(f"{EP}/visuals/src/shots/list.ts").read()):
    name, expr, comp, tr = m.groups()
    key = name.split("_")[0] + "_" + name.split("_")[1] if "_" in name else name.split()[0]
    SHOTS.append({"name": name, "key": key, "at": max(0, eval(expr, {"S": S, "E": E, "mid": mid})), "comp": comp, "tr": tr or "cut"})
SHOTS.sort(key=lambda s: s["at"])
A = {s["key"]: s["at"] for s in SHOTS}

def load(path):
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    if sr != SR:
        n = int(len(x) * SR / sr)
        x = np.stack([np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x[:, c]) for c in range(x.shape[1])], 1).astype(np.float32)
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    return x[:, :2]

N = int(DUR * SR)
sfx_bus = np.zeros((N, 2), np.float32)
cues = []
def place(bus, x, t, gain=1.0, max_len=None):
    if max_len:
        x = x[: int(max_len * SR)].copy(); f = min(len(x), int(0.08 * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]
    a = int(round(t * SR))
    if a < 0: x = x[-a:]; a = 0
    b = min(len(bus), a + len(x))
    if b > a: bus[a:b] += x[: b - a] * gain
_c = {}
def sfx(name, t, db=-8.0, max_len=None):
    p = f"{STUDIO}/04_audio/sfx/{name}.wav"
    if not os.path.exists(p): print("MISSING", name); return
    _c.setdefault(p, load(p)); place(sfx_bus, _c[p], t, 10 ** (db / 20), max_len); cues.append({"t": round(t, 3), "sfx": name, "db": db})
def loop(name, t0, t1, db):
    x = load(f"{STUDIO}/04_audio/sfx/{name}.wav"); n = int((t1 - t0) * SR)
    y = np.concatenate([x] * (n // len(x) + 2))[:n].copy(); f = min(n // 3, int(0.8 * SR))
    y[:f] *= np.linspace(0, 1, f)[:, None]; y[-f:] *= np.linspace(1, 0, f)[:, None]
    place(sfx_bus, y, t0, 10 ** (db / 20)); cues.append({"t": round(t0, 3), "loop": name, "until": round(t1, 3)})
rot = lambda b, i, n=3: f"{b}_{i % n + 1}"



# ---------- synthesized ----------
def synth_sub(dur=1.4, f0=55):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * np.exp(-t * 1.2)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6) * 0.9
    x += np.random.default_rng(1).normal(0, 1, len(t)) * np.exp(-t * 30) * 0.15
    y = x.astype(np.float32); return np.stack([y, y], 1)
def synth_rain(dur):
    n = int(dur * SR); r = np.random.default_rng(7).normal(0, 1, n)
    r = np.convolve(r, np.ones(6) / 6, mode="same") - np.convolve(r, np.ones(60) / 60, mode="same")
    y = (r / (np.abs(r).max() + 1e-9) * 0.5).astype(np.float32); f = min(n // 3, SR)
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f); return np.stack([y, np.roll(y, 300)], 1)
def synth_beat(n, bpm0, bpm1):
    out = []; t = 0.0; T = []
    for i in range(n): T.append(t); t += 60 / (bpm0 + (bpm1 - bpm0) * i / max(1, n - 1))
    L = int((t + 0.5) * SR); y = np.zeros(L, np.float32); tt = np.arange(int(0.25 * SR)) / SR
    b = (np.sin(2 * np.pi * 48 * tt) * np.exp(-tt * 18)).astype(np.float32)
    for x in T:
        for off in (0, 0.18):
            a = int((x + off) * SR); y[a:a + len(b)] += b[: max(0, min(len(b), L - a))] * (1 if off == 0 else 0.6)
    return np.stack([y, y], 1)
def synth_beep(n=6, gap=0.75):
    out = np.zeros((int((n * gap + 0.3) * SR), 2), np.float32); tt = np.arange(int(0.12 * SR)) / SR
    b = (np.sin(2 * np.pi * 1000 * tt) * np.exp(-tt * 10) * 0.4).astype(np.float32)
    for i in range(n): a0 = int(i * gap * SR); out[a0:a0 + len(b)] += b[:, None]
    return out
def put(x, t, db): place(sfx_bus, x, t, 10 ** (db / 20)); cues.append({"t": round(t, 3), "synth": True})

# ---------- transitions ----------
for i, s in enumerate(SHOTS):
    tr = s["tr"]
    if tr in ("whip", "whipL"): sfx(rot("swish_whip", i, 2), s["at"] - 0.08, -13)
    elif tr == "zoom": sfx(rot("whoosh_fast", i), s["at"] - 0.18, -14)
    elif tr == "slowfade": sfx(rot("whoosh_slow", i, 2), s["at"] - 0.3, -22)
    elif tr == "glitch": sfx("glitch", s["at"] - 0.02, -16, max_len=0.5)
K = lambda c, l: A[c + "_" + l]
def hit(t0, db=-12): sfx(rot("pop_age", int(t0 * 10)), t0 + 0.68, db); sfx("sparkle", t0 + 0.7, db - 8)
def smart(t0, db=-12): sfx("chime_soft", t0 + 0.68, db); sfx("whoosh_slow_1", t0 + 0.5, db - 6)
for t0 in [K("A1","a01") + 0.6, K("C1","c01") + 1.6, K("C2","c02") + 2.0, K("G5","g05")] + [K("C6","c06") + 0.4 + i * 0.4 for i in range(3)]: hit(t0)
for i in range(5): hit(K("B1","b01") + 0.5 + i * 0.7, -16)
for i in range(3): smart(mid("b01", 0.72) + i * 0.7, -16)
for i in range(12): hit(K("D2","d02") + 0.6 + i * (K("D3","d03") - K("D2","d02")) / 13, -18)
for i in range(40): sfx(rot("pop_ui", i), K("D3","d03") + (i * 0.13) % max(0.5, (K("D4","d04") - K("D3","d03")) - 0.8) + 0.7, -24)
for c, l, ts in [("F4","f04",[0.6]), ("F6","f06",[1, 4]), ("F8","f08",[0.5])]:
    d0 = E(l) - S(l)
    for x in ts: smart(K(c, l) + (x * d0 if x < 1 else x), -10)
for i, x in enumerate([0.6, 0.4, 0.72]): smart(K("F9","f09") + (E("f09") - S("f09")) * x if i else K("F9","f09") + 0.6, -12)
for t in [S("c03") + 0.5, S("c07") + 0.3, S("d02") + 1.0, S("d04") + 0.3]: put(synth_sub(), t, -6)
loop("crowd_murmur", 0, K("A3","a03"), -32)
sfx("magic_shimmer", K("A2","a02") + 0.2, -12); sfx("thud_impact_2", K("A2","a02") + 0.3, -14)
loop("crowd_murmur", K("A4","a04"), K("B1","b01"), -30)
sfx("ding_1", K("B3","b03") + 1.0, -14)
loop("crowd_murmur", K("C1","c01"), K("C2","c02"), -32)
loop("room_tone_home", K("C2","c02"), K("C3","c03"), -32)
sfx("paper_rustle", K("C3","c03") + 0.3, -16)
sfx("thud_impact_1", mid("c05", 0.32), -8); sfx("boing_comic", mid("c05", 0.34), -12)
loop("cafeteria_ambience", K("C6","c06"), K("C7","c07"), -26)
sfx("pencil_scribble", K("C7","c07") + 0.4, -16); sfx("ding_2", mid("c07", 0.5), -12)
for i in range(10): sfx("phone_buzz", K("D1","d01") + 0.2 + i * 0.25, -24, max_len=0.2)
sfx("magic_shimmer", K("D4","d04") + 0.4, -16); sfx("pencil_scribble", K("D5","d05") + 0.5, -16); sfx("ding_1", K("D5","d05") + 4, -12)
sfx("tv_static_off", K("D6","d06"), -14)
sfx("reverse_swell", K("E1","e01") - 0.3, -16); loop("cafeteria_ambience", K("E2","e02"), K("E3","e03"), -30)
sfx("paper_rustle", K("E4","e04") + 0.5, -18); sfx("sigh_air", mid("e04", 0.8), -10)
sfx("heartbeat", K("E6","e06") + 0.3, -12); sfx("clock_tick", K("E7","e07") + 0.2, -20, max_len=5); sfx("heartbeat", K("E7","e07") + 2, -12)
sfx("footsteps_walk", K("F3","f03") + 0.2, -22, max_len=2)
sfx("magic_shimmer", K("G1","g01") + 0.5, -16); sfx("school_bell", K("G1","g01") + 0.1, -26, max_len=1.0); sfx("chime_soft", K("G3","g03") + 0.5, -16)
MUSIC = [
    ("m1_curious", 0.0, -2.0, None, 0, K("C1","c01") + 0.5),
    ("m2_comedy", K("C1","c01"), -3.0, None, 0, K("D1","d01") - K("C1","c01") + 0.5),
    ("m5_reveal", S("d05") + 2.0 - 46.7, -1.5, None, 0, K("E1","e01") - (S("d05") + 2.0 - 46.7) + 0.6),
    ("m7_cliffhanger", K("E1","e01"), -2.0, None, 0, K("F3","f03") - K("E1","e01") + 0.5),
    ("m4_tender", S("f04") - 45.2, -1.0, None, 0, K("G1","g01") - (S("f04") - 45.2) + 0.5),
    ("m6_resolve", K("G1","g01"), -2.0, None, 0, K("G4","g04") - K("G1","g01") + 0.5),
    ("m2_comedy", K("G4","g04"), -4.0, None, 0, TL["duration"] - K("G4","g04") + 0.5),
]
def fitted(p, target):
    r = sf.info(p).duration / target
    if abs(r - 1) < 0.005: return p
    out = os.path.join(tempfile.gettempdir(), f"ep4fit_{os.path.basename(p)}_{target:.2f}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-af", f"atempo={r:.5f}", out], check=True); return out
mus = np.zeros((N, 2), np.float32)
for name, t0, db, target, off, maxlen in MUSIC:
    p = f"{STUDIO}/04_audio/music/{name}.wav"
    if target: p = fitted(p, target)
    x = load(p)
    if maxlen and maxlen > len(x) / SR - off:
        xf = int(1.5 * SR); y = x.copy()
        while len(y) / SR - off < maxlen:
            fade = np.linspace(0, 1, xf)[:, None]
            y[-xf:] = y[-xf:] * (1 - fade) + x[:xf] * fade; y = np.concatenate([y, x[xf:]])
        x = y
    x = x[int(max(0, off) * SR):]
    if t0 < 0: x = x[int(-t0 * SR):]; t0 = 0
    if maxlen:
        x = x[: int(maxlen * SR)].copy(); f = int(min(2.0, maxlen / 3) * SR); x[-f:] *= np.linspace(1, 0, f)[:, None]
    f = int(0.6 * SR)
    if t0 > 0.1 or off > 0: x[:f] *= np.linspace(0, 1, f)[:, None]
    place(mus, x, t0, 10 ** (db / 20)); cues.append({"t": round(t0, 3), "music": name})

vo = load(f"{EP}/03_voiceover/out/vo_full.wav"); vo = np.pad(vo, ((0, max(0, N - len(vo))), (0, 0)))[:N]
act = np.zeros(N, np.float32)
for l in TL["lines"]: act[int(l["start"] * SR): int(l["end"] * SR)] = 1
hop = 240; a_d = act[::hop]; env = np.zeros_like(a_d); v = 0.0
ka, kr = np.exp(-hop / (0.12 * SR)), np.exp(-hop / (0.45 * SR))
for i, xx in enumerate(a_d):
    k = ka if xx > v else kr; v = k * v + (1 - k) * xx; env[i] = v
env = np.interp(np.arange(N), np.arange(len(env)) * hop, env)
mus *= (10 ** ((-11.0 * env) / 20) * 10 ** (-6 / 20))[:, None]
mix = vo + mus + sfx_bus * 10 ** (-3 / 20)
pre = f"{EP}/06_edit/mix_premaster.wav"; sf.write(pre, mix, SR, subtype="FLOAT")
json.dump({"shots": SHOTS, "cues": sorted(cues, key=lambda c: c["t"])}, open(f"{EP}/06_edit/cuesheet.json", "w"), indent=1)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rindex("{"):])
af = (f"loudnorm=I=-14:TP=-1.2:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000")
out = f"{EP}/06_edit/mix_master.wav"
subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", pre, "-af", af, "-ar", "48000", "-c:a", "pcm_s16le", out], check=True)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
print("shots", len(SHOTS), "cues", len(cues), " ".join(l.strip() for l in r.stderr[r.stderr.rindex("Summary"):].splitlines() if l.strip().startswith(("I:", "Peak:"))))

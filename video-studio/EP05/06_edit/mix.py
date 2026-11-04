"""EP05 mix: VO + ducked music + SFX cue sheet -> -14 LUFS master (EP02/06_edit/mix_master.wav)."""
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
    key = name.split()[0]
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
def synth_horn(dur=1.3):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sign(np.sin(2 * np.pi * f * t + ph)) for f, ph in ((349, 0), (440, 1), (352, 2))) / 3
    x = np.convolve(x, np.ones(12) / 12, mode="same")
    env = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.15)
    y = (x * env * 0.5).astype(np.float32); return np.stack([y, y], 1)
def put(x, t, db): place(sfx_bus, x, t, 10 ** (db / 20)); cues.append({"t": round(t, 3), "synth": True})


import sys
sys.path.insert(0, "")
# ---------- blink ledger (mirror of visuals/src/lib/blink.tsx) ----------
B = [(mid("a01", 0.82), 1), (mid("a03", 0.22), 2), (S("a05") + 0.15, 3), (S("c02") + 0.1, 4), (E("c04") - 0.25, 5), (S("d03") + 0.1, 6),
     (S("d05") + 0.1, 7), (S("d06") + 0.1, 8), (S("e01") + 0.1, 9), (mid("e01", 0.3), 10), (S("e02") + 0.1, 11), (mid("e02", 0.42), 12),
     (S("e03") + 0.1, 13), (S("e04") - 0.5, 14), (S("e04") + 0.1, 15), (S("f01") - 0.5, 16), (S("f01") + 0.1, 17), (S("f02") + 0.1, 18),
     (S("f03") - 0.9, 19), (S("f03") - 0.6, 20), (S("f03") - 0.3, 21), (S("f03") + 0.1, 22), (S("f04") - 0.4, 23), (S("f04") + 0.1, 24),
     (S("f05") - 0.4, 25), (S("f05") + 0.1, 26), (S("f06") + 0.1, 27)]
for t, n in B:
    sfx("blip_1", t - 0.1, -20)
    sfx(rot("whoosh_fast", n), t - 0.05, -9 if n >= 4 else -12)
    if n >= 3: put(synth_sub(1.0 + min(1.5, n * 0.05), 70 - min(30, n)), t, -9 + min(4, n * 0.15))
    if n in (6, 8, 13, 17, 22, 24, 27): sfx("magic_shimmer", t + 0.2, -14)
# ---------- space bed ----------
def drone(dur, f=55):
    tt = np.arange(int(dur * SR)) / SR
    y = (np.sin(2 * np.pi * f * tt) * 0.5 + np.sin(2 * np.pi * f * 1.5 * tt + 1) * 0.25 + np.sin(2 * np.pi * f * 2.01 * tt) * 0.15) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tt))
    y = y.astype(np.float32); fd = min(len(y) // 3, 2 * SR); y[:fd] *= np.linspace(0, 1, fd); y[-fd:] *= np.linspace(1, 0, fd)
    return np.stack([y, np.roll(y, 500)], 1)
put(drone(A["G1"] - A["D3"], 55), A["D3"], -30)
put(drone(A["H2"] - A["G6"], 41), A["G6"], -28)
# ---------- transitions ----------
for i, s in enumerate(SHOTS):
    tr = s["tr"]
    if tr in ("whip", "whipL"): sfx(rot("swish_whip", i, 2), s["at"] - 0.08, -14)
    elif tr == "zoom": sfx(rot("whoosh_fast", i), s["at"] - 0.18, -16)
    elif tr == "slowfade": sfx(rot("whoosh_slow", i, 2), s["at"] - 0.3, -22)
# ---------- hand placed ----------
loop("room_tone_home", 0, A["B1"], -32)
sfx("sigh_air", 0.4, -20)
sfx("glass_break", mid("a03", 0.3), -26, max_len=0.3); sfx("thud_impact_2", mid("a03", 0.3), -16)
sfx("reverse_swell", A["B4"] - 0.3, -14); sfx("riser", A["B4"] + 0.5, -16)
sfx("thud_impact_1", mid("b05", 0.2), -16); sfx("clock_tick", mid("b05", 0.45), -18, max_len=3.6); sfx("ding_2", mid("b05", 0.8), -14)
for i in range(4): sfx(rot("pop_ui", i), A["B2"] + 0.2 + i * 0.75, -14)
for i in range(15): sfx(rot("tick", i), A["B3"] + 0.3 + i * 0.27, -20)
put(synth_horn(1.3), A["C1"] + 0.6, -8); sfx("whoosh_fast_1", A["C1"] + 0.6, -8)
loop("crowd_murmur", A["C1"], A["C2"], -34)
sfx("glass_break", A["C2"] + 1.2, -18, max_len=0.6)
sfx("heartbeat", A["C3"] + 0.2, -10); sfx("heartbeat", A["C3"] + 3.5, -8)
sfx("riser_short", E("c04") - 1.4, -12)
put(synth_rain(A["D3"] - A["D1"]), A["D1"], -30)
sfx("sigh_air", A["D2"] + 0.8, -16)
sfx("magic_shimmer", A["D4"] + 0.4, -18); sfx("chime_soft", A["D4"] + 1.5, -18)
sfx("boing_comic", mid("d05", 0.78), -18)
sfx("chime_soft", A["D6"] + 2.5, -16)
sfx("whoosh_slow_1", mid("e01", 0.35), -10)
sfx("sparkle", A["E3"] + 0.8, -16); sfx("blip_2", mid("e04", 0.75), -14)
sfx("chime_soft", mid("e05", 0.7), -14)
sfx("reverse_swell", A["F1"] + 0.2, -16); sfx("magic_shimmer", A["F3"] + 0.6, -14); sfx("magic_shimmer", A["F5"] + 0.6, -14)
sfx("heartbeat", A["G1"] + 0.2, -10); sfx("riser", A["G2"] + 3.5, -14)
for i in range(6): sfx("heartbeat", A["G3"] + i * 0.75, -8)
for i in range(10): sfx("heartbeat", S("g05") + (E("g05") - S("g05")) * i / 10, -12)
sfx("chime_soft", A["G6"] + 0.1, -8); sfx("magic_shimmer", A["G6"] + 0.2, -12)
sfx("reverse_swell", A["H2"] - 0.5, -18)
# ---------- music ----------
MUSIC = [
    ("m1_curious", 0.0, -2.0, A["C1"] + 0.4, 0, None),
    ("m3_tension", A["C1"], -2.0, A["D1"] - A["C1"] + 0.5, 0, None),
    ("m5_reveal", A["D1"], -1.5, None, max(0.0, 46.7 - (S("d06") + 1.0 - A["D1"])), A["E1"] - A["D1"] + 0.6),
    ("m4_tender", S("e05") + 1.5 - 42.0, -2.0, None, 0, A["F1"] - (S("e05") + 1.5 - 42.0)),
    ("m5_reveal", S("f06") + 1.0 - 46.7, -1.0, None, 0, A["G1"] - (S("f06") + 1.0 - 46.7) + 0.5),
    ("m7_cliffhanger", A["G1"], -2.0, None, 0, S("g05") - A["G1"]),
    ("m6_resolve", A["H1"], -2.0, None, 0, TL["duration"] - A["H1"] + 0.5),
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

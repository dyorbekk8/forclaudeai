"""EP04 mix: VO + ducked music + SFX cue sheet -> -14 LUFS master (EP02/06_edit/mix_master.wav)."""
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
def put(x, t, db): place(sfx_bus, x, t, 10 ** (db / 20)); cues.append({"t": round(t, 3), "synth": True})

# ---------- transitions ----------
for i, s in enumerate(SHOTS):
    tr = s["tr"]
    if tr in ("whip", "whipL"): sfx(rot("swish_whip", i, 2), s["at"] - 0.08, -13)
    elif tr == "zoom": sfx(rot("whoosh_fast", i), s["at"] - 0.18, -14)
    elif tr == "slowfade": sfx(rot("whoosh_slow", i, 2), s["at"] - 0.3, -22)
    elif tr == "glitch": sfx("glitch", s["at"] - 0.02, -16, max_len=0.5)

# ---------- name hits (+1%) : NameFly arrives 0.7 s after launch ----------
def name_hit(t0, db=-12): sfx(rot("pop_age", int(t0 * 10)), t0 + 0.68, db); sfx("sparkle", t0 + 0.7, db - 8)
for t0 in [A["A1"] + 0.9, A["C3"] + 0.3, A["C3"] + 1.9, A["C6"] + 0.15, A["C6"] + 1.6, A["D3"] + 0.5, A["D3"] + 1.3,
           A["E7"] + 0.2, A["E7"] + 1.0, A["H2"] + 0.2, A["H4"] + 0.1, A["H4"] + 0.7, A["H4"] + 1.3, A["H8"] + 0.3]:
    name_hit(t0)
for i in range(9): name_hit(A["B1"] + 0.6 + i * 0.55, -18)
for i in range(3): name_hit(mid("c05", 0.3) + i * 0.4, -16)
H5d = A["H6"] - A["H5"]
for i in range(6): name_hit(A["H5"] + 0.2 + i * H5d / 6, -16)
for i in range(40): sfx(rot("pop_ui", i), A["D4"] + (i * 0.13) % max(0.5, (A["D4b"] - A["D4"]) - 0.8) + 0.7, -24)
for i in range(60): sfx(rot("pop_ui", i), A["I3"] + (i * 0.07) % max(0.5, (A["I4"] - A["I3"]) - 0.8) + 0.7, -24)

# ---------- sub drops on big speed jumps ----------
for t in [S("c07") + 0.2, S("d02") + 1.0, S("d04") + 0.2, S("d04b") + 0.4, S("e01") + 0.4, S("e04") + 0.5, S("i04") + 0.5]:
    put(synth_sub(), t, -6)
sfx("riser", S("e04") - 1.5, -16)

# ---------- hand placed ----------
loop("room_tone_home", 0, A["A4"], -32)
sfx("swish_whip_1", A["A2"] + 0.05, -6); sfx("whoosh_fast_2", A["A2"] + 0.2, -10)
sfx("reverse_swell", A["A3"] - 0.2, -16); sfx("magic_shimmer", A["A3"] + 0.3, -18)
sfx("thud_impact_2", A["A4"] + 0.2, -16); sfx("riser_short", A["A5"] - 0.9, -14); sfx("counter_roll", A["A5"] + 0.3, -14)
sfx("footsteps_walk", A["B2"] + 0.2, -22, max_len=4)
for i in range(4): sfx(rot("pop_ui", i), A["B3"] + 0.1 + i * 0.05, -16)
sfx("ding_1", S("b03") + 1.0, -14); put(synth_sub(1.0, 70), S("b04") + 1.4, -10); sfx("thud_impact_1", S("b04") + 1.4, -12)
sfx("riser", S("b05") - 0.5, -16); sfx("magic_shimmer", S("b05") + 2.4, -12)
loop("crowd_murmur", A["B6"], A["C1"], -30)
loop("crowd_murmur", A["C1"], A["C2"], -30); sfx("school_bell", A["C1"] + 0.1, -26, max_len=1.0)
loop("room_tone_care", A["C2"], A["C5"], -34); sfx("clock_tick", A["C2"] + 0.3, -26, max_len=4)
loop("crowd_murmur", A["C5"], A["C6"], -32)
sfx("thud_impact_2", mid("c05", 0.6), -20); sfx("thud_impact_2", mid("c05", 0.7), -22)
sfx("whoosh_fast_1", A["C7"] + 0.1, -10); sfx("thud_impact_1", A["C7"] + 1.45, -20)
sfx("swish_whip_2", mid("c08", 0.05), -14); sfx("ding_2", mid("c08", 0.4), -14); sfx("whoosh_fast_3", mid("c08", 0.6), -12)
sfx("bus_brake", A["D1"] + 0.3, -22); sfx("whoosh_fast_1", A["D1"] + 0.2, -12); sfx("camera_shutter", A["D1"] + 0.3, -18)
for i in range(10): sfx("phone_buzz", A["D2"] + 0.4 + i * 0.5, -26, max_len=0.2)
sfx("counter_roll", A["D2"] + 0.3, -14); loop("crowd_murmur", A["D3"], A["D4"], -30)
loop("crowd_murmur", A["D5"], A["D6"], -30)
sfx("riser_short", A["D6"] - 1.0, -10)
put(synth_sub(2.0, 45), A["D6"], -2); sfx("thud_impact_1", A["D6"], -4); sfx("glass_break", A["D6"] + 0.1, -4); sfx("glass_break", A["D6"] + 0.25, -8)
sfx("tv_static_off", A["D6"] + 0.4, -18)
sfx("sigh_air", A["D7"] + 0.6, -18)
sfx("magic_shimmer", A["E1"] + 0.6, -16)
sfx("footsteps_walk", A["E2"] + 0.2, -24, max_len=5)
put(synth_rain(A["E3"] - A["E2b"]), A["E2b"], -26); sfx("chime_soft", A["E2b"] + 0.8, -16)
sfx("clock_tick", A["E3"] + 0.1, -12, max_len=3.4); sfx("clock_tick", A["E4"] + 0.1, -20, max_len=7)
sfx("stamp_thud", mid("e05", 0.6), -12)
sfx("footsteps_walk", A["E6"] + 0.1, -22, max_len=2); sfx("whoosh_slow_1", mid("e06", 0.5) - 0.2, -14); sfx("door_open", mid("e06", 0.5) + 0.3, -18)
sfx("heartbeat", A["E8"] + 0.3, -16)
sfx("phone_buzz", A["F4"] + 0.3, -22, max_len=0.4); sfx("tv_static_off", A["F4"] + 2.8, -16)
loop("crowd_murmur", A["F5"], A["F5b"], -34); sfx("tv_static_off", A["F5b"], -14)
for i in range(3): sfx(rot("tick", i), A["F6"] + 0.2 + i * 1.0, -12)
sfx("whoosh_slow_2", mid("f07", 0.05), -16); sfx("whoosh_slow_1", mid("f07", 0.22), -18); sfx("chime_soft", mid("f07", 0.38), -12)
sfx("glitch", A["G1"], -12); sfx("reverse_swell", A["G1"] + 0.3, -16)
sfx("clock_tick", A["G3"] + 0.2, -22, max_len=8)
sfx("sigh_air", A["G5"] + 1.0, -18)
sfx("door_open", mid("h01", 0.2), -14); sfx("footsteps_walk", mid("h01", 0.45), -24, max_len=2)
sfx("heartbeat", A["H3"] + 0.9, -12)
sfx("sparkle", A["H6"] + 0.3, -16); sfx("chime_soft", A["H7"] + 0.6, -18)
sfx("phone_buzz", A["I2"], -10, max_len=1.2)
put(synth_beat(18, 70, 160), A["I4"] - 0.3, -8)
sfx("riser", A["I4"] + 0.5, -12)

# ---------- music ----------
MUSIC = [  # name, start, dB, target length, offset, max length
    ("m1_curious", 0.0, -1.5, None, 0, A["C1"] + 0.6),
    ("m4_tender", A["C1"], -3.0, None, 0, A["C5"] - A["C1"] + 0.6),
    ("m2_comedy", A["C5"], -3.0, None, 0, A["D1"] - A["C5"] + 0.5),
    ("m3_tension", A["D1"], -2.0, None, 0, A["D6"] - A["D1"] - 0.4),
    ("m7_cliffhanger", A["D7"], -3.0, None, 0, A["E1"] - A["D7"] + 0.6),
    ("m5_reveal", S("e07") - 46.7, -1.5, None, 0, A["F1"] - (S("e07") - 46.7) + 1.0),
    ("m7_cliffhanger", A["F1"], -2.0, None, 0, S("f07") - A["F1"] + 1.0),
    ("m6_resolve", mid("f07", 0.35), -2.5, None, 0, A["G1"] - mid("f07", 0.35) + 0.3),
    ("m4_tender", S("h02") - 45.3, -1.0, None, 0, None),
    ("m6_resolve", A["H7"], -1.5, None, 0, A["I2"] - A["H7"] + 0.4),
    ("m3_tension", A["I2"], -1.0, None, 0, TL["duration"] - A["I2"] + 0.5),
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

"""EP02 mix: VO + ducked music + SFX cue sheet -> -14 LUFS master (EP02/06_edit/mix_master.wav)."""
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
for m in re.finditer(r"add\('([^']+)',\s*([^,]+?),\s*\w+\.(\w+)(?:,\s*'(\w+)')?\)", open(f"{EP}/visuals/src/shots/list.ts").read()):
    name, expr, comp, tr = m.groups()
    SHOTS.append({"name": name, "at": eval(expr, {"S": S, "E": E}), "comp": comp, "tr": tr or "cut"})
SHOTS.sort(key=lambda s: s["at"])
A = {s["comp"]: s["at"] for s in SHOTS}

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

# transitions
for i, s in enumerate(SHOTS):
    if s["tr"] in ("whip", "whipL"): sfx(rot("swish_whip", i, 2), s["at"] - 0.08, -13)
    elif s["tr"] == "zoom": sfx(rot("whoosh_fast", i), s["at"] - 0.18, -14)
    elif s["tr"] == "slowfade": sfx(rot("whoosh_slow", i, 2), s["at"] - 0.3, -22)

# strength events (import the ledger numbers from strength.tsx by re-deriving the same times)
UP = [E("a03") - 0.5, S("c04") + 0.1, S("c06") + 0.3, S("c07") + 0.2, S("c13") + 0.1, S("c14") + 0.3, E("e04") + 0.05, S("e06") + 0.5, E("f08") - 0.4]
DOWN = [E("d05") + 0.05, E("d08") + 0.05, E("f04") + 0.05, S("f05b") + 1.2, S("f05b") + 2.2]
for i, t in enumerate(UP):
    sfx(rot("pop_age", i), t - 0.03, -6); sfx("magic_shimmer", t, -18)
for i, t in enumerate(DOWN):
    sfx("tv_static_off", t, -16); sfx(rot("thud_impact", i, 2), t, -16)
sfx("riser", E("f08") - 2.4, -14); sfx("thud_impact_1", E("f08") - 0.4, -4)

# ambience
loop("crowd_murmur", A["A1"], A["A3"], -36); loop("crowd_murmur", A["C2"], A["C4"] + 3, -38)
loop("room_tone_home", A["C5"], A["C7"], -32); loop("crowd_murmur", A["D3"], A["D5"], -34)
loop("crowd_murmur", A["E1"], A["E2"], -38); loop("crowd_murmur", A["F3"], A["F7"] + 2, -30)
loop("room_tone_home", A["H1"], A["H5"], -34)

# hand-placed
sfx("riser_short", A["A3"] + 0.4, -14); sfx("heartbeat", A["A3"] + 0.1, -12)
sfx("whoosh_slow_1", A["A4"] + 0.5, -12); sfx("thud_impact_2", A["A4"] + 1.0, -12)
sfx("record_scratch", A["A5"] + 0.05, -14)
for i in range(4): sfx(rot("pop_ui", i), A["B1"] + 0.3 + i * 0.5, -18)
sfx("stamp_thud", S("b01") + 2.2, -12); sfx("ding_1", S("b01") + 4.2, -12)
sfx("magic_shimmer", A["B2"] + 0.2, -14)
for i in range(7): sfx(rot("pop_ui", i), A["B3"] + 0.15 + i * 0.32, -14)
for i in range(5): sfx(rot("blip", i), S("b05") - 0.4 + i * 0.35, -15)
sfx("counter_roll", A["B5"] + 0.6, -16); sfx("pop_ui_1", A["B6"] + 0.8, -14); sfx("pop_ui_2", A["B6"] + 1.4, -14)
sfx("whoosh_fast_2", A["B7"] + 0.4, -12); sfx("stamp_thud", A["B7"] + 1.0, -12)
sfx("school_bell", A["C1"] + 0.05, -22, max_len=1.2); sfx("footsteps_hall", A["C1"] + 0.1, -20)
sfx("swallow_gulp", A["C3"] + 1.5, -16)
sfx("whoosh_fast_1", A["C4"] + 0.2, -12); sfx("glass_break", A["C4"] + 1.9, -18, max_len=0.5); sfx("thud_impact_1", A["C4"] + 2.4, -14)
sfx("glass_break", S("c06") + 1.6, -8); sfx("thud_impact_2", S("c06") + 1.6, -12)
sfx("bus_brake", A["C7"] + 1.0, -22); sfx("thud_impact_1", A["C7"] + 2.0, -14)
sfx("counter_roll", A["C8"] + 0.3, -16); sfx("counter_roll", A["C8"] + 1.2, -16)
for i in range(6): sfx("pencil_scribble", A["C9"] + 0.6 + i * 0.7, -20, max_len=0.3)
sfx("glitch", A["C10"] + 0.1, -16)
sfx("camera_shutter", A["C11"] + 0.2, -16); sfx("thud_impact_2", A["C11"] + 1.2, -16)
for i in range(5): sfx(rot("blip", i), A["C12"] + 0.2 + i * 0.5, -14)
sfx("magic_shimmer", A["C13"] + 0.2, -14)
sfx("thud_impact_1", A["C14"] + 2.4, -10)
sfx("phone_buzz", A["D1"] + 0.1, -16, max_len=0.8); sfx("counter_roll", A["D1"] + 0.3, -14)
sfx("ding_2", A["D2"] + 0.2, -14)
sfx("sparkle", A["D3"] + 0.5, -16)
sfx("camera_shutter", S("d05") - 0.2, -14)
sfx("sigh_air", A["D6"] + 0.5, -14)
sfx("reverse_swell", A["D7"] - 0.6, -16)
sfx("phone_buzz", A["D8"] + 0.2, -18, max_len=1.0)
sfx("door_close", A["E1"] + 0.2, -22)
sfx("footsteps_walk", A["E2"] + 0.1, -20, max_len=2.5)
sfx("thud_impact_2", A["E4"] + 1.6, -14); sfx("pencil_scribble", A["E5"] + 0.4, -18)
sfx("footsteps_walk", A["E7a"] + 0.1, -22, max_len=3.0); sfx("bike_bell", A["E7b"] + 1.6, -18)
sfx("heartbeat", A["E8"] + 1.6, -14)
sfx("phone_ring", A["F1"] - 0.2, -24, max_len=1.2)
sfx("thud_impact_1", S("f02") + 0.9, -6); sfx("glass_break", S("f02") + 0.95, -14)
sfx("heartbeat", A["F5"] + 0.2, -12); sfx("heartbeat", A["F6"] + 0.3, -10)
sfx("riser_short", A["F11"] - 0.9, -14); sfx("thud_impact_2", A["F11"] + 0.1, -8)
sfx("sparkle", A["F12"] + 0.4, -14)
sfx("chime_soft", A["G3"] + 0.6, -16)
sfx("glass_break", A["H4"] + 0.1, -8); sfx("tv_static_off", A["H4"] + 1.6, -10); sfx("glitch", A["H4"] + 1.8, -14)
sfx("pop_ui_1", A["H5"] + 0.3, -15); sfx("pop_ui_2", A["H5"] + 0.7, -15); sfx("pop_ui_3", S("h06") - 0.2, -13); sfx("ding_2", S("h06") + 1.2, -12)
# fire bed: filtered noise crackle synthesized here
fire_len = A["G1"] - A["F1"]
rng = np.random.default_rng(3)
n = int(fire_len * SR)
crack = (rng.random(n) < 0.0015) * rng.normal(0, 1, n)
roar = np.convolve(rng.normal(0, 1, n), np.ones(400) / 400, mode="same")
fire = (roar * 3 + np.convolve(crack, np.exp(-np.arange(300) / 40), mode="same") * 0.4).astype(np.float32)
fire /= np.abs(fire).max() + 1e-9
f = int(1.0 * SR); fire[:f] *= np.linspace(0, 1, f); fire[-f:] *= np.linspace(1, 0, f)
place(sfx_bus, np.stack([fire, np.roll(fire, 400)], 1), A["F1"], 10 ** (-26 / 20))

# music
MUSIC = [  # name, start, dB, target length (stretch) or None, offset into file, max length, loop
    ("m1_curious", 0.0, -1.0, A["C1"] + 0.3, 0, None),
    ("m2_comedy", A["C1"], -2.5, None, 0, A["D1"] - A["C1"] + 0.4),
    ("m3_tension", A["D1"], -2.0, A["E1"] - A["D1"] + 0.6, 0, None),
    ("m4_tender", A["E1"], -1.5, None, 0, min(41.5, A["F1"] - A["E1"] + 0.5)),
    ("m5_reveal", A["F1"], -1.0, None, 46.7 - (A["F11"] + 0.1 - A["F1"]), A["G1"] - A["F1"] + 1.5),
    ("m6_resolve", A["G1"], -2.0, None, 0, A["H1"] - A["G1"] + 0.8),
    ("m7_cliffhanger", A["H1"], -1.0, None, 0, TL["duration"] - A["H1"] + 0.5),
]
def fitted(p, target):
    r = sf.info(p).duration / target
    if abs(r - 1) < 0.005: return p
    out = os.path.join(tempfile.gettempdir(), f"ep2fit_{os.path.basename(p)}_{target:.2f}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-af", f"atempo={r:.5f}", out], check=True); return out
mus = np.zeros((N, 2), np.float32)
for name, t0, db, target, off, maxlen in MUSIC:
    p = f"{STUDIO}/04_audio/music/{name}.wav"
    if target: p = fitted(p, target)
    x = load(p)
    if name == "m2_comedy" and maxlen and maxlen > len(x) / SR:  # loop with crossfade
        xf = int(1.5 * SR); y = x.copy()
        while len(y) / SR < maxlen:
            fade = np.linspace(0, 1, xf)[:, None]
            y[-xf:] = y[-xf:] * (1 - fade) + x[:xf] * fade; y = np.concatenate([y, x[xf:]])
        x = y
    x = x[int(max(0, off) * SR):]
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

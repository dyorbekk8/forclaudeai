"""EP03 mix: VO + ducked music + SFX cue sheet -> -14 LUFS master (EP02/06_edit/mix_master.wav)."""
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
for m in re.finditer(r"add\('([^']+)',\s*(.+?),\s*[AB]\.(\w+)(?:\([^)]*\))?(?:,\s*'(\w+)')?\);", open(f"{EP}/visuals/src/shots/list.ts").read()):
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


# ---------- synthesized one-offs ----------
def synth_horn(dur=1.3):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sign(np.sin(2 * np.pi * f * t + p)) for f, p in ((349, 0), (440, 1), (352, 2))) / 3
    x = np.convolve(x, np.ones(12) / 12, mode="same")
    env = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.15)
    y = (x * env * 0.5).astype(np.float32); return np.stack([y, y], 1)
def synth_alarm(dur=2.4):
    t = np.arange(int(dur * SR)) / SR
    gate = (np.sin(2 * np.pi * 8 * t) > 0).astype(np.float32) * ((t % 0.6) < 0.4)
    x = (np.sin(2 * np.pi * 2093 * t) * 0.6 + np.sin(2 * np.pi * 2637 * t) * 0.4) * gate
    y = (x * 0.35).astype(np.float32); return np.stack([y, y], 1)
def synth_beep(n=6, gap=0.75):
    out = np.zeros((int((n * gap + 0.3) * SR), 2), np.float32); t = np.arange(int(0.12 * SR)) / SR
    b = (np.sin(2 * np.pi * 1000 * t) * np.exp(-t * 10) * 0.4).astype(np.float32)
    for i in range(n): a = int(i * gap * SR); out[a:a + len(b)] += b[:, None]
    return out
def put(x, t, db): place(sfx_bus, x, t, 10 ** (db / 20)); cues.append({"t": round(t, 3), "synth": True})

# ---------- transitions ----------
for i, s in enumerate(SHOTS):
    tr = s["tr"]
    if tr in ("whip", "whipL"): sfx(rot("swish_whip", i, 2), s["at"] - 0.08, -13)
    elif tr == "zoom": sfx(rot("whoosh_fast", i), s["at"] - 0.18, -14)
    elif tr == "slowfade": sfx(rot("whoosh_slow", i, 2), s["at"] - 0.3, -22)
    elif tr == "glitch": sfx("glitch", s["at"] - 0.02, -15, max_len=0.5)

# ---------- day cards / HUD jumps ----------
for i, k in enumerate(["C1", "D1", "D3", "E1", "F1", "G1", "H1", "I1", "J1"]):
    t = A[k]; sfx("tv_static_off", t, -18, max_len=0.6); sfx(rot("thud_impact", i, 2), t + 0.15, -10); sfx("counter_roll", t + 0.3, -18, max_len=1.0)
for i in range(3): sfx(rot("tick", i), S("b02") + 0.1 + [0, 1.5, 2.8][i], -12)
sfx("riser_short", S("b02") + 3.4, -14)

# ---------- hand placed ----------
loop("crowd_murmur", 0, A["A6"], -34)
sfx("thud_impact_1", 0.55, -4); sfx("boing_comic", 0.6, -12)
sfx("reverse_swell", A["A2"] - 0.4, -14); sfx("swish_whip_1", A["A2"] + 0.5, -14)
sfx("heartbeat", A["A3"] + 0.2, -14); sfx("thud_impact_2", mid("a03", 0.35), -10); sfx("thud_impact_2", mid("a03", 0.35) + 1.0, -16)
sfx("sigh_air", A["A5"] + 0.4, -18)
sfx("riser", A["A6"] - 1.6, -16); sfx("stamp_thud", mid("a06", 0.6), -8)
for i in range(7): sfx(rot("pop_ui", i), A["A7"] + 0.4 + i * 0.22, -14 + i * 0.6)
sfx("pop_ui_1", mid("b01", 0.55), -14); sfx("pop_ui_2", mid("b01", 0.75), -14)
sfx("footsteps_walk", A["B1"] + 0.1, -22, max_len=6)
sfx("thud_impact_1", mid("b02", 0.72) + 0.4, -12)
sfx("chime_soft", A["B3"] + 0.6, -16)
sfx("magic_shimmer", A["B4a"] + 0.8, -18); sfx("ding_1", A["B4a"] + 2.4, -14)
for i in range(4): sfx(rot("blip", i), A["B4b"] + 0.4 + i * 0.25, -18)
sfx("thud_impact_2", A["B4b"] + (A["C1"] - A["B4b"]) * 0.7, -10)
loop("crowd_murmur", A["C2"], A["C4"], -36)
sfx("swish_whip_2", A["C2"] + 1.1, -10)
sfx("ding_2", A["C4"] + 1.2, -12); sfx("clock_tick", A["C4"] + 0.2, -24, max_len=2.0)
loop("room_tone_home", A["C4"], A["C7a"], -34)
sfx("swish_whip_1", A["C5"] + (A["C6"] - A["C5"]) * 0.7, -12)
sfx("thud_impact_2", A["C6"] + 0.02, -10); sfx("boing_comic", A["C6"] + 0.8, -16)
sfx("glass_break", A["C7a"] + 0.9, -20, max_len=0.5); sfx("pop_ui_3", A["C7a"] + 0.1, -12)
sfx("thud_impact_1", A["C7b"] + 0.65, -10); sfx("thud_impact_2", A["C7b"] + 0.95, -12); sfx("pop_ui_1", A["C7b"] + 0.1, -12)
sfx("record_scratch", A["C7c"] + 0.5, -14); sfx("pop_ui_2", A["C7c"] + 0.1, -12)
sfx("sparkle", A["C8"] + 1.0, -16); sfx("magic_shimmer", A["C8"] + 2.3, -18)
loop("crowd_murmur", A["D2"], A["D3"], -34)
for i in range(3): sfx("pop_ui_1", A["D2"] + 0.3 + i * 0.01, -16)
sfx("heartbeat", A["D4"] + 0.3, -12)
loop("room_tone_care", A["D5"], A["D7a"], -34)
sfx("riser", A["D7a"] - 2.2, -16)
put(synth_horn(1.4), A["D7a"], -8); sfx("whoosh_fast_1", A["D7a"] + 0.5, -8); sfx("thud_impact_1", A["D7a"] + 0.8, -10)
sfx("reverse_swell", A["D7b"] - 0.5, -16); sfx("sigh_air", A["D8"] + 0.3, -16)
put(synth_beep(10, 0.75), A["E2"], -26)
for x in (0.55, 0.7, 0.86): sfx("ding_1", mid("e02", x), -16)
sfx("clock_tick", A["E3"] + 0.2, -22, max_len=4)
sfx("thud_impact_2", mid("e04", 0.65), -8); sfx("reverse_swell", A["E4"] - 0.3, -18)
sfx("footsteps_walk", A["E5"] + (E("e05") - S("e05")) * 0.4, -18, max_len=2.0)
sfx("blip_1", A["E6"] + 0.2, -14); sfx("camera_shutter", A["E6"] + 0.8, -18)
sfx("riser", A["F2"] + 0.2, -18); sfx("sparkle", A["F2"] + 0.6, -16)
sfx("chime_soft", A["F3"] + 0.8, -18)
for i in range(8): sfx("phone_buzz", A["F4"] + 0.6 + i * 0.6, -24, max_len=0.25)
for i in range(5): sfx(rot("pop_ui", i), A["F4"] + 1.0 + i * 0.6, -18)
for i in range(6): sfx("camera_shutter", A["F5a"] + 0.2 + i * 0.55, -20)
loop("crowd_murmur", A["F5a"], A["F5b"], -30)
put(synth_alarm(2.4), A["G2"] + 0.1, -18)
sfx("tv_static_off", A["G3"] + 0.1, -18)
for i in range(12): sfx(rot("tick", i), A["G5"] + 0.3 + i * (E("g05") - S("g05")) * 0.55 / 12, -16)
sfx("footsteps_walk", A["G5"] + 0.2, -22, max_len=5)
loop("room_tone_home", A["G5"], A["H1"], -34)
sfx("heartbeat", A["H2"] + 0.4, -16)
sfx("footsteps_hall", A["H3"] + (E("h03") - S("h03")) * 0.55, -16, max_len=1.6); sfx("reverse_swell", A["H3"] + (E("h03") - S("h03")) * 0.75, -18)
sfx("chime_soft", A["H4"] + 0.6, -18)
loop("crowd_murmur", A["I2"], A["I3"], -28)
sfx("magic_shimmer", A["I2"] + 0.3, -16)
for i in range(24): sfx(rot("tick", i), A["I3"] + 0.2 + i * (A["I4"] - A["I3"]) * 0.8 / 24, -18)
loop("room_tone_home", A["I4"], A["J1"], -32)
sfx("sparkle", A["I4"] + (E("i04") - S("i04")) * 0.45, -14); sfx("magic_shimmer", A["I4"] + (E("i04") - S("i04")) * 0.5, -16)
sfx("sigh_air", A["I5"] + (E("i05") - S("i05")) * 0.7, -10)
loop("room_tone_home", A["J2"], A["J7"], -34)
sfx("door_open", A["J2"] + 0.2, -18); sfx("sparkle", A["J2"] + (E("j02") - S("j02")) * 0.7, -12); sfx("chime_soft", A["J2"] + (E("j02") - S("j02")) * 0.75, -16)
sfx("paper_rustle", A["J3"] + 0.2, -20)
sfx("magic_shimmer", A["J4"] + 0.5, -18)
sfx("clock_tick", A["J5"] + 0.3, -22, max_len=4)
sfx("stamp_thud", mid("j07", 0.6), -8)
sfx("paper_rustle", A["K1"] + (E("k01") - S("k01")) * 0.6, -12)
for i in range(10): sfx(rot("pop_ui", i), A["K2"] + 0.3 + i * 0.4, -20)
sfx("pencil_scribble", A["K3"] + 0.3, -18); sfx("pencil_scribble", A["K4"] + 0.4, -18, max_len=2.5)
for i in range(3): sfx("chime_soft", mid("k05", [0.28, 0.45, 0.6][i]), -18)
sfx("heartbeat", mid("k06", 0.55), -14); sfx("sparkle", mid("k06", 0.62), -14)
sfx("tv_static_off", A["L1"], -14); sfx("ding_2", mid("l01", 0.7), -12)
sfx("counter_roll", A["L3"] + 0.1, -14)
for i in range(6): sfx(rot("tick", i), E("l03") - 2.2 + i * 0.4, -12)
sfx("thud_impact_1", A["L4"] + 0.05, -6)
sfx("reverse_swell", A["L5"] - 0.4, -14); sfx("glitch", mid("l05", 0.55), -10)
sfx("boing_comic", A["L6"] + 0.5, -14); sfx("magic_shimmer", A["L6"] + 0.6, -16)
sfx("chime_soft", A["L7"] + 0.6, -16)

# ---------- music ----------
F1 = A["F1"]
MUSIC = [  # name, start, dB, target length (stretch) or None, offset, max length
    ("m1_curious", 0.0, -1.0, A["C1"] + 0.3, 0, None),
    ("m2_comedy", A["C1"], -2.5, None, 0, A["D1"] - A["C1"] + 0.4),
    ("m3_tension", A["D1"], -2.0, A["E1"] - A["D1"] + 0.6, 0, None),
    ("m7_cliffhanger", A["E1"], -2.0, None, 0, F1 - A["E1"] + 0.6),
    ("m5_reveal", F1, -2.0, None, 0, S("g04") - F1 + 1.0),
    ("m4_tender", S("h05") - 42.0, -1.5, None, 0, A["J1"] - (S("h05") - 42.0) + 0.6),
    ("m5_reveal", A["J1"], -1.0, None, max(0.0, 46.7 - (S("j06") - A["J1"])), S("j07") + 2 - A["J1"]),
    ("m7_cliffhanger", S("j07") + 1.5, -3.0, None, 0, A["K3"] - S("j07") - 1.0),
    ("m4_tender", A["K3"] - 0.2, -1.0, None, 45.5, A["L1"] - A["K3"] + 0.4),
    ("m6_resolve", S("k06"), -2.0, None, 0, A["L1"] - S("k06") + 1.0),
    ("m3_tension", A["L1"], -3.0, None, 0, S("l04") - A["L1"]),
    ("m7_cliffhanger", S("l05"), -1.0, None, 0, TL["duration"] - S("l05") + 0.5),
]
def fitted(p, target):
    r = sf.info(p).duration / target
    if abs(r - 1) < 0.005: return p
    out = os.path.join(tempfile.gettempdir(), f"ep3fit_{os.path.basename(p)}_{target:.2f}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-af", f"atempo={r:.5f}", out], check=True); return out
mus = np.zeros((N, 2), np.float32)
for name, t0, db, target, off, maxlen in MUSIC:
    p = f"{STUDIO}/04_audio/music/{name}.wav"
    if target: p = fitted(p, target)
    x = load(p)
    if maxlen and maxlen > len(x) / SR - off:  # loop with crossfade
        xf = int(1.5 * SR); y = x.copy()
        while len(y) / SR - off < maxlen:
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

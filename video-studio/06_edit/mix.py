"""Final audio mix: VO + music (ducked) + SFX cue sheet -> -14 LUFS master.

Reads:  03_voiceover/out/vo_full.wav, timeline.json
        05_visuals/src/shots/list.ts  (shot start rules + transitions)
        04_audio/sfx/*.wav, 04_audio/music/*.wav
Writes: 06_edit/mix_premaster.wav, 06_edit/cuesheet.json,
        05_visuals/public/audio/mix.wav (mastered, 48 kHz stereo)
"""
import json, os, re, subprocess
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TL = json.load(open(f"{ROOT}/03_voiceover/out/timeline.json"))
LINES = {l["id"]: l for l in TL["lines"]}
DUR = TL["duration"] + 0.6
S = lambda i: LINES[i]["start"]
E = lambda i: LINES[i]["end"]

# ---------- shot list (parsed from list.ts so edit + mix never drift) ----------
SHOTS = []
for m in re.finditer(r"add\('([^']+)',\s*([^,]+?),\s*(\w+)(?:,\s*'(\w+)')?\)", open(f"{ROOT}/05_visuals/src/shots/list.ts").read()):
    name, expr, comp, tr = m.groups()
    at = eval(expr, {"S": S, "E": E})
    SHOTS.append({"name": name, "at": at, "comp": comp, "tr": tr or "cut"})
SHOTS.sort(key=lambda s: s["at"])
SH = {s["comp"]: s["at"] for s in SHOTS}

# ---------- POPS (must match src/lib/ledger.ts) ----------
POPS = [(E("a03") - 0.42, False), (S("d04") + 0.02, False), (S("d06") - 0.05, False), (S("d08") - 0.05, False),
        (S("e17") + 0.02, True), (S("f02") + 0.02, True), (S("f03") + 0.02, True), (S("f04") + 0.02, True),
        (S("f05") + 0.02, True), (S("g01") + 0.02, False)]

def load(path):
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    if sr != SR:
        n = int(len(x) * SR / sr)
        x = np.stack([np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x[:, c]) for c in range(x.shape[1])], 1).astype(np.float32)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, 1)
    return x[:, :2]

N = int(DUR * SR)
sfx_bus = np.zeros((N, 2), np.float32)
cues = []

def place(bus, x, t, gain=1.0, fade_out=None, max_len=None):
    a = int(round(t * SR))
    if max_len:
        x = x[: int(max_len * SR)].copy()
        f = min(len(x), int(0.08 * SR))
        x[-f:] *= np.linspace(1, 0, f)[:, None]
    if a < 0:
        x = x[-a:]; a = 0
    b = min(len(bus), a + len(x))
    if b > a:
        bus[a:b] += x[: b - a] * gain

_cache = {}
def sfx(name, t, db=-8.0, max_len=None):
    p = f"{ROOT}/04_audio/sfx/{name}.wav"
    if not os.path.exists(p):
        print("MISSING sfx", name); return
    if p not in _cache:
        _cache[p] = load(p)
    place(sfx_bus, _cache[p], t, 10 ** (db / 20), max_len=max_len)
    cues.append({"t": round(t, 3), "sfx": name, "db": db})

def loop(name, t0, t1, db):
    p = f"{ROOT}/04_audio/sfx/{name}.wav"
    if not os.path.exists(p):
        print("MISSING loop", name); return
    x = load(p)
    n = int((t1 - t0) * SR)
    reps = int(np.ceil(n / len(x))) + 1
    y = np.concatenate([x] * reps)[:n].copy()
    f = min(n // 3, int(0.8 * SR))
    y[:f] *= np.linspace(0, 1, f)[:, None]; y[-f:] *= np.linspace(1, 0, f)[:, None]
    place(sfx_bus, y, t0, 10 ** (db / 20))
    cues.append({"t": round(t0, 3), "loop": name, "until": round(t1, 3), "db": db})

rot = lambda base, i, n=3: f"{base}_{i % n + 1}"

# ---------- automatic: transitions ----------
for i, s in enumerate(SHOTS):
    if s["tr"] in ("whip", "whipL"):
        sfx(rot("swish_whip", i, 2), s["at"] - 0.08, -13)
    elif s["tr"] == "zoom":
        sfx(rot("whoosh_fast", i), s["at"] - 0.18, -14)
    elif s["tr"] == "slowfade":
        sfx(rot("whoosh_slow", i, 2), s["at"] - 0.3, -22)

# ---------- automatic: lies / pops ----------
for i, (t, soft) in enumerate(POPS):
    sfx(rot("pop_age", i), t - 0.03, -9 if soft else -4)
    if not soft:
        sfx(rot("thud_impact", i, 2), t, -15)
sfx("riser_short", POPS[0][0] - 1.0, -14)

# ---------- ambience beds ----------
loop("room_tone_home", 0, SH["A6a"], -30)
loop("crowd_murmur", SH["C1"], SH["C9"], -33)
loop("crowd_murmur", SH["C11"], SH["D1"], -31)
loop("room_tone_home", SH["D2"], SH["D3"], -30)
loop("crowd_murmur", SH["D4"], SH["D5"], -33)
loop("room_tone_home", SH["D9"], SH["D10"], -30)
loop("room_tone_care", SH["E1"], SH["E5"], -30)
loop("room_tone_care", SH["E9"], SH["F1"], -30)
loop("room_tone_care", SH["G1"], SH["G5"], -30)
loop("room_tone_care", SH["G10"], SH["H1"], -31)
loop("crowd_murmur", SH["H1"], SH["H2"], -34)
loop("room_tone_care", SH["H4"], SH["I1"], -31)
loop("room_tone_home", SH["I1"], SH["I4"], -31)

# ---------- hand-placed cues ----------
A = SH
sfx("swallow_gulp", S("a04") + 1.1, -14)
sfx("sparkle", A["A4"] + 2.4, -12)
sfx("ding_1", S("a07") + 0.55, -12)
sfx("thud_impact_2", A["A6a"] + 0.25, -16); sfx("stamp_thud", A["A6a"] + 1.4, -10)
sfx("pop_ui_1", A["A6b"] + 0.15, -14); sfx("pop_ui_2", S("b02") + 1.05, -14); sfx("pop_ui_3", S("b02") + 1.9, -14)
sfx("whoosh_slow_1", A["A6c"] + 0.0, -16); sfx("stamp_thud", A["A6c"] + 0.6, -9)
sfx("whoosh_fast_2", S("b04") + 1.45, -12); sfx("thud_impact_1", S("b04") + 1.9, -8)
sfx("counter_roll", A["B2"] + 0.4, -16); sfx("pop_ui_2", S("b05") + 3.9, -13)
sfx("counter_roll", A["B3"] + 0.25, -13); sfx("ding_2", A["B3"] + 1.6, -13)
sfx("counter_roll", A["B4"] + 0.5, -17); sfx("counter_roll", A["B4"] + 1.6, -17); sfx("ding_1", A["B4"] + 2.85, -13)
for i in range(4): sfx(rot("pop_ui", i), A["B5"] + 0.2 + i * 0.15, -18)
for i in range(6): sfx(rot("blip", i), S("b09") + 0.3 + i * 0.12, -15)
sfx("pop_ui_1", S("b09") + 0.2, -13)
for i in range(10): sfx(rot("tick", i), A["B6"] + 1.6 + i * 0.16, -16)
sfx("pop_ui_3", A["B6"] + 1.3, -13)
sfx("chime_soft", A["B7"] + 0.25, -14); sfx("sparkle", S("b11") + 1.2, -14)
# comedy
sfx("school_bell", A["C1"] + 0.05, -22, max_len=1.2); sfx("footsteps_hall", A["C1"] + 0.1, -20)
sfx("sparkle", S("c01") + 1.5, -12); sfx("boing_comic", S("c01") + 1.5, -16)
sfx("magic_shimmer", A["C2"] + 0.1, -18)
sfx("record_scratch", E("c03") - 0.1, -10)
sfx("pop_ui_2", S("c04") + 2.4, -13)
sfx("stamp_thud", A["C5"] + 0.12, -7)
sfx("boing_comic", S("c07") + 1.0, -12)
sfx("sparkle", S("c08") + 1.8, -15); sfx("chime_soft", S("c08") + 1.9, -18)
for i, t in enumerate([0.1, 0.35, 0.6]): sfx(rot("blip", i), A["C9"] + t, -13)
sfx("stamp_thud", A["C9"] + 0.9, -13); sfx("stamp_thud", A["C10"] + 0.7, -13)
sfx("counter_roll", A["C11"] + 0.25, -15)
sfx("chime_soft", A["C12"] + 0.8, -13); sfx("magic_shimmer", A["C12"] + 0.3, -18)
# the slip
sfx("reverse_swell", A["D1"] - 0.9, -16)
for i in range(6): sfx(rot("pop_ui", i), A["D1"] + 0.5 + i * 0.45, -15)
sfx("thud_impact_2", S("d01") + 2.3, -12)
sfx("cookie_crunch", A["D2"] + 0.15, -12)
sfx("thud_impact_1", A["D4"] + 0.7, -14); sfx("whoosh_fast_1", A["D4"] + 0.5, -14)
sfx("phone_buzz", A["D5"] + 0.05, -16, max_len=0.8)
sfx("swallow_gulp", A["D6"] + 1.0, -14)
sfx("shaver_buzz", A["D7"] + 0.05, -17)
sfx("bus_brake", A["D8"] - 0.1, -17)
sfx("stamp_thud", S("d13") + 1.6, -10); sfx("heartbeat", S("d14") - 0.1, -12)
# grandpa
sfx("door_open", A["E1"] + 0.1, -18); sfx("footsteps_walk", A["E1"] + 0.2, -20, max_len=2.2)
sfx("camera_shutter", A["E2"] + 0.05, -16); sfx("paper_rustle", A["E2"] + 0.1, -18)
sfx("camera_shutter", S("e02") + 1.6, -16); sfx("paper_rustle", S("e02") + 1.65, -18)
for i in range(3): sfx(rot("pop_ui", i), A["E3"] + 0.6 + i * 0.3, -18)
sfx("chime_soft", A["E5"] + 0.3, -18)
for i, t in enumerate([0.4, 1.4]): sfx(rot("blip", i), A["E8"] + t, -16)
sfx("blip_3", S("e12") + 0.6, -16); sfx("chime_soft", S("e13") + 0.2, -18)
sfx("heartbeat", E("e15") + 0.15, -10)
sfx("sparkle", S("e17") + 0.1, -18)
# montage
for i in range(6): sfx("paper_rustle", A["F1"] + 0.6 + i * 0.5, -19, max_len=0.35)
sfx("stamp_thud", A["F1"] + 1.4, -14)
sfx("door_open", A["F4"] + 0.6, -20, max_len=0.8)
sfx("sparkle", A["F5"] + 0.3, -16); sfx("whoosh_slow_2", S("f06") - 0.1, -16); sfx("heartbeat", S("f06") + 0.3, -13)
# twist
sfx("sparkle", S("g03") + 1.3, -14)
sfx("thud_impact_1", S("g04") + 0.05, -6); sfx("riser", S("g04") - 2.0, -20)
sfx("glitch", A["G4"] + 0.05, -16); sfx("pop_ui_1", A["G4"] + 0.25, -14); sfx("pop_ui_2", A["G4"] + 0.6, -14)
sfx("reverse_swell", A["G5"] - 1.0, -15); sfx("magic_shimmer", A["G5"] + 0.1, -16)
sfx("thud_impact_2", A["G6"] + 0.9, -16)
for t in [A["G6"] + 2.0, A["G7"] + 1.4, A["G8"] + 1.0, A["G8"] + 1.6, A["G8"] + 2.1, A["G8"] + 2.5]:
    sfx("pop_age_2", t, -15)
sfx("counter_roll", A["G8"] + 0.4, -18)
sfx("magic_shimmer", A["G9"] + 1.9, -14)
sfx("chime_soft", S("g15") + 1.1, -14)
sfx("chime_soft", A["G13"] + 1.0, -16)
# resolution + cliffhanger
sfx("stamp_thud", S("h02") + 2.6, -8)
sfx("pop_ui_1", A["H3"] + 1.0, -12); sfx("sparkle", A["H3"] + 1.0, -15)
sfx("card_shuffle", A["H4"] + 0.2, -16); sfx("pop_ui_3", S("h05") + 0.6, -14)
sfx("glass_break", S("i01") + 2.96, -6)
sfx("sigh_air", A["I3"] + 0.9, -12)
sfx("riser", S("i06") - 2.2, -18); sfx("thud_impact_1", S("i06") - 0.2, -8); sfx("glitch", S("i06") - 0.15, -14)
sfx("pop_ui_1", A["I5"] + 0.3, -15); sfx("pop_ui_2", A["I5"] + 0.7, -15); sfx("blip_2", A["I5"] + 1.6, -16)
sfx("pop_ui_3", S("i08") - 0.2, -13); sfx("ding_2", S("i08") + 1.2, -12)

# ---------- music ----------
MUSIC = [("m1_curious", 0.0, -1.0), ("m2_comedy", A["C1"], -2.5), ("m3_tension", A["D1"], -2.0),
         ("m4_tender", E("e15") - 0.3 - 42.0, -1.5), ("m5_reveal", E("g18") + 0.3 - 56.0, -1.0),
         ("m6_resolve", A["H1"], -2.0), ("m7_cliffhanger", A["I1"], -1.0)]
mus = np.zeros((N, 2), np.float32)
for name, t0, db in MUSIC:
    p = f"{ROOT}/04_audio/music/{name}.wav"
    if not os.path.exists(p):
        print("MISSING music", name); continue
    x = load(p)
    f = int(0.6 * SR)
    x[:f] *= np.linspace(0, 1, f)[:, None] if t0 > 0.1 else 1
    place(mus, x, t0, 10 ** (db / 20))
    cues.append({"t": round(t0, 3), "music": name})

# ducking envelope from VO line activity
vo = load(f"{ROOT}/03_voiceover/out/vo_full.wav")
vo = np.pad(vo, ((0, max(0, N - len(vo))), (0, 0)))[:N]
act = np.zeros(N, np.float32)
for l in TL["lines"]:
    act[int(l["start"] * SR): int(l["end"] * SR)] = 1
# smooth: attack 120 ms, release 450 ms (one-pole, decimated for speed)
hop = 240
a_d = act[::hop]
env = np.zeros_like(a_d)
ka, kr = np.exp(-hop / (0.12 * SR)), np.exp(-hop / (0.45 * SR))
v = 0.0
for i, x in enumerate(a_d):
    k = ka if x > v else kr
    v = k * v + (1 - k) * x
    env[i] = v
env = np.interp(np.arange(N), np.arange(len(env)) * hop, env)
duck_db = -11.0
mgain = 10 ** ((duck_db * env) / 20) * 10 ** (-12 / 20)  # music sits ~12 dB under VO when idle
mus *= mgain[:, None]

mix = vo * 1.0 + mus + sfx_bus * 10 ** (-3 / 20)
os.makedirs(f"{ROOT}/06_edit", exist_ok=True)
sf.write(f"{ROOT}/06_edit/mix_premaster.wav", mix, SR, subtype="FLOAT")
json.dump({"shots": SHOTS, "cues": sorted(cues, key=lambda c: c["t"])}, open(f"{ROOT}/06_edit/cuesheet.json", "w"), indent=1)
print("premaster peak", float(np.abs(mix).max()), "cues", len(cues), "shots", len(SHOTS))

# ---------- master: two-pass loudnorm to -14 LUFS, -1 dBTP ----------
out = f"{ROOT}/05_visuals/public/audio/mix.wav"
os.makedirs(os.path.dirname(out), exist_ok=True)
pre = f"{ROOT}/06_edit/mix_premaster.wav"
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rindex("{"):])
af = (f"loudnorm=I=-14:TP=-1.2:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000")
subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", pre, "-af", af, "-ar", "48000", "-c:a", "pcm_s16le", out], check=True)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
summ = r.stderr[r.stderr.rindex("Summary"):]
print(" ".join(l.strip() for l in summ.splitlines() if l.strip().startswith(("I:", "LRA:", "Peak:"))))

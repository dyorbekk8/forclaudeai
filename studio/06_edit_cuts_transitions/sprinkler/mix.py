"""Offline mix from edl.json: VO + music beds (ducked) + SFX cues -> master -14 LUFS / -1 dBTP.
Writes 07_render/out/mix.wav. Levels follow 04_audio_sfx_music/mix_rules.json."""
import json, os, subprocess
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SR = 48000
edl = json.load(open(os.path.join(ROOT, '07_render', 'src', 'edl.json')))
FPS = edl['fps']
N = int((edl['total'] + 10) / FPS * SR)
db = lambda g: 10 ** (g / 20)

def load(path):
    x, sr = sf.read(path, always_2d=True)
    if sr != SR:
        x = resample_poly(x, SR, sr, axis=0)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    return x

def place(bus, x, t, gain=1.0):
    s = int(round(t * SR))
    if s < 0:
        x, s = x[-s:], 0
    e = min(len(bus), s + len(x))
    if e > s:
        bus[s:e] += x[: e - s] * gain

vo = np.zeros((N, 2))
for b in edl['beats']:
    place(vo, load(os.path.join(ROOT, b['vo'])), b['voStart'] / FPS)

# --- music -------------------------------------------------------------
lib = os.path.join(ROOT, '04_audio_sfx_music')
music = np.zeros((N, 2))
start = {b['id']: b['from'] / FPS for b in edl['beats']}
end_t = edl['total'] / FPS
o1, e1 = start['o1'], start['e1']
cold = load(os.path.join(lib, 'music', 'bed_cold_open.wav'))
main = load(os.path.join(lib, 'music', 'bed_main_loop.wav'))
outro = load(os.path.join(lib, 'music', 'bed_outro.wav'))
HIT = 23.3
cold_start = o1 - HIT

def loop_to(x, n):
    reps = int(np.ceil(n / len(x)))
    return np.tile(x, (reps, 1))[:n]

def fade(x, fi, fo):
    x = x.copy()
    a, b = int(fi * SR), int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x

# pre-roll under first cold-open lines (main bed, quiet) until the cold-open bed takes over
if cold_start > 0:
    pre = loop_to(main, int((cold_start + 1.5) * SR))
    place(music, fade(pre, 0.8, 1.5), 0, db(-12))
    place(music, fade(cold, 1.5, 0.0)[: int((HIT + 0.8) * SR)], cold_start, db(-9))
else:
    place(music, fade(cold[int(-cold_start * SR):], 0.5, 0)[: int((o1 + 0.8) * SR)], 0, db(-9))
# main bed from the first item until the closing reframe
body = loop_to(main, int((e1 - o1 + 1.5) * SR))
place(music, fade(body, 0.4, 1.5), o1, db(-9))
place(music, fade(outro[: int((end_t - e1) * SR)], 1.5, 2.5), e1, db(-10))

# ducking: music sits 5 dB lower while VO is present (attack 80 ms, release 450 ms)
env = np.abs(vo[:, 0])
hop = 480
frames = env[: len(env) // hop * hop].reshape(-1, hop).max(axis=1)
active = (frames > db(-40)).astype(float)
g = np.zeros_like(active)
a_c, r_c = np.exp(-1 / (0.08 * SR / hop)), np.exp(-1 / (0.45 * SR / hop))
for i in range(len(active)):
    prev = g[i - 1] if i else 0
    c = a_c if active[i] > prev else r_c
    g[i] = c * prev + (1 - c) * active[i]
gain = np.repeat(db(-5 * g), hop)
gain = np.pad(gain, (0, N - len(gain)), constant_values=1)
music *= gain[:, None]

# --- sfx ---------------------------------------------------------------
sfx = np.zeros((N, 2))
cache = {}
for b in edl.get('shots', edl['beats']):
    for c in b['cues']:
        if c['file'] not in cache:
            cache[c['file']] = load(os.path.join(lib, 'library', c['file'] + '.wav'))
        place(sfx, cache[c['file']], c['frame'] / FPS, db(c['gain']))

# VO is -18 LUFS per clip; sfx/music gains in mix_rules assume VO at -16 -> lift VO 2 dB
mixd = vo * db(2) + music + sfx
tmp = os.path.join(ROOT, '07_render', 'out', 'mix_pre.wav')
os.makedirs(os.path.dirname(tmp), exist_ok=True)
sf.write(tmp, mixd.astype(np.float32), SR, subtype='FLOAT')
sf.write(os.path.join(ROOT, '07_render', 'out', 'stem_vo.wav'), (vo * db(2)).astype(np.float32), SR, subtype='FLOAT')

# two-pass loudnorm to -14 LUFS / -1 dBTP
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'],
                    capture_output=True, text=True).stderr
m = json.loads(p1[p1.rindex('{'):])
af = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
out = os.path.join(ROOT, '07_render', 'out', 'mix.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af + ',aresample=48000', '-c:a', 'pcm_s24le', out], check=True)
os.remove(tmp)
print('input', m['input_i'], 'LUFS', m['input_tp'], 'dBTP ->', out)

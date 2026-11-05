"""Edit for the three ammo Shorts (1080x1920). Run inside /opt/tts/.venv (needs faster-whisper).
Word timings come from Whisper on the final VO, so captions and events land exactly on the spoken word.
Writes 07_render/src/short/ammo_edl.json (all shorts, for Remotion) and
07_render/src/short/ammo_<k>_edl.json (per short, for mix.py)."""
import json, os, re
import soundfile as sf
from faster_whisper import WhisperModel

FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VO = os.path.join(ROOT, '03_voiceover', 'ammo_shorts', 'final')
OUT = os.path.join(ROOT, '07_render', 'src', 'short')
asr = WhisperModel('small.en', device='cpu', compute_type='int8')
import numpy as np
def load16(path):
    x, sr = sf.read(path, dtype='float32')
    if x.ndim > 1: x = x.mean(axis=1)
    return np.interp(np.arange(0, len(x), sr / 16000), np.arange(len(x)), x).astype(np.float32)

# scene, event first-words, sfx [file, 'f:N' | 'ev:i(+/-N)', gain]
PLAN = {
 's1': {'a': ('live', [], [['whoosh_hard_1', 'f:0', -12], ['sub_hit_1', 'f:2', -12], ['marker_scribble', 'f:6', -18]]),
        'b': ('two', [], [['pop_1', 'f:6', -14], ['marker_scribble', 'f:8', -18], ['tick_2', 'f:14', -14]]),
        'c': ('fire', ['exploded'], [['heat_rise', 'f:0', -18], ['sub_hit_1', 'ev:0', -10], ['glass_shatter_1', 'ev:0', -16]]),
        'd': ('bars', [], [['tick_1', 'f:4', -16], ['riser_2s', 'f:10', -24], ['pop_2', 'f:48', -16]]),
        'e': ('coated', [], [['whoosh_soft_2', 'f:0', -16], ['stamp_thud_1', 'f:12', -10]])},
 's2': {'a': ('blue', [], [['whoosh_hard_1', 'f:0', -12], ['sub_hit_2', 'f:2', -12]]),
        'b': ('harmless', [], [['tick_2', 'f:8', -14]]),
        'c': ('puff', ['puff'], [['whoosh_soft_1', 'f:0', -16], ['sub_hit_2', 'ev:0', -12], ['whoosh_soft_4', 'ev:0', -16]]),
        'd': ('a10', ['bird', 'dropped'], [['whoosh_hard_2', 'f:0', -16], ['glass_shatter_2', 'ev:0', -16], ['pop_1', 'ev:1', -14]]),
        'e': ('rules', ["don't", 'call'], [['pop_2', 'ev:0', -14], ['stamp_thud_2', 'ev:1', -10]])},
 's3': {'a': ('gray', [], [['whoosh_hard_1', 'f:0', -12], ['sub_hit_1', 'f:2', -12], ['marker_scribble', 'f:6', -18]]),
        'b': ('meaning', ['dark'], [['pop_1', 'f:2', -14], ['marker_scribble', 'ev:0', -18]]),
        'c': ('binary', [], [['tick_1', 'f:4', -16], ['stamp_thud_2', 'f:20', -12]]),
        'd': ('ab', [], [['whoosh_soft_2', 'f:30', -16], ['sub_hit_1', 'f:56', -14]]),
        'e': ('date', [], [['paper_slide', 'f:0', -18], ['stamp_thud_1', 'f:24', -10]])},
}
TITLES = {k: json.load(open(os.path.join(ROOT, '02_scripts', 'ammo_shorts', f'{k}.json')))['title'] for k in PLAN}

allshorts = {}
for k, lines in PLAN.items():
    beats, shots, t = [], [], 0
    ids = list(lines)
    for n, i in enumerate(ids):
        lid = f'{k}{i}'
        path = os.path.join(VO, f'{lid}.wav')
        info = sf.info(path)
        vo = info.frames / info.samplerate
        lead = 0.0 if n == 0 else 0.05
        tail = 0.8 if n == len(ids) - 1 else 0.18
        dur = round((lead + vo + tail) * FPS)
        segs, _ = asr.transcribe(load16(path), language='en', word_timestamps=True)
        words = [dict(w=w.word.strip(), f=round((lead + w.start) * FPS)) for s in segs for w in s.words]
        scene, evw, sfx = lines[i]
        ev = []
        for e in evw:
            hit = next((w['f'] for w in words if re.sub(r'[^a-z\']', '', w['w'].lower()).startswith(e)), None)
            assert hit is not None, (lid, e, [w['w'] for w in words])
            ev.append(hit)
        cues = []
        for fn, when, g in sfx:
            kind, expr = when.split(':', 1)
            if kind == 'f':
                off = int(expr)
            else:
                m = re.match(r'(\d+)([+-]\d+)?', expr)
                off = ev[int(m.group(1))] + (int(m.group(2)) if m.group(2) else 0)
            cues.append(dict(file=fn, frame=t + off, gain=g))
        beats.append(dict(id=lid, **{'from': t}, dur=dur, voStart=t + round(lead * FPS), vo=os.path.relpath(path, ROOT), voDur=round(vo, 3)))
        shots.append(dict(id=lid, beat=lid, scene=scene, props=dict(ev=ev), words=words, **{'from': t}, dur=dur, cues=cues))
        t += dur
    json.dump(dict(fps=FPS, total=t, beats=beats, shots=shots), open(os.path.join(OUT, f'ammo_{k}_edl.json'), 'w'), indent=1)
    allshorts[k] = dict(total=t, title=TITLES[k], shots=shots)
    print(k, round(t / FPS, 1), 's', TITLES[k])
json.dump(allshorts, open(os.path.join(OUT, 'ammo_edl.json'), 'w'), indent=1)

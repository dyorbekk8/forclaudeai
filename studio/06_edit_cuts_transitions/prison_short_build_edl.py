"""Shorts edit (1080x1920): one shot per VO line, word-level caption timing, SFX cues.
Writes 07_render/src/short/edl.json (same schema mix.py reads: beats + shots[].cues)."""
import json, os
import soundfile as sf
FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
S = json.load(open(os.path.join(ROOT, '02_scripts', 'prison_short', 'script.json')))
VO = os.path.join(ROOT, '03_voiceover', 'prison_short', 'final')
SCENE = {'h1': 'Hook', 'h2': 'NoEscapes', 'h3': 'LadderQ', 'h4': 'Admin', 'h5': 'Ninety', 'h6': 'Payoff'}
SFX = {
    'h1': [['whoosh_hard_1', 0, -12], ['sub_hit_1', 2, -10]],
    'h2': [['stamp_thud_1', 10, -8]],
    'h3': [['pop_1', 4, -14], ['pop_2', 8, -14], ['pop_3', 12, -14], ['pop_1', 16, -14], ['tick_2', 40, -14]],
    'h4': [['whoosh_soft_2', 0, -14], ['stamp_thud_2', 14, -8], ['sub_hit_2', 14, -12]],
    'h5': [['whoosh_soft_3', 0, -14], ['counter_tick_loop', 4, -20]],
    'h6': [['marker_scribble', 6, -16], ['stamp_thud_1', 30, -12]],
}
beats, shots, t = [], [], 0
for l in S['lines']:
    info = sf.info(os.path.join(VO, f"{l['id']}.wav"))
    vo = info.frames / info.samplerate
    lead = 0.0 if l['id'] == 'h1' else 0.05
    tail = {'h3': 0.3, 'h6': 0.7}.get(l['id'], 0.12)
    dur = round((lead + vo + tail) * FPS)
    vs = t + round(lead * FPS)
    words, pos, text = [], 0, l['text']
    for w in text.split():
        i = text.index(w, pos)
        words.append(dict(w=w, f=round(i / len(text) * vo * FPS) + round(lead * FPS)))
        pos = i + len(w)
    beats.append(dict(id=l['id'], **{'from': t}, dur=dur, voStart=vs, vo=os.path.relpath(os.path.join(VO, f"{l['id']}.wav"), ROOT), voDur=round(vo, 3)))
    shots.append(dict(id=l['id'], beat=l['id'], scene=SCENE[l['id']], props=dict(words=words), **{'from': t}, dur=dur,
                      cues=[dict(file=f, frame=t + o, gain=g) for f, o, g in SFX[l['id']]]))
    t += dur
os.makedirs(os.path.join(ROOT, '07_render', 'src', 'short'), exist_ok=True)
json.dump(dict(fps=FPS, total=t, beats=beats, shots=shots), open(os.path.join(ROOT, '07_render', 'src', 'short', 'edl.json'), 'w'), indent=1)
print(len(shots), 'shots', round(t / FPS, 2), 's')

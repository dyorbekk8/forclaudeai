"""Edit for the rebuilt aircraft-letters video (channel template). Run inside /opt/tts/.venv.
Per item: line a (the name) = grid + zoom into the tile; middle lines = item card with three
numbered features revealed on spoken words; last line (if 3+ lines) = chapter summary.
Captions = exact script sentences, timed by Whisper word timestamps."""
import json, os, re
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SC = json.load(open(os.path.join(ROOT, '02_scripts', 'nuclear', 'script.json')))
VO = os.path.join(ROOT, '03_voiceover', 'nuclear', 'final')
asr = WhisperModel('small.en', device='cpu', compute_type='int8')

def load16(path):
    x, sr = sf.read(path, dtype='float32')
    if x.ndim > 1: x = x.mean(axis=1)
    return np.interp(np.arange(0, len(x), sr / 16000), np.arange(len(x)), x).astype(np.float32)

TEXT = {
 'za': ('PINNACLE', 'THE FLAG ON TOP OF THE LADDER'),
 'zb': ('PINNACLE → NMCC', 'NUCFLASH · BROKEN ARROW · EMPTY QUIVER'),
}

lines = SC['lines']
beats, shots, caps, t = [], [], [], 0
groups = []  # consecutive lines by item
for l in lines:
    if groups and groups[-1][0] == l['item'] and l['item'] >= 0:
        groups[-1][1].append(l)
    else:
        groups.append((l['item'], [l]))

def timeline(l, t0):
    """Return (dur_frames, sentence_starts_abs, word_times_abs(list), sentences)."""
    path = os.path.join(VO, f"{l['id']}.wav")
    vo = sf.info(path).frames / sf.info(path).samplerate
    segs, _ = asr.transcribe(load16(path), language='en', word_timestamps=True)
    ws = [w for s in segs for w in s.words]
    sents = [s for s in re.split(r'(?<=[.?!])\s+', l['text']) if s]
    words = l['text'].split()
    def wtime(k):
        if not ws: return k * 0.3
        j = min(len(ws) - 1, round(k * (len(ws) - 1) / max(1, len(words) - 1)))
        return ws[j].start
    starts, k = [], 0
    for s in sents:
        starts.append(t0 + round((0.08 + wtime(k)) * FPS))
        k += len(s.split())
    wt = [t0 + round((0.08 + wtime(i)) * FPS) for i in range(len(words))]
    return vo, starts, wt, sents, path

for gi, (item, ls) in enumerate(groups):
    item_lines = []
    for n, l in enumerate(ls):
        vo, starts, wt, sents, path = timeline(l, t)
        nxt_item = groups[gi + 1][0] if gi + 1 < len(groups) else None
        last_in_group = n == len(ls) - 1
        tail = (0.55 if last_in_group else 0.3)
        if l['id'] == 'zd': tail = 3.0
        dur = round((0.08 + vo + tail) * FPS)
        for i, s in enumerate(sents):
            end = starts[i + 1] if i + 1 < len(sents) else t + dur - round(tail * FPS * 0.4)
            caps.append(dict(**{'from': starts[i]}, to=end, text=s))
        beats.append(dict(id=l['id'], **{'from': t}, dur=dur, voStart=t + 3, vo=os.path.relpath(path, ROOT), voDur=round(vo, 3)))
        item_lines.append(dict(l=l, start=t, dur=dur, wt=wt, sstarts=starts, sents=sents))
        t += dur
    if item >= 0:
        a = item_lines[0]
        shots.append(dict(id=f'{item}g', kind='grid', item=item, **{'from': a['start']}, dur=a['dur'], feat=[],
                          cues=[dict(file='whoosh_soft_%d' % (1 + item % 4), frame=a['start'] + max(2, a['dur'] - 26), gain=-17), dict(file='pop_%d' % (1 + item % 3), frame=a['start'] + a['dur'] - 4, gain=-19)]))
        # one visual decision per spoken sentence (script views)
        sent = []  # (start, end, text)
        for x in item_lines[1:]:
            sts = list(x['sstarts'])
            sts[0] = x['start']
            sts = [min(max(st, x['start']), x['start'] + x['dur'] - 1) for st in sts]
            for st, tx in zip(sts, x['sents']):
                sent.append([st, None, tx])
        end_all = item_lines[-1]['start'] + item_lines[-1]['dur']
        for i in range(len(sent)):
            sent[i][1] = sent[i + 1][0] if i + 1 < len(sent) else end_all
        sent = [tuple(x) for x in sent]
        views = SC['items'][item]['views']
        assert len(views) == len(sent), (item, len(views), len(sent))
        reveal = {}  # feature -> absolute frame
        segs = []
        for (st, en, tx), v in zip(sent, views):
            kind = 'summary' if v == 'S' else ('event:' + v[2:] if isinstance(v, str) and v.startswith('E:') else 'card')
            if kind == 'card':
                for j, fk in enumerate(v):
                    reveal[fk] = st + 3 + round(j * 0.33 * (en - st))
            if segs and segs[-1]['kind'] == kind:
                segs[-1]['end'] = en
                segs[-1]['n'] += 1
                if segs[-1]['n'] == 2: segs[-1]['second'] = st
            else:
                segs.append(dict(kind=kind, start=st, end=en, n=1))
        for k, sg in enumerate(segs):
            dur = sg['end'] - sg['start']
            if sg['kind'] == 'card':
                feat = [(reveal[f] - sg['start']) if f in reveal and reveal[f] < sg['end'] else 99999 for f in ('f1', 'f2', 'f3')]
                feat = [(-100 if (f in reveal and reveal[f] < sg['start']) else x) for f, x in zip(('f1', 'f2', 'f3'), feat)]
                cues = [dict(file='paper_slide', frame=sg['start'] + 2, gain=-21)] + [dict(file='pop_%d' % (1 + j), frame=sg['start'] + x, gain=-18) for j, x in enumerate(feat) if 0 <= x < dur]
            elif sg['kind'].startswith('event:'):
                feat = []
                stamp_at = (sg['second'] - sg['start']) if 'second' in sg else min(dur - 20, 45)
                cues = [dict(file='paper_slide', frame=sg['start'] + 2, gain=-19), dict(file='tick_1', frame=sg['start'] + 10, gain=-18), dict(file='stamp_thud_1', frame=sg['start'] + stamp_at + 4, gain=-14)]
                shots.append(dict(id=f'{item}e{k}', kind='event', ev=sg['kind'][6:], stampAt=stamp_at, item=item, **{'from': sg['start']}, dur=dur, feat=feat, cues=cues))
                continue
            else:
                feat = []
                cues = [dict(file='whoosh_soft_2', frame=sg['start'], gain=-20), dict(file='counter_tick_loop', frame=sg['start'] + 4, gain=-26), dict(file='tick_2', frame=sg['start'] + 30, gain=-18)]
            shots.append(dict(id=f'{item}{sg["kind"][0]}{k}', kind=sg['kind'], item=item, **{'from': sg['start']}, dur=dur, feat=feat, cues=cues))
    else:
        for x in item_lines:
            lid = x['l']['id']
            if lid == 'zc':
                shots.append(dict(id=lid, kind='recap', item=-1, **{'from': x['start']}, dur=x['dur'], feat=[], cues=[dict(file='tick_%d' % (1 + j % 3), frame=x['start'] + 10 + j * 40, gain=-19) for j in range(6)]))
            elif lid == 'zd':
                shots.append(dict(id=lid, kind='outro', item=-1, **{'from': x['start']}, dur=x['dur'], feat=[], cues=[dict(file='pop_1', frame=x['start'] + 6, gain=-18)]))
            else:
                ti, bo = TEXT[lid]
                shots.append(dict(id=lid, kind='text', item=-1, title=ti, body=bo, **{'from': x['start']}, dur=x['dur'], feat=[], cues=[dict(file='paper_slide', frame=x['start'] + 2, gain=-20), dict(file='tick_1', frame=x['start'] + 12, gain=-18)]))

for a, b in zip(shots, shots[1:]):
    assert b['from'] == a['from'] + a['dur'], ('gap', a['id'], b['id'], a['from'] + a['dur'], b['from'])
out = dict(fps=FPS, total=t, items=SC['items'], beats=beats, shots=shots, caps=caps)
json.dump(out, open(os.path.join(ROOT, '07_render', 'src', 'nuclear', 'edl.json'), 'w'), indent=1)
lens = sorted(s['dur'] / FPS for s in shots)
print(f"{len(shots)} shots, {t / FPS:.1f}s, median {lens[len(lens) // 2]:.1f}s, max {lens[-1]:.1f}s, captions {len(caps)}")

"""Builds captions.srt, description.txt (chapters + sources) from edl.json, vo_lines.json and facts.json."""
import json, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
edl = json.load(open(os.path.join(ROOT, '07_render', 'src', 'edl.json')))
lines = {b['id']: b['text'] for b in json.load(open(os.path.join(ROOT, '02_scripts', 'sprinkler', 'vo_lines.json')))}
facts = json.load(open(os.path.join(ROOT, '02_scripts', 'sprinkler', 'facts.json')))
FPS = edl['fps']

def ts(t):
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f'{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'

def chunks(text, maxlen=84):
    out = []
    for sent in re.split(r'(?<=[.?!])\s+', text.strip()):
        words, cur = sent.split(), ''
        for w in words:
            if len(cur) + len(w) + 1 > maxlen and cur:
                out.append(cur)
                cur = w
            else:
                cur = f'{cur} {w}'.strip()
        if cur:
            out.append(cur)
    return out

srt, n = [], 1
for b in edl['beats']:
    parts = chunks(lines[b['id']])
    total = sum(len(p) for p in parts)
    t = b['voStart'] / FPS
    for p in parts:
        d = b['voDur'] * len(p) / total
        srt.append(f'{n}\n{ts(t)} --> {ts(t + d - 0.04)}\n{p}\n')
        n += 1
        t += d
open(os.path.join(HERE, 'captions.srt'), 'w').write('\n'.join(srt))

chap = [('0:00', 'A one- or two-sprinkler fire')]
names = {'o1': 'Orange', 'r1': 'Red', 'y1': 'Yellow', 'g1': 'Green', 'b1': 'Blue', 'p1': 'Purple', 'k1': 'Black',
         't1': 'The thin bulb', 'f1': 'No bulb at all', 'n1': 'The number that matters'}
for b in edl['beats']:
    if b['id'] in names:
        s = int(b['from'] / FPS)
        chap.append((f'{s // 60}:{s % 60:02d}', names[b['id']]))

used = set()
for line in open(os.path.join(ROOT, '02_scripts', 'sprinkler', 'script.md')):
    used.update(re.findall(r'\b([A-Z]\d{2})\b', line))
src = []
for f in facts:
    if f['id'] in used and f['confidence'] in ('high', 'medium'):
        for s in f.get('sources', [])[:2]:
            if s.get('url') and s['url'] not in src:
                src.append(s['url'])

desc = f"""Every fire sprinkler above you is waiting for one number — and that number is written in color. Here's what every glass bulb color means, why the bubble inside is there on purpose, and the one thing movies always get wrong.

CHAPTERS
""" + '\n'.join(f'{a} {b}' for a, b in chap) + """

Ratings follow the NFPA 13 temperature classification (U.S.). Exact ratings and colors can vary by manufacturer; the rating stamped on the sprinkler is authoritative.

SOURCES
""" + '\n'.join(src) + '\n'
open(os.path.join(HERE, 'description.txt'), 'w').write(desc)
print(n - 1, 'captions;', len(chap), 'chapters;', len(src), 'sources')

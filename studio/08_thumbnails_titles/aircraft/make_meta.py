"""captions.srt + description.txt + titles.txt for the aircraft designation video."""
import json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
edl = json.load(open(os.path.join(ROOT, '07_render', 'src', 'aircraft', 'edl.json')))
sc = json.load(open(os.path.join(ROOT, '02_scripts', 'aircraft', 'script.json')))
text = {l['id']: l['text'] for l in sc['lines']}
ts = lambda t: f'{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round((t % 1) * 1000)) % 1000:03d}'
srt, n = [], 1
for b in edl['beats']:
    parts = [p for p in re.split(r'(?<=[.?!])\s+', text[b['id']]) if p]
    tot = sum(len(p) for p in parts); t = b['voStart'] / 30
    for p in parts:
        d = b['voDur'] * len(p) / tot
        srt.append(f'{n}\n{ts(t)} --> {ts(t + d - 0.04)}\n{p}\n'); n += 1; t += d
open(os.path.join(HERE, 'captions.srt'), 'w').write('\n'.join(srt))
names = {'h1': 'The F-35 should have been the F-24', 'h6': 'The six parts of a name', 'm1': 'Basic mission', 'd1': 'Modified mission', 'v1': 'Vehicle type', 'p1': 'Status prefix', 'n1': 'Numbers and series letters', 'x1': 'The rule breakers', 'k1': 'Missile names', 'f1': 'Decoding the HH-60G', 'e1': 'Read any name'}
ch = [f"{int(b['from'] / 30) // 60}:{int(b['from'] / 30) % 60:02d} {names[b['id']]}" for b in edl['beats'] if b['id'] in names]
ch[0] = '0:00 ' + ch[0].split(' ', 1)[1]
desc = ("The F-35 should have been called the F-24. Every letter and number in a U.S. military aircraft name follows a system that dates to 1962 — basic mission, modified mission, vehicle type, status prefix, design number and series letter — plus the rule-breakers like the SR-71, F-117, B-21 and F/A-18, and how missile names like AIM-9 and RGM-84D work.\n\nCHAPTERS\n"
        + '\n'.join(ch) + "\n\nBased on the 1962 Tri-Service designation system and the 1963 missile designation system (now maintained under DoDI 4120.15 / DAFI 16-401 / AR 70-50 / NAVAIRINST 13100.16).\n\nSOURCES\n" + '\n'.join(dict.fromkeys(sc['sources'].values())) + '\n')
open(os.path.join(HERE, 'description.txt'), 'w').write(desc)
open(os.path.join(HERE, 'titles.txt'), 'w').write("A (use): Every Letter in a Military Aircraft Name Explained\nB: Why the F-35 Should Have Been the F-24\nC: How Military Aircraft Names Actually Work\n")
print(n - 1, 'captions;', len(ch), 'chapters')

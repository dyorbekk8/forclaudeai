"""captions.srt + description.txt for the armor video from edl.json and script.json."""
import json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
edl = json.load(open(os.path.join(ROOT, '07_render', 'src', 'armor', 'edl.json')))
sc = json.load(open(os.path.join(ROOT, '02_scripts', 'armor', 'script.json')))
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
names = {'s1a': 'Level IIA', 's2a': 'Level II', 's3a': 'Level IIIA', 's4a': 'The 44 mm rule', 's5a': 'Level III', 's6a': 'Level III+', 's7a': 'RF2', 's8a': 'Level IV', 'e1': 'The new names'}
ch = ['0:00 Every level of body armor'] + [f"{int(b['from'] / 30) // 60}:{int(b['from'] / 30) % 60:02d} {names[b['id']]}" for b in edl['beats'] if b['id'] in names]
desc = ("From a vest that stops a pistol to a plate that stops an armor-piercing rifle round — every U.S. body armor level, the clay test that decides them all, the new NIJ names (HG1, HG2, RF1, RF2, RF3), and the popular level that was never official.\n\nCHAPTERS\n"
        + '\n'.join(ch) + "\n\nLevels follow NIJ Standard 0101.06 and the newer NIJ 0101.07 / 0123.00. Always check the certification label on real armor.\n\nSOURCES\n" + '\n'.join(sc['sources'].values()) + '\n')
open(os.path.join(HERE, 'description.txt'), 'w').write(desc)
open(os.path.join(HERE, 'titles.txt'), 'w').write("A (use): How Body Armor Levels Actually Work\nB: Every Body Armor Level Explained\nC: How Bulletproof Vest Levels Actually Work\n")
print(n - 1, 'captions;', len(ch), 'chapters')

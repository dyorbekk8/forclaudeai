"""captions.srt + description.txt for the armor video from edl.json and script.json."""
import json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
edl = json.load(open(os.path.join(ROOT, '07_render', 'src', 'prison', 'edl.json')))
sc = json.load(open(os.path.join(ROOT, '02_scripts', 'prison', 'script.json')))
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
names = {'s1a': 'The score', 's1e': 'Quick test', 's2a': 'Minimum security', 's3a': 'Low security', 's4a': 'Medium security', 's5a': 'High security', 's6a': 'Administrative', 's7a': 'ADX Florence', 'e1': 'What the system is really about'}
ch = ['0:00 Every federal prison security level'] + [f"{int(b['from'] / 30) // 60}:{int(b['from'] / 30) % 60:02d} {names[b['id']]}" for b in edl['beats'] if b['id'] in names]
desc = ("From a camp with no fence to a cell where you spend 23 hours a day alone — every U.S. federal prison security level, the points system that decides where you go, and why the most secure prison in America isn't rated \"high security.\"\n\nCHAPTERS\n"
        + '\n'.join(ch) + "\n\nCovers the U.S. Federal Bureau of Prisons. State prison systems use their own classifications.\n\nSOURCES\n" + '\n'.join(sc['sources'].values()) + '\n')
open(os.path.join(HERE, 'description.txt'), 'w').write(desc)
open(os.path.join(HERE, 'titles.txt'), 'w').write("A (use): How Prison Security Levels Actually Work\nB: Every Federal Prison Security Level Explained\nC: How America Decides Which Prison You Go To\n")
print(n - 1, 'captions;', len(ch), 'chapters')

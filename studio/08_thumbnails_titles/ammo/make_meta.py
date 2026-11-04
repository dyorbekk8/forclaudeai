"""captions.srt + description.txt + titles.txt for the ammo color video."""
import json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
edl = json.load(open(os.path.join(ROOT, '07_render', 'src', 'ammo', 'edl.json')))
sc = json.load(open(os.path.join(ROOT, '02_scripts', 'ammo', 'script.json')))
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
names = {'o1': 'Olive drab: the base coat', 'y1': 'Yellow: high explosive', 'b1': 'Brown: low explosive', 'u1': 'Light blue: practice', 'g1': 'Light green: smoke', 'w1': 'White: illumination', 'k1': 'Black: armor defeating', 'r1': 'Gray: chemical', 'e2': 'The whole code'}
ch = [f"{int(b['from'] / 30) // 60}:{int(b['from'] / 30) % 60:02d} {names[b['id']]}" for b in edl['beats'] if b['id'] in names]
desc = ("Almost every American bomb and shell is olive drab — and that color means almost nothing. The real message is the stripe. Every color in the U.S. military ammunition color code (MIL-STD-709), from the yellow band on a live Mk 82 to the broken green band that marks a binary nerve agent.\n\nCHAPTERS\n"
        + '\n'.join(ch) + "\n\nSimplified for explanation; based on public U.S. military standards and manuals listed below. Colors fade and other countries use different codes — never treat any found ordnance as safe. If you find something, leave it and call 911.\n\nSOURCES\n" + '\n'.join(sc['sources'].values()) + '\n')
open(os.path.join(HERE, 'description.txt'), 'w').write(desc)
open(os.path.join(HERE, 'titles.txt'), 'w').write("A (use): Every Military Ammo Color Explained\nB: Every Bomb Color Explained\nC: What the Stripes on Military Bombs Actually Mean\n")
print(n - 1, 'captions;', len(ch), 'chapters')

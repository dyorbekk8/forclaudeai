"""captions.srt + description.txt for the armor video from edl.json and script.json."""
import json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
edl = json.load(open(os.path.join(ROOT, '07_render', 'src', 'potus', 'edl.json')))
sc = json.load(open(os.path.join(ROOT, '02_scripts', 'potus', 'script.json')))
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
names = {'s1a': 'Layer 1: The sky', 's2a': 'Layer 2: The advance', 's3a': 'Layer 3: The rooftops', 's4a': 'Layer 4: The checkpoint', 's5a': 'Layer 5: The motorcade', 's6a': 'Layer 6: The Beast', 's7a': 'Layer 7: The shift', 's8a': 'Layer 8: The last layer', 'e1': 'The whole system'}
ch = ['0:00 Eight layers around the president'] + [f"{int(b['from'] / 30) // 60}:{int(b['from'] / 30) % 60:02d} {names[b['id']]}" for b in edl['beats'] if b['id'] in names]
desc = ("Sixty nautical miles of closed sky, counter snipers on the rooftops, an eight-ton armored limo — and at the very center, sometimes, a coin flip. Every layer of U.S. presidential protection, from the outermost ring to the last one.\n\nCHAPTERS\n"
        + '\n'.join(ch) + "\n\nPublic information only; many Secret Service specifics are classified and the figures shown are as reported by the sources below.\n\nSOURCES\n" + '\n'.join(sc['sources'].values()) + '\n')
cred = json.load(open(os.path.join(ROOT, 'agents', 'image-sourcer', 'potus', 'credits.json')))
used = sorted({sh['props']['src'][:-4] for sh in edl['shots'] if 'src' in sh['props']} | {sh['props']['bg'][:-4] for sh in edl['shots'] if sh['props'].get('bg')})
desc += '\nPHOTOS (Wikimedia Commons)\n' + '\n'.join(f"{c['author'][:80]} · {c['license']} · {c['source_page_url']}" for c in cred if c['slug'] in used) + '\n'
open(os.path.join(HERE, 'description.txt'), 'w').write(desc)
open(os.path.join(HERE, 'titles.txt'), 'w').write("A (use): How Presidential Protection Actually Works\nB: Every Layer Protecting the President Explained\nC: Why the President Is Almost Impossible to Reach\n")
print(n - 1, 'captions;', len(ch), 'chapters')

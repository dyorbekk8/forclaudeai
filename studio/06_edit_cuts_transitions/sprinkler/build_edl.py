"""Single source of truth for the edit: scene per beat, timing, SFX cues.

Writes 07_render/src/edl.json (read by Remotion and by mix.py).
VO source: 03_voiceover/sprinkler/final/<id>.wav (processed ElevenLabs) or scratch/<id>.wav.
SFX timing: "f:N" = N frames after beat start, "p:X" = fraction X of beat, "p:X+N" = fraction then +N frames,
"e:N" = N frames before beat end.  These fractions mirror constants in the scene components.
"""
import json, os, sys
import soundfile as sf

FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VO_DIR = os.path.join(ROOT, '03_voiceover', 'sprinkler')
SRC = sys.argv[1] if len(sys.argv) > 1 else 'final'

HERO = {'o1': 0, 'r1': 1, 'y1': 2, 'g1': 3, 'b1': 4, 'p1': 5, 'k1': 6, 't1': 7, 'f1': 8}
RED, PURPLE = '#D9262B', '#7A3FB8'

def pops(n, start=4, step=4, gain=-20):
    return [[f'pop_{i % 3 + 1}', f'f:{start + i * step}', gain] for i in range(n)]

SPEC = [
    ('c1', 'StoryCard', dict(date='NOV 21, 1980', place='LAS VEGAS, NEVADA', icon='hotel',
        lines=[dict(big='MGM GRAND', at=0.12), dict(big='85', small='PEOPLE KILLED', at=0.6, color='#D7262E', count=dict(to=85))]),
        [['alarm_bell_distant', 'f:0', -28], ['paper_slide', 'f:4', -20], ['tick_1', 'p:0.12', -20], ['sub_hit_1', 'p:0.6', -11]]),
    ('c2', 'MoneyBars', {}, [['whoosh_soft_1', 'f:0', -18], ['tick_2', 'p:0.45', -18], ['marker_scribble', 'p:0.45+16', -22]]),
    ('c3', 'Quote', dict(text='With sprinklers, it would have been a one- or two-sprinkler fire and we never would have heard about it.',
        highlight='a one- or two-sprinkler fire', who='David Demers', whoSub='CO-AUTHOR OF THE NFPA REPORT ON THE MGM GRAND FIRE'),
        [['paper_slide', 'f:2', -20], ['marker_scribble', 'p:0.35', -20]]),
    ('c4', 'GridIntro', {}, pops(9) + [['pop_1', 'f:46', -17], ['whoosh_soft_2', 'e:10', -18]]),
    ('o1', 'Hero', {}, []),
    ('o2', 'BulbMacro', dict(item='orange', e0=0, e1=0.85, t0=70, t1=130), [['heat_rise', 'p:0.4', -19]]),
    ('o3', 'Burst', dict(item='orange'), [['heat_rise', 'p:0.32-78', -15], ['glass_shatter_1', 'p:0.32', -7], ['water_spray_burst', 'p:0.32+4', -16]]),
    ('o4', 'Gauge', dict(item='orange', maxCeil=100, rating=135, lo=50, hi=175), [['whoosh_soft_3', 'f:2', -20], ['tick_1', 'f:46', -18]]),
    ('r1', 'Hero', {}, []),
    ('r2', 'StoryCard', dict(date='OCT 20, 2017', place='DUMFRIES, VIRGINIA', icon='hotel', icon2='hanger',
        lines=[dict(big='HOLIDAY INN', at=0.4), dict(big='UNIFORM', small='hung on the sprinkler', at=0.78)]),
        [['paper_slide', 'f:4', -20], ['tick_2', 'p:0.4', -20], ['tick_3', 'p:0.78', -20]]),
    ('r3', 'Hanger', {}, [['glass_shatter_2', 'f:16', -7], ['water_spray_burst', 'f:20', -16], ['tick_1', 'p:0.3', -20], ['tick_2', 'p:0.52', -20], ['tick_3', 'p:0.74', -18]]),
    ('y1', 'Hero', {}, []),
    ('y2', 'SkylightAttic', dict(item='yellow'), [['whoosh_soft_1', 'f:0', -19], ['whoosh_soft_2', 'p:0.42', -19], ['marker_scribble', 'p:0.75', -22]]),
    ('y3', 'Gauge', dict(item='yellow', maxCeil=150, rating=175, lo=75, hi=225, markers=[dict(t=135, color='#F07A1A', label='ORANGE', crossed=True)]),
        [['whoosh_soft_3', 'f:2', -20], ['tick_1', 'f:46', -18], ['click_1', 'f:60', -18]]),
    ('g1', 'Hero', {}, []),
    ('g2', 'ClassTable', {}, [['tick_1', 'f:6', -20], ['tick_2', 'f:6+step', -20], ['tick_3', 'f:6+2step', -20], ['tick_1', 'f:6+3step', -20], ['tick_2', 'f:6+4step', -20]]),
    ('g3', 'Boil', {}, [['heat_rise', 'p:0.4667+6-78', -19], ['glass_shatter_3', 'p:0.4667+6', -9]]),
    ('b1', 'Hero', {}, []),
    ('b2', 'Heater', {}, [['whoosh_soft_4', 'f:0', -20], ['pop_2', 'f:12', -18], ['click_2', 'p:0.62', -18]]),
    ('cta', 'CTA', {}, [['pop_1', 'f:0', -18], ['click_1', 'p:0.35', -14], ['click_2', 'p:0.55', -14]]),
    ('p1', 'Hero', dict(note='also called "mauve"', noteAt=50), [['marker_scribble', 'f:62', -22]]),
    ('p2', 'FrameCode', {}, [['whoosh_soft_2', 'f:0', -20], ['marker_scribble', 'p:0.45', -20]]),
    ('p3', 'Compare', dict(left=dict(liquid=RED, title='RED BULB', sub='ORDINARY · 155°F'), right=dict(liquid=PURPLE, frame='#D7262E', title='RED FRAME', sub='EXTRA HIGH CLASS'),
        mid='≠', midAt=0.45, verdict='SAME COLOR · OPPOSITE ENDS', verdictAt=0.72),
        [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18], ['click_1', 'p:0.45', -16], ['stamp_thud_2', 'p:0.72', -14]]),
    ('k1', 'Hero', {}, []),
    ('k2', 'RangeBar', {}, [['whoosh_soft_3', 'f:8', -20], ['tick_2', 'f:44', -18]]),
    ('k3', 'IconRow', {}, pops(3, 4, 8, -19) + [['stamp_thud_1', 'p:0.66', -14]]),
    ('t1', 'Hero', {}, []),
    ('t2', 'Compare', dict(left=dict(liquid=RED, title='STANDARD RESPONSE', sub='BULB ≈ 5 mm', dim='5 mm'),
        right=dict(liquid=RED, response='quick', title='QUICK RESPONSE', sub='BULB ≈ 3 mm', dim='3 mm'), mid='vs', midAt=0.2),
        [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18]]),
    ('t3', 'Race', {}, [['heat_rise', 'f:0', -21], ['glass_shatter_1', 'p:0.3', -9], ['water_spray_burst', 'p:0.3+4', -19], ['glass_shatter_2', 'p:0.58', -9], ['water_spray_burst', 'p:0.58+4', -19]]),
    ('f1', 'Hero', dict(note='solder melts → link falls apart', noteAt=60), [['marker_scribble', 'f:72', -22]]),
    ('f2', 'Patent', {}, [['paper_slide', 'f:0', -18], ['marker_scribble', 'f:8', -22], ['tick_1', 'p:0.62', -20]]),
    ('f3', 'SaveMoney', {}, [['marker_scribble', 'p:0.4', -18], ['stamp_thud_1', 'p:0.62', -9]]),
    ('n1', 'GridOne', {}, [['whoosh_hard_1', 'f:0', -16], ['sub_hit_2', 'f:8', -12]]),
    ('n2', 'CeilingRow', dict(mode='mythReal'), [['water_spray_burst', 'f:17', -14], ['stamp_thud_2', 'f:36', -12], ['whoosh_soft_4', 'p:0.42', -18],
        ['glass_shatter_3', 'p:0.42+26', -8], ['water_spray_burst', 'p:0.42+29', -16]]),
    ('n3', 'StatRings', {}, [['tick_1', 'p:0.22', -18], ['tick_2', 'p:0.66', -18]]),
    ('n4', 'DeathBars', {}, [['whoosh_soft_1', 'f:4', -20], ['whoosh_soft_2', 'f:22', -20], ['tick_3', 'f:36', -18]]),
    ('n5', 'StoryCard', dict(date='FEB 20, 2003', place='WEST WARWICK, RHODE ISLAND', icon='club',
        lines=[dict(big='100', small='PEOPLE KILLED', at=0.16, count=dict(to=100)), dict(big='NO SPRINKLERS', at=0.4, color='#D7262E'),
               dict(big='SAME YEAR', small='required in clubs for 150+', at=0.74)]),
        [['paper_slide', 'f:4', -20], ['tick_1', 'p:0.16', -18], ['tick_2', 'p:0.4', -18], ['tick_3', 'p:0.74', -18]]),
    ('n6', 'CeilingRow', dict(mode='deluge'), [['water_spray_burst', 'f:17', -13], ['click_1', 'p:0.5', -16]]),
    ('e1', 'CeilingRow', dict(mode='real', caption='A ONE- OR TWO-SPRINKLER FIRE'), [['glass_shatter_2', 'f:26', -9], ['water_spray_burst', 'f:29', -17]]),
    ('e2', 'Outro', {}, [['stamp_thud_1', 'f:20', -10]]),
]

ITEM_STARTS = {'o1', 'r1', 'y1', 'g1', 'b1', 'cta', 'p1', 'k1', 't1', 'f1', 'n1', 'e1'}

def vo_path(i):
    p = os.path.join(VO_DIR, SRC, f'{i}.wav')
    if not os.path.exists(p):
        p = os.path.join(VO_DIR, 'scratch', f'{i}.wav')
    return p

beats, t = [], 0
for idx, (bid, scene, props, sfx) in enumerate(SPEC):
    p = vo_path(bid)
    info = sf.info(p)
    vo = info.frames / info.samplerate
    lead = 0.5 if scene == 'Hero' else (0.3 if scene in ('GridOne', 'CeilingRow') else 0.12)
    nxt = SPEC[idx + 1][0] if idx + 1 < len(SPEC) else None
    tail = 0.55 if (nxt in ITEM_STARTS or nxt is None) else 0.3
    if scene in ('Burst', 'Hanger', 'Race', 'CeilingRow'):
        tail += 0.4
    if bid == 'e2':
        tail = 3.0
    dur = round((lead + vo + tail) * FPS)
    if bid == 'c4':
        dur = max(dur, 70)
    props = dict(props)
    if scene == 'Hero':
        props['idx'] = HERO[bid]
    beats.append(dict(id=bid, scene=scene, props=props, from_=t, dur=dur, voStart=t + round(lead * FPS), vo=os.path.relpath(p, ROOT), voDur=round(vo, 3), sfx=sfx))
    t += dur

for b in beats:
    b['from'] = b.pop('from_')

def resolve(spec, b):
    kind, expr = spec.split(':', 1)
    step = max(6, round((b['dur'] * 0.7) / 5))
    expr = expr.replace('2step', str(2 * step)).replace('3step', str(3 * step)).replace('4step', str(4 * step)).replace('step', str(step))
    if kind == 'f':
        return int(eval(expr))
    if kind == 'e':
        return b['dur'] - int(expr)
    if kind == 'p':
        import re
        m = re.match(r'([0-9.]+)(.*)', expr)
        return round(float(m.group(1)) * b['dur']) + (int(eval(m.group(2))) if m.group(2) else 0)
    raise ValueError(spec)

for b in beats:
    b['cues'] = [dict(file=s[0], frame=b['from'] + resolve(s[1], b), gain=s[2]) for s in b.pop('sfx')]

out = dict(fps=FPS, total=t, beats=beats)
dst = os.path.join(ROOT, '07_render', 'src', 'edl.json')
json.dump(out, open(dst, 'w'), indent=1)
print(f'{len(beats)} beats, {t} frames = {t / FPS:.1f} s  ({SRC}) -> {dst}')

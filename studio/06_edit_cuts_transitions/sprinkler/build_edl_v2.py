"""v2 edit: no cold-open intro, visual cut every ~2-4 s inside each VO line, real photos.

Each beat = one VO clip; each beat has `cuts`: (at, scene, props, sfx).
  at  = 0 for the first cut, or a phrase from the VO text: the cut lands just before that phrase
        (time estimated from character position — TTS pace is near-uniform).
  sfx = [file, when, gain_db], when = "f:N" frames after the cut starts, "p:X" fraction of the cut,
        "p:X+N"/"p:X-N" fraction then +/- frames.
Writes 07_render/src/edl.json with flat `shots` (Remotion) and `beats` (VO for mix.py).
"""
import json, os, re, sys
import soundfile as sf

FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VO = os.path.join(ROOT, '03_voiceover', 'sprinkler', sys.argv[1] if len(sys.argv) > 1 else 'final_v2')
LINES = {b['id']: b['text'] for b in json.load(open(os.path.join(ROOT, '02_scripts', 'sprinkler', 'vo_lines_v2.json')))}
CREDITS = {}
cp = os.path.join(ROOT, '05_visual_system', 'photos', 'sprinkler', 'credits.json')
if os.path.exists(cp):
    for c in json.load(open(cp)):
        CREDITS[c['slug']] = c

RED, PURPLE = '#D9262B', '#7A3FB8'
HERO = {'o1': 0, 'r1': 1, 'y1': 2, 'g1': 3, 'b1': 4, 'p1': 5, 'k1': 6, 't1': 7, 'f1': 8}

def photo(slug, caption=None, focus=(50, 50), side=None, sfx=None):
    """Photo cut; silently skipped by build if the slug was not collected."""
    return ('PHOTO', slug, caption, focus, side, sfx or [['whoosh_soft_2', 'f:0', -21]])

W = lambda *lines, red=(), stamp=None, icon=None, size=150: ('Words', dict(lines=list(lines), red=list(red), stamp=stamp, icon=icon, size=size))

SPEC = {
    'h1': [(0, 'TopicOpen', {}, [['whoosh_hard_1', 'f:0', -16]] + [[f'pop_{i % 3 + 1}', f'f:{i * 2 + 6}', -22] for i in range(7)]),
           ('every color', 'GridIntro', {}, [[f'pop_{i % 3 + 1}', f'f:{4 + i * 4}', -21] for i in range(9)] + [['pop_1', 'f:46', -18]])],
    'o1': [(0, 'Hero', {}, [['whoosh_soft_1', 'f:0', -19], ['tick_1', 'f:20', -20]])],
    'o2': [(0, 'MacroCallout', dict(item='orange', target='bulb', labels=['GLASS', 'LIQUID', 'ONE BUBBLE']), [['tick_1', 'f:4', -20], ['tick_2', 'p:0.28+4', -20], ['tick_3', 'p:0.55+4', -18]]),
           ('As the air', 'BulbMacro', dict(item='orange', e0=0, e1=0.9, t0=70, t1=133), [['heat_rise', 'p:0.3', -19]])],
    'o3': [(0, 'Burst', dict(item='orange'), [['heat_rise', 'p:0.32-78', -15], ['glass_shatter_1', 'p:0.32', -7], ['water_spray_burst', 'p:0.32+4', -16]])],
    'o4': [(0, 'Gauge', dict(item='orange', maxCeil=100, rating=135, lo=50, hi=175), [['whoosh_soft_3', 'f:0', -20], ['tick_1', 'f:46', -18]]),
           ('a hot day', 'Versus', dict(a=dict(icon='sun', label='HOT DAY'), b=dict(icon='fire', label='FIRE'), sign='≠', aBad=False, verdict='only one of them reaches 135°F'), [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18]]),
           ("The bubble isn't", 'Words', dict(lines=['THE BUBBLE', "ISN'T A FLAW"], stamp='IT\'S THE FUSE'), [['stamp_thud_2', 'p:0.6', -14]])],
    'r1': [(0, 'Hero', {}, [['whoosh_soft_2', 'f:0', -19], ['tick_2', 'f:20', -20]]),
           ('The same ordinary', photo('ceiling_office', 'OFFICES & HOMES'))],
    'r2': [(0, 'MacroCallout', dict(item='red', target='bulb', labels=['NOT ONLY HEAT'], crack=True), [['click_1', 'p:0.3', -16]]),
           ('On October 20', 'StoryCard', dict(date='OCT 20, 2017', place='DUMFRIES, VIRGINIA', icon='hotel', icon2='hanger',
              lines=[dict(big='HOLIDAY INN', at=0.3), dict(big='UNIFORM', small='hung on the sprinkler', at=0.68)]),
            [['paper_slide', 'f:2', -20], ['tick_2', 'p:0.3', -20], ['tick_3', 'p:0.68', -20]])],
    'r3': [(0, 'Hanger', {}, [['glass_shatter_2', 'f:16', -7], ['water_spray_burst', 'f:20', -16], ['tick_1', 'p:0.3', -20], ['tick_2', 'p:0.52', -20], ['tick_3', 'p:0.74', -18]]),
           ("The glass can't", 'Versus', dict(a=dict(icon='fire', label='FIRE'), b=dict(icon='hanger', label='COAT HANGER'), sign='=', verdict='to the glass, they feel the same'), [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18]])],
    'y1': [(0, 'Hero', {}, [['whoosh_soft_3', 'f:0', -19], ['tick_3', 'f:20', -20]])],
    'y2': [(0, 'Words', dict(lines=['CEILINGS THAT', 'GET HOT', 'ON THEIR OWN'], red=[1], icon='sun'), [['whoosh_soft_4', 'f:0', -20]]),
           ('Under a skylight', 'SkylightAttic', dict(item='yellow'), [['whoosh_soft_1', 'f:0', -20], ['whoosh_soft_2', 'p:0.42', -20], ['marker_scribble', 'p:0.75', -22]])],
    'y3': [(0, 'Gauge', dict(item='yellow', maxCeil=150, rating=175, lo=75, hi=225), [['whoosh_soft_3', 'f:0', -20], ['tick_1', 'f:46', -18]]),
           ('In a room like that', 'SunBurst', {}, [['heat_rise', 'p:0.45-78', -18], ['glass_shatter_3', 'p:0.45', -9], ['water_spray_burst', 'p:0.45+4', -17], ['stamp_thud_1', 'p:0.45+10', -14]])],
    'g1': [(0, 'Hero', {}, [['whoosh_soft_4', 'f:0', -19], ['tick_1', 'f:20', -20]])],
    'g2': [(0, 'ClassTable', {}, [['tick_1', 'f:6', -20], ['tick_2', 'p:0.14+6', -20], ['tick_3', 'p:0.28+6', -20], ['tick_1', 'p:0.42+6', -20], ['tick_2', 'p:0.56+6', -20]])],
    'g3': [(0, 'Words', dict(lines=['200°F', 'IS LOWER THAN', 'YOU THINK'], red=[0], size=170), [['whoosh_soft_1', 'f:0', -20]]),
           ('A green bulb', 'Boil', {}, [['heat_rise', 'p:0.4667+6-78', -19], ['glass_shatter_3', 'p:0.4667+6', -9]])],
    'b1': [(0, 'Hero', {}, [['whoosh_soft_1', 'f:0', -19], ['tick_2', 'f:20', -20]])],
    'b2': [(0, 'Gauge', dict(item='blue', maxCeil=225, rating=286, lo=100, hi=325), [['whoosh_soft_3', 'f:0', -20], ['tick_1', 'f:46', -18]]),
           ('like the space', photo('unit_heater', 'INDUSTRIAL UNIT HEATER')),
           ('where hot air', 'Heater', {}, [['whoosh_soft_4', 'f:0', -20], ['pop_2', 'f:12', -18], ['click_2', 'p:0.62', -18]])],
    'cta': [(0, 'CTA', {}, [['pop_1', 'f:0', -18], ['click_1', 'p:0.35', -14], ['click_2', 'p:0.55', -14]])],
    'p1': [(0, 'Hero', dict(note='also called "mauve"', noteAt=40), [['whoosh_soft_2', 'f:0', -19], ['marker_scribble', 'f:52', -22]])],
    'p2': [(0, 'Words', dict(lines=["THIS IS WHERE", 'IT GETS', 'CONFUSING'], red=[2]), [['whoosh_soft_3', 'f:0', -20]]),
           ("Glass bulbs aren't", 'FrameCode', {}, [['whoosh_soft_2', 'f:0', -20], ['marker_scribble', 'p:0.45', -20]])],
    'p3': [(0, 'Compare', dict(left=dict(liquid=RED, title='RED BULB', sub='ORDINARY · 155°F'), right=dict(liquid=PURPLE, frame='#D7262E', title='RED FRAME', sub='EXTRA HIGH CLASS'),
              mid='≠', midAt=0.45, verdict='SAME COLOR · OPPOSITE ENDS', verdictAt=0.72),
            [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18], ['click_1', 'p:0.45', -16], ['stamp_thud_2', 'p:0.72', -14]])],
    'k1': [(0, 'Hero', {}, [['whoosh_soft_3', 'f:0', -19], ['tick_3', 'f:20', -20]])],
    'k2': [(0, 'RangeBar', {}, [['whoosh_soft_3', 'f:8', -20], ['tick_2', 'f:44', -18]])],
    'k3': [(0, 'IconRow', {}, [[f'pop_{i + 1}', f'f:{4 + i * 8}', -19] for i in range(3)]),
           ("Black isn't", 'Words', dict(lines=['NOT A WARNING', 'ABOUT THE SPRINKLER'], stamp='ABOUT THE ROOM', size=130), [['stamp_thud_1', 'p:0.6', -12]])],
    't1': [(0, 'Hero', {}, [['whoosh_soft_4', 'f:0', -19], ['tick_1', 'f:20', -20]]),
           ('Two red bulbs', 'Compare', dict(left=dict(liquid=RED, title='155°F', sub='RED'), right=dict(liquid=RED, response='quick', title='155°F', sub='RED'), mid='=', midAt=0.15), [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18]])],
    't2': [(0, 'Compare', dict(left=dict(liquid=RED, title='STANDARD RESPONSE', sub='BULB ≈ 5 mm', dim='5 mm'),
              right=dict(liquid=RED, response='quick', title='QUICK RESPONSE', sub='BULB ≈ 3 mm', dim='3 mm'), mid='vs', midAt=0.2), [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18]])],
    't3': [(0, 'Race', {}, [['heat_rise', 'f:0', -21], ['glass_shatter_1', 'p:0.3', -9], ['water_spray_burst', 'p:0.3+4', -19], ['glass_shatter_2', 'p:0.58', -9], ['water_spray_burst', 'p:0.58+4', -19]]),
           ("That's why quick", 'Words', dict(lines=['QUICK RESPONSE', 'OFFICES · SCHOOLS'], red=[0], icon='school', size=120), [['whoosh_soft_1', 'f:0', -20]]),
           ('The color tells', 'Words', dict(lines=['COLOR = WHEN', 'THICKNESS = HOW FAST'], red=[1], size=130), [['tick_1', 'f:0', -18], ['tick_2', 'p:0.5', -18]])],
    'f1': [(0, 'Hero', dict(note='solder melts → link falls apart', noteAt=45), [['whoosh_soft_2', 'f:0', -19], ['marker_scribble', 'f:56', -22]]),
           ('Some sprinklers hold', photo('fusible_link', 'FUSIBLE LINK'))],
    'f2': [(0, 'Patent', {}, [['paper_slide', 'f:0', -18], ['tick_1', 'p:0.62', -20]]),
           ('He built it', photo('old_sprinkler', 'PROTECT THE FACTORY'))],
    'f3': [(0, 'SaveMoney', {}, [['marker_scribble', 'p:0.4', -18], ['stamp_thud_1', 'p:0.62', -9]])],
    'n1': [(0, 'GridOne', {}, [['whoosh_hard_1', 'f:0', -16], ['sub_hit_2', 'f:8', -12]])],
    'n2': [(0, 'CeilingRow', dict(mode='mythReal'), [['water_spray_burst', 'f:17', -14], ['stamp_thud_2', 'f:36', -12], ['whoosh_soft_4', 'p:0.42', -18],
            ['glass_shatter_3', 'p:0.42+26', -8], ['water_spray_burst', 'p:0.42+29', -16]])],
    'm1': [(0, photo('mgm_grand', 'LAS VEGAS · 1980')),
           ('85 people', 'StoryCard', dict(date='NOV 21, 1980', place='LAS VEGAS, NEVADA', icon='hotel', lines=[dict(big='MGM GRAND', at=0.05), dict(big='85', small='PEOPLE KILLED', at=0.3, color='#D7262E', count=dict(to=85))]),
            [['paper_slide', 'f:0', -20], ['sub_hit_1', 'p:0.3', -12]])],
    'm2': [(0, 'MoneyBars', {}, [['whoosh_soft_1', 'f:0', -18], ['tick_2', 'p:0.45', -18], ['marker_scribble', 'p:0.45+16', -22]])],
    'm3': [(0, 'Quote', dict(text='With sprinklers, it would have been a one- or two-sprinkler fire and we never would have heard about it.',
              highlight='a one- or two-sprinkler fire', who='David Demers', whoSub='CO-AUTHOR OF THE NFPA REPORT ON THE MGM GRAND FIRE'),
            [['paper_slide', 'f:2', -20], ['marker_scribble', 'p:0.35', -20]])],
    'n3': [(0, 'StatRings', {}, [['tick_1', 'p:0.22', -18], ['tick_2', 'p:0.66', -18]])],
    'n4': [(0, 'DeathBars', {}, [['whoosh_soft_1', 'f:4', -20], ['whoosh_soft_2', 'f:22', -20], ['tick_3', 'f:36', -18]])],
    'n5': [(0, photo('station_memorial', 'WEST WARWICK, RHODE ISLAND')),
           ('100 people', 'StoryCard', dict(date='FEB 20, 2003', place='WEST WARWICK, RHODE ISLAND', icon='club',
              lines=[dict(big='100', small='PEOPLE KILLED', at=0.05, count=dict(to=100)), dict(big='NO SPRINKLERS', at=0.35, color='#D7262E'), dict(big='SAME YEAR', small='required in clubs for 150+', at=0.7)]),
            [['paper_slide', 'f:0', -20], ['tick_1', 'p:0.05', -18], ['tick_2', 'p:0.35', -18], ['tick_3', 'p:0.7', -18]])],
    'n6': [(0, 'CeilingRow', dict(mode='deluge'), [['water_spray_burst', 'f:17', -13], ['click_1', 'p:0.5', -16]]),
           ('Everywhere else', 'Words', dict(lines=['EVERYWHERE ELSE,', 'THE MOVIES', 'ARE WRONG'], red=[2]), [['stamp_thud_2', 'p:0.5', -16]])],
    'e1': [(0, 'CeilingRow', dict(mode='real', caption='A ONE- OR TWO-SPRINKLER FIRE'), [['glass_shatter_2', 'f:26', -9], ['water_spray_burst', 'f:29', -17]])],
    'e2': [(0, 'Outro', {}, [['stamp_thud_1', 'f:20', -10]])],
}


# --- denser cuts (v2.1): every long line gets a new visual at its key phrases ---
WS = [['whoosh_soft_1', 'f:0', -21]]
def words(*lines, red=(), stamp=None, icon=None, size=150, sfx=None):
    return ('Words', dict(lines=list(lines), red=list(red), stamp=stamp, icon=icon, size=size), sfx or WS)
def macro(item, labels, target='bulb', sfx=None, **kw):
    return ('MacroCallout', dict(item=item, target=target, labels=labels, **kw), sfx or [['tick_1', 'f:4', -20], ['tick_2', 'p:0.3', -20], ['tick_3', 'p:0.55', -20]])
def cut(at, c):
    return (at, *c)


SPEC['o4'] = [cut(0, words('ORDINARY ROOMS', 'STAY UNDER 100°F', red=[1], icon='office', size=120)),
              ('The rating sits', 'Gauge', dict(item='orange', maxCeil=100, rating=135, lo=50, hi=175), [['whoosh_soft_3', 'f:0', -20], ['tick_1', 'f:46', -18]])] + SPEC['o4'][1:]
SPEC['r2'] = SPEC['r2'] + [cut('hung his uniform', words('HUNG HIS UNIFORM', 'ON THE SPRINKLER', red=[1], icon='hanger', size=120))]
SPEC['y2'] = [SPEC['y2'][0], ('Under a skylight', photo('skylight', 'UNDER A SKYLIGHT')), ('or in an attic', photo('attic', 'IN AN ATTIC')),
              ('the air at the ceiling', 'SkylightAttic', dict(item='yellow'), [['whoosh_soft_1', 'f:0', -20], ['marker_scribble', 'p:0.75', -22]])]
SPEC['g1'] = SPEC['g1'] + [('The same class', 'Compare', dict(left=dict(liquid='#F2C61F', title='YELLOW 175°F', sub='INTERMEDIATE'),
              right=dict(liquid='#2E9E4F', title='GREEN 200°F', sub='INTERMEDIATE'), mid='+25', midAt=0.35), [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18]])]
SPEC['b1'] = SPEC['b1'] + [cut('This is the high', words('200°F → 286°F', 'A BIG JUMP', red=[1]))]
SPEC['b2'] = [cut(0, words('BUILT FOR', 'HOTTER CEILINGS', red=[1])),
              ('up to 225', 'Gauge', dict(item='blue', maxCeil=225, rating=286, lo=100, hi=325), [['whoosh_soft_3', 'f:0', -20], ['tick_1', 'f:46', -18]]),
              SPEC['b2'][1], SPEC['b2'][2],
              cut('In a space like that', macro('red', ['RED · 155°F', 'WOULD OPEN', 'WITH NO FIRE']))]
SPEC['p1'] = SPEC['p1'] + [cut('Some manufacturers', words('PURPLE', '= MAUVE', red=[1], size=170))]
SPEC['p2'] = [SPEC['p2'][0], cut("Glass bulbs aren't", macro('purple', ['NOT ONLY', 'THE BULB', 'THE FRAME TOO'], target='frame')),
              ('On many sprinklers', 'FrameCode', {}, [['whoosh_soft_2', 'f:0', -20], ['marker_scribble', 'p:0.45', -20]])]
SPEC['p3'] = [(0, 'Compare', dict(left=dict(liquid=RED, title='RED BULB', sub='ORDINARY · 155°F'), right=dict(liquid=PURPLE, frame='#D7262E', title='RED FRAME', sub='EXTRA HIGH CLASS'),
              mid='≠', midAt=0.55), [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18], ['click_1', 'p:0.55', -16]]),
              cut('Same color', words('SAME COLOR', 'OPPOSITE ENDS', red=[1], sfx=[['stamp_thud_2', 'f:0', -16]]))]
SPEC['k2'] = [cut(0, words('VERY EXTRA HIGH', '+ ULTRA HIGH', red=[1])),
              ('everything from 400', 'RangeBar', {}, [['whoosh_soft_3', 'f:8', -20], ['tick_2', 'f:44', -18]]),
              cut('One common black', words('ONE COMMON RATING', '500°F', red=[1]))]
SPEC['k3'] = [SPEC['k3'][0], cut('where anything less', words('ANYTHING LESS', 'WOULD OPEN', 'ON ITS OWN', red=[1])), SPEC['k3'][1]]
SPEC['t2'] = [cut(0, macro('red', ['STANDARD', 'RESPONSE', '≈ 5 mm'])), cut('Quick response', macro('thin', ['QUICK', 'RESPONSE', '≈ 3 mm']))]
SPEC['f1'] = SPEC['f1'] + [cut('two small plates', macro('nobulb', ['TWO PLATES', 'SOLDER', 'MELTS → OPENS']))]
SPEC['f2'] = [SPEC['f2'][0],
              cut("patented what's", words('THE FIRST PRACTICAL', 'AUTOMATIC SPRINKLER', red=[1], size=130)),
              ('He built it', photo('old_sprinkler', 'TO PROTECT HIS FACTORY')),
              cut('and to lower', words('AND TO LOWER HIS', 'INSURANCE BILL', red=[1], icon='piano', size=120))]
SPEC['n2'] = [SPEC['n2'][0], cut("Smoke doesn't", ('Versus', dict(a=dict(icon='smoke', label='SMOKE'), b=dict(icon='fire', label='HEAT'), sign='≠', aBad=True, verdict='only heat at the bulb opens it'),
              [['pop_1', 'f:0', -18], ['pop_2', 'f:6', -18]]))]
SPEC['n3'] = [cut(0, words('U.S. FIRES', '2015 – 2019', 'SPRINKLERS OPERATED', red=[1], size=130)),
              ('just one sprinkler', 'StatRings', {}, [['tick_1', 'p:0.22', -18], ['tick_2', 'p:0.66', -18]])]
SPEC['n5'] = [SPEC['n5'][0],
              ('100 people', 'StoryCard', dict(date='FEB 20, 2003', place='WEST WARWICK, RHODE ISLAND', icon='club',
                 lines=[dict(big='100', small='PEOPLE KILLED', at=0.05, count=dict(to=100)), dict(big='THE STATION', small='nightclub', at=0.45)]),
               [['paper_slide', 'f:0', -20], ['tick_1', 'p:0.05', -18], ['tick_2', 'p:0.45', -18]]),
              cut('The building was', words('NEVER REQUIRED', 'TO HAVE SPRINKLERS', red=[1], size=130)),
              cut('That same year', words('SAME YEAR:', 'REQUIRED IN CLUBS', 'FOR 150+ PEOPLE', red=[1], size=130, sfx=[['stamp_thud_1', 'f:0', -18]]))]
SPEC['e1'] = [SPEC['e1'][0], cut('One small glass tube', macro('red', ['ONE TUBE', 'ONE COLOR', 'ONE NUMBER'])),
              ('right above the fire', 'CeilingRow', dict(mode='real', caption='AND NOWHERE ELSE'), [['glass_shatter_2', 'f:26', -9], ['water_spray_burst', 'f:29', -17]])]

SPEC['m2'] = [cut(0, words('THE RESORT', '$106 MILLION', red=[1])), ('Putting sprinklers', 'MoneyBars', {}, [['whoosh_soft_1', 'f:0', -18], ['tick_2', 'p:0.45', -18], ['marker_scribble', 'p:0.45+16', -22]])]
SPEC['m3'] = [cut(0, words('ONE OF THE', 'INVESTIGATORS', icon='hotel', size=130)), ('with sprinklers', *SPEC['m3'][0][1:])]

ORDER = [b['id'] for b in json.load(open(os.path.join(ROOT, '02_scripts', 'sprinkler', 'vo_lines_v2.json')))]
ITEM_STARTS = {'o1', 'r1', 'y1', 'g1', 'b1', 'cta', 'p1', 'k1', 't1', 'f1', 'n1', 'e1'}

def expand(cut):
    at, *rest = cut
    if isinstance(rest[0], tuple) and rest[0][0] == 'PHOTO':
        _, slug, caption, focus, side, sfx = rest[0]
        if slug not in CREDITS:
            return None
        c = CREDITS[slug]
        credit = f"Photo: {c['author']} / Wikimedia Commons, {c['license']}"
        return at, 'Photo', dict(src=f'sprinkler/{slug}.jpg', caption=caption, credit=credit, focus=list(focus), side=side), sfx
    return (at, *rest)

def resolve(spec, dur):
    kind, expr = spec.split(':', 1)
    if kind == 'f':
        return int(eval(expr))
    m = re.match(r'([0-9.]+)(.*)', expr)
    return round(float(m.group(1)) * dur) + (int(eval(m.group(2))) if m.group(2) else 0)

beats, shots, t = [], [], 0
for idx, bid in enumerate(ORDER):
    p = os.path.join(VO, f'{bid}.wav')
    info = sf.info(p)
    vo = info.frames / info.samplerate
    first_scene = SPEC[bid][0][1]
    lead = 0.45 if first_scene == 'Hero' else 0.06
    nxt = ORDER[idx + 1] if idx + 1 < len(ORDER) else None
    tail = 0.4 if (nxt in ITEM_STARTS) else 0.15
    if any(c[1] in ('Burst', 'Hanger', 'Race', 'SunBurst') for c in SPEC[bid] if isinstance(c[1], str)):
        tail += 0.25
    if bid == 'e2':
        tail = 3.0
    dur = round((lead + vo + tail) * FPS)
    vs = t + round(lead * FPS)
    cuts = [c for c in (expand(c) for c in SPEC[bid]) if c]
    text = LINES[bid]
    starts = []
    for at, *_ in cuts:
        if at == 0:
            starts.append(t)
        else:
            pos = text.find(at)
            assert pos >= 0, (bid, at)
            starts.append(vs + round(pos / len(text) * vo * FPS) - 4)
    for k, (at, scene, props, sfx) in enumerate(cuts):
        s = starts[k]
        e = starts[k + 1] if k + 1 < len(cuts) else t + dur
        props = dict(props)
        if scene == 'Hero':
            props['idx'] = HERO[bid]
        shots.append(dict(id=f'{bid}.{k}', beat=bid, scene=scene, props=props, **{'from': s}, dur=e - s,
                          cues=[dict(file=x[0], frame=s + resolve(x[1], e - s), gain=x[2]) for x in sfx]))
    beats.append(dict(id=bid, **{'from': t}, dur=dur, voStart=vs, vo=os.path.relpath(p, ROOT), voDur=round(vo, 3)))
    t += dur

short = [(s['id'], s['dur']) for s in shots if s['dur'] < 36]
lens = sorted(s['dur'] / FPS for s in shots)
out = dict(fps=FPS, total=t, beats=beats, shots=shots)
json.dump(out, open(os.path.join(ROOT, '07_render', 'src', 'edl.json'), 'w'), indent=1)
print(f'{len(beats)} beats, {len(shots)} shots, {t} frames = {t / FPS:.1f} s; shot length median {lens[len(lens) // 2]:.1f}s max {lens[-1]:.1f}s')
print('short shots (<1.2s):', short)
print('photos used:', [s['props']['src'] for s in shots if s['scene'] == 'Photo'])

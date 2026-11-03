"""Edit for 'How Body Armor Levels Actually Work' (v3 competitor format).
SPEC[line_id] = list of cuts: (at, scene, props, events, sfx)
  at     = 0 or phrase in the VO text where the cut lands
  events = phrases; each becomes a frame offset (relative to the cut) in props['ev'] -> on-screen text enters exactly as it is said
  sfx    = [file, 'ev:i' | 'f:N' | 'p:X', gain]  ('ev:i' = on event i)
STEP[line_id] = HUD step index (-1 = none).  Writes 07_render/src/armor/edl.json"""
import json, os, re
import soundfile as sf
FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LINES = {l['id']: l['text'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'armor', 'vo_lines.json')))}
ORDER = [l['id'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'armor', 'script.json')))['lines']]
VO = os.path.join(ROOT, '03_voiceover', 'armor', 'final')
T = lambda *ls: [dict(t=l) if isinstance(l, str) else l for l in ls]
R = lambda t, **k: dict(t=t, red=True, **k)
POP = [['pop_1', 'ev:0', -18], ['pop_2', 'ev:1', -18], ['pop_3', 'ev:2', -18], ['pop_1', 'ev:3', -18]]
TK = [['tick_1', 'ev:0', -19], ['tick_2', 'ev:1', -19], ['tick_3', 'ev:2', -19], ['tick_1', 'ev:3', -19]]
LAD = lambda i, frm=None: ('Ladder', dict(focus=i, **({'from': frm} if frm is not None else {})), [], [['whoosh_hard_2', 'f:0', -17], ['stamp_thud_2', 'f:22', -18]])
SHOOT = lambda: [['glass_shatter_1', 'ev:0', -14], ['sub_hit_1', 'ev:0', -16], ['stamp_thud_1', 'ev:0+4', -16]]

SPEC = {
 'a01': [(0, 'Ladder', dict(focus=-1), [], [['whoosh_hard_1', 'f:0', -16]]),
         ('from a vest', 'TextSlide', dict(lines=T('FROM A VEST THAT', R('STOPS A PISTOL'), 'TO A PLATE THAT', R('STOPS AN ARMOR-PIERCING ROUND'))), ['from a vest', 'stops a pistol', 'to a plate', 'stops an armor'], TK)],
 'a02': [(0, 'NotExist', dict(showStamp=True), ['And one', 'does not'], [['pop_1', 'ev:0', -18], ['stamp_thud_1', 'ev:1', -12]])],
 's1a': [(0, *LAD(0, -1))],
 's1b': [(0, 'ArmorCard', dict(kind='vest', shade=0, title='LEVEL IIA', kicker='SOFT ARMOR · STEP 1', facts=['THE THINNEST', 'SOFT & FLEXIBLE', 'WOVEN FIBER LAYERS']), ['thinnest', 'soft, flexible', 'woven fiber'], TK)],
 's1c': [(0, 'BulletTest', dict(armor='vest', shade=0, bullet='9mm', fps=1225, result='stop'), ['feet per second'], [['whoosh_soft_1', 'ev:0-14', -16]] + SHOOT())],
 's1d': [(0, 'Rename', dict(old='IIA', neu='', sub='DROPPED FROM THE NEWEST STANDARD', gone=True), ['it is gone', 'dropped'], [['stamp_thud_2', 'ev:0', -12]])],
 's2a': [(0, *LAD(1, 0))],
 's2b': [(0, 'ArmorCard', dict(kind='vest', shade=1, title='LEVEL II', kicker='SOFT ARMOR · STEP 2', facts=['THICKER', 'STILL SOFT', '9MM + .357 MAGNUM']), ['Thicker', 'still soft', 'nine millimeter'], TK),
         ('three fifty', 'BulletTest', dict(armor='vest', shade=1, bullet='357', result='stop'), ['Magnum'], SHOOT())],
 's2c': [(0, 'TextSlide', dict(lines=T('SOFT ARMOR', R('OWES A LOT TO ONE MAN'))), ['Soft armor', 'one man'], TK),
         ('In 1972', 'Davis', dict(phase=0), ['shot himself', 'pizza'], [['paper_slide', 'f:0', -18], ['glass_shatter_2', 'ev:0', -10], ['sub_hit_2', 'ev:0', -12]])],
 's2d': [(0, 'Davis', dict(phase=1), ['He stood up'], [['tick_1', 'f:4', -18], ['pop_2', 'ev:0', -16], ['pop_3', 'ev:0+8', -16], ['pop_1', 'ev:0+16', -16]])],
 's2e': [(0, 'Davis', dict(phase=2), [], [['counter_tick_loop', 'f:4', -24]])],
 's2f': [(0, 'Rename', dict(old='II', neu='HG1', sub='HG = HANDGUN'), ['H.G. one', 'for handgun'], [['whoosh_soft_2', 'ev:0', -18], ['tick_2', 'ev:1', -18]])],
 's3a': [(0, *LAD(2, 1))],
 's3b': [(0, 'ArmorCard', dict(kind='vest', shade=2, title='LEVEL IIIA', kicker='SOFT ARMOR · STEP 3', facts=['THE STRONGEST SOFT ARMOR', 'ADDS THE .44 MAGNUM']), ['strongest soft', 'forty-four'], TK),
         ('one of the most', 'BulletTest', dict(armor='vest', shade=2, bullet='44', result='stop', caption='one of the most powerful handgun rounds'), ['handgun rounds'], SHOOT())],
 's3c': [(0, 'TextSlide', dict(lines=T('STILL FITS', R('UNDER A SHIRT')), side=None), ['still something', 'under a shirt'], TK),
         ('It is now called', 'Rename', dict(old='IIIA', neu='HG2', sub='HG = HANDGUN'), ['H.G. two'], [['whoosh_soft_3', 'ev:0', -18]])],
 's3d': [(0, 'BulletTest', dict(armor='vest', shade=2, bullet='762', result='pass', caption='no soft vest stops a rifle'), ['rifle'], [['whoosh_soft_4', 'ev:0-14', -16], ['glass_shatter_3', 'ev:0', -12], ['stamp_thud_2', 'ev:0+4', -12]])],
 's4a': [(0, *LAD(3, 2)), ('It is the rule', 'TextSlide', dict(lines=T('NOT A LEVEL.', R('THE RULE BEHIND EVERY LEVEL'))), ['It is the rule', 'every level'], TK)],
 's4b': [(0, 'TextSlide', dict(lines=T('STOPPING THE BULLET', R('IS NOT ENOUGH'))), ['Stopping', 'not enough'], TK),
         ('Behind the armor', 'Clay', dict(mode='intro'), ['block of clay', 'clay'], [['pop_1', 'ev:0', -18]])],
 's4c': [(0, 'Clay', dict(mode='hit'), ['the armor bends'], [['glass_shatter_1', 'ev:0', -14], ['sub_hit_1', 'ev:0', -14]])],
 's4d': [(0, 'Clay', dict(mode='fail'), ['deeper than', 'even if'], [['glass_shatter_2', 'ev:0', -14], ['stamp_thud_1', 'ev:0+10', -12]])],
 's5a': [(0, *LAD(4, 3))],
 's5b': [(0, 'TextSlide', dict(lines=T('THIS IS WHERE', R('SOFT ARMOR ENDS'))), ['This is where', 'soft armor ends'], TK),
         ('Level Three is a rigid', 'ArmorCard', dict(kind='plate', material='ceramic', title='LEVEL III', kicker='HARD PLATE · STEP 5', facts=['A RIGID PLATE']), ['rigid plate'], TK),
         ('made of ceramic', 'Materials', {}, ['ceramic', 'steel', 'polyethylene'], POP)],
 's5c': [(0, 'BulletTest', dict(armor='plate', material='ceramic', bullet='762', fps=2780, result='stop'), ['feet per second'], [['whoosh_soft_1', 'ev:0-14', -16]] + SHOOT()),
         ('More than twice', 'SpeedBars', dict(rows=[dict(bullet='9mm', fps=1225), dict(bullet='762', fps=2780)], verdict='more than twice as fast'), ['More than', 'twice', 'Two A test'], [['whoosh_soft_2', 'ev:0', -18], ['whoosh_soft_3', 'ev:1', -18]])],
 's5d': [(0, 'SixShots', {}, [], [['glass_shatter_1', 'f:3', -18], ['glass_shatter_2', 'p:0.125+3', -18], ['glass_shatter_3', 'p:0.25+3', -18], ['glass_shatter_1', 'p:0.375+3', -18], ['glass_shatter_2', 'p:0.5+3', -18], ['glass_shatter_3', 'p:0.625+3', -18]])],
 's5e': [(0, 'Rename', dict(old='III', neu='RF1', sub='RF = RIFLE'), ['R.F. one', 'for rifle'], [['whoosh_soft_4', 'ev:0', -18], ['tick_1', 'ev:1', -18]])],
 's6a': [(0, *LAD(5, 4))],
 's6b': [(0, 'NotExist', {}, ['You will find'], POP), ('It is the level', 'TextSlide', dict(lines=T('THE LEVEL PEOPLE', R('ARGUE ABOUT MOST'))), ['It is the level', 'argue'], TK)],
 's6c': [(0, 'NotExist', dict(showStamp=True), ['And it was', 'never an official'], [['pop_1', 'ev:0', -18], ['stamp_thud_2', 'ev:1', -10]]),
         ('There is no', 'TextSlide', dict(lines=T('NO LEVEL III+', R('IN THE GOVERNMENT STANDARD'))), ['There is no', 'government'], TK)],
 's6d': [(0, 'TextSlide', dict(kicker='WHAT "PLUS" USUALLY MEANS', lines=T('STOPS MORE THAN LEVEL III')), ['Makers invented'], TK),
         ('usually the green', 'BulletTest', dict(armor='plate', material='pe', bullet='556', result='stop'), ['round'], SHOOT()),
         ('But what plus means', 'TextSlide', dict(lines=T('"PLUS" MEANS', R('WHATEVER THE MAKER SAYS'))), ['But what', 'company'], TK)],
 's7a': [(0, *LAD(6, 5))],
 's7b': [(0, 'TextSlide', dict(lines=T('THE NEWEST STANDARD', R('DID SOMETHING ABOUT IT'))), ['So the newest', 'something about it'], TK),
         ('It created', 'TextSlide', dict(kicker='NEW', lines=T('A BRAND NEW LEVEL', R('BETWEEN III AND IV'))), ['brand new', 'between Three'], TK)],
 's7c': [(0, 'BulletTest', dict(armor='plate', material='pe', bullet='556', result='stop', caption='RF2 = RF1 + 5.56 green tip'), ['green-tipped'], [['whoosh_soft_2', 'ev:0-14', -16]] + SHOOT()),
         ('The gap that', 'Rename', dict(old='III+', neu='RF2', sub='THE MARKETING GAP GOT A REAL NAME'), ['now has', 'real name'], [['whoosh_soft_3', 'ev:0', -18], ['stamp_thud_1', 'ev:1', -14]])],
 's8a': [(0, *LAD(7, 6))],
 's8b': [(0, 'ArmorCard', dict(kind='plate', material='ceramic', title='LEVEL IV', kicker='HARD PLATE · TOP OF THE LADDER', facts=['.30-06 ARMOR-PIERCING', 'HARDENED STEEL CORE']), ['thirty aught', 'hardened steel'], TK),
         ('with a hardened', 'BulletTest', dict(armor='plate', material='ceramic', bullet='3006', result='stop', caption='hardened steel core'), ['core'], SHOOT())],
 's8c': [(0, 'Rename', dict(old='IV', neu='RF3', sub='RF = RIFLE'), ['R.F. three'], [['whoosh_soft_4', 'ev:0', -18]])],
 'e1': [(0, 'Ladder', dict(focus=-1, outro=True), [], [['whoosh_hard_1', 'f:0', -16]]),
        ('Two A is gone', 'RenameTable', {}, ['Two A is gone', 'Two is', 'Three A is', 'Three is', 'Three plus', 'And Four'], TK + [['tick_2', 'ev:4', -19], ['tick_3', 'ev:5', -19]])],
 'e2': [(0, 'TextSlide', dict(lines=T('THE LEVEL THAT', R('DOES NOT EXIST'), 'WAS SO POPULAR', R('IT BECAME REAL'))), ['The level', 'does not exist', 'so popular', 'make it real'], TK + [['stamp_thud_2', 'ev:3', -14]])],
 'e3': [(0, 'Outro', {}, [], [['pop_1', 'f:6', -18]])],
}
STEP = {}
cur = -1
for lid in ORDER:
    if lid.startswith('s') and lid[1].isdigit():
        cur = int(lid[1]) - 1
    STEP[lid] = cur if not lid.startswith(('a', 'e')) else -1

def frame_of(text, phrase, vs, vo):
    pos = text.find(phrase)
    assert pos >= 0, (phrase, text)
    return vs + round(pos / len(text) * vo * FPS)

beats, shots, t = [], [], 0
for idx, lid in enumerate(ORDER):
    info = sf.info(os.path.join(VO, f'{lid}.wav'))
    vo = info.frames / info.samplerate
    lead = 0.08
    nxt = ORDER[idx + 1] if idx + 1 < len(ORDER) else None
    tail = 0.35 if (nxt and nxt.endswith('a') and nxt[0] == 's') else 0.12
    if lid == 'e3':
        tail = 3.0
    if SPEC[lid][0][1] == 'Ladder':
        lead = 0.5
    dur = round((lead + vo + tail) * FPS)
    vs = t + round(lead * FPS)
    text = LINES[lid]
    cuts = SPEC[lid]
    starts = [t if (c[0] == 0) else frame_of(text, c[0], vs, vo) - 5 for c in cuts]
    for k, (_, scene, props, events, sfx) in enumerate(cuts):
        s = starts[k]
        e = starts[k + 1] if k + 1 < len(cuts) else t + dur
        ev = [max(0, frame_of(text, p, vs, vo) - s) for p in events]
        props = dict(props, ev=ev)
        cues = []
        for fn, when, g in sfx:
            kind, expr = when.split(':', 1)
            if kind == 'ev':
                m = re.match(r'(\d+)([+-]\d+)?', expr)
                i = int(m.group(1))
                if i >= len(ev): continue
                off = ev[i] + (int(m.group(2)) if m.group(2) else 0)
            elif kind == 'f':
                off = int(expr)
            else:
                m = re.match(r'([0-9.]+)([+-]\d+)?', expr)
                off = round(float(m.group(1)) * (e - s)) + (int(m.group(2)) if m.group(2) else 0)
            cues.append(dict(file=fn, frame=s + off, gain=g))
        shots.append(dict(id=f'{lid}.{k}', beat=lid, scene=scene, props=props, step=STEP[lid], **{'from': s}, dur=e - s, cues=cues))
    beats.append(dict(id=lid, **{'from': t}, dur=dur, voStart=vs, vo=os.path.relpath(os.path.join(VO, f'{lid}.wav'), ROOT), voDur=round(vo, 3)))
    t += dur
for a, b in zip(shots, shots[1:]):
    assert b['from'] == a['from'] + a['dur'], ('gap', a['id'], b['id'])
lens = sorted(s['dur'] / FPS for s in shots)
json.dump(dict(fps=FPS, total=t, beats=beats, shots=shots), open(os.path.join(ROOT, '07_render', 'src', 'armor', 'edl.json'), 'w'), indent=1)
evs = []
for s in shots:
    evs += [s['from'] + x for x in s['props']['ev']] + [s['from']]
evs = sorted(set(evs)); gaps = [(b - a) / FPS for a, b in zip(evs, evs[1:])]
print(f"{len(shots)} shots, {t / FPS:.1f}s; shot median {lens[len(lens) // 2]:.1f}s max {lens[-1]:.1f}s; visual events {len(evs)} = {len(evs) / (t / FPS) * 60:.0f}/min; longest event gap {max(gaps):.1f}s")

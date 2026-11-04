"""Edit for 'How Prison Security Levels Actually Work' (v3 competitor format).
SPEC[line_id] = list of cuts: (at, scene, props, events, sfx)
  at     = 0 or phrase in the VO text where the cut lands
  events = phrases; each becomes a frame offset (relative to the cut) in props['ev'] -> on-screen text enters exactly as it is said
  sfx    = [file, 'ev:i' | 'f:N' | 'p:X', gain]  ('ev:i' = on event i)
STEP[line_id] = HUD step index (-1 = none).  Writes 07_render/src/armor/edl.json"""
import json, os, re
import soundfile as sf
FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LINES = {l['id']: l['text'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'prison', 'vo_lines.json')))}
ORDER = [l['id'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'prison', 'script.json')))['lines']]
VO = os.path.join(ROOT, '03_voiceover', 'prison', 'final')
T = lambda *ls: [dict(t=l) if isinstance(l, str) else l for l in ls]
R = lambda t, **k: dict(t=t, red=True, **k)
POP = [['pop_1', 'ev:0', -18], ['pop_2', 'ev:1', -18], ['pop_3', 'ev:2', -18], ['pop_1', 'ev:3', -18]]
TK = [['tick_1', 'ev:0', -19], ['tick_2', 'ev:1', -19], ['tick_3', 'ev:2', -19], ['tick_1', 'ev:3', -19]]
LAD = lambda i, frm=None: ('Ladder', dict(focus=i, **({'from': frm} if frm is not None else {})), [], [['whoosh_hard_2', 'f:0', -17], ['stamp_thud_2', 'f:22', -18]])
SHOOT = lambda: [['glass_shatter_1', 'ev:0', -14], ['sub_hit_1', 'ev:0', -16], ['stamp_thud_1', 'ev:0+4', -16]]

SPEC = {
 'a01': [(0, 'Ladder', dict(focus=-1), [], [['whoosh_hard_1', 'f:0', -16]]),
         ('from a camp', 'TextSlide', dict(lines=T('FROM A CAMP', R('WITH NO FENCE'), 'TO A CELL WHERE YOU SPEND', R('23 HOURS A DAY ALONE'))), ['from a camp', 'no fence', 'to a cell', '23 hours'], TK)],
 'a02': [(0, 'TextSlide', dict(kicker='FEDERAL CUSTODY', lines=T(R('≈ 150,000 PEOPLE'), 'EVERY ONE SORTED', 'INTO A LEVEL')), ['About', 'every one', 'sorted'], TK)],
 'a03': [(0, 'NoEscape', {}, [], [['stamp_thud_1', 'f:10', -14]]),
         ('is not even', 'TextSlide', dict(lines=T('THE MOST SECURE PRISON', R('IS NOT "HIGH SECURITY"'))), ['is not even', 'high security'], TK)],
 's1a': [(0, *LAD(0, -1))],
 's1b': [(0, 'TextSlide', dict(lines=T('A JUDGE CAN RECOMMEND', R('THE BUREAU OF PRISONS DECIDES'))), ['A judge', 'Bureau of Prisons'], TK),
         ('with points', 'ScoreForm', dict(rows=['OFFENSE SEVERITY', 'CRIMINAL HISTORY', 'HISTORY OF VIOLENCE', 'ESCAPE HISTORY'], pts=[0, 0, 0, 0]), ['points', 'single form'], [['paper_slide', 'f:0', -18]])],
 's1c': [(0, 'ScoreForm', dict(rows=['OFFENSE SEVERITY', 'CRIMINAL HISTORY', 'HISTORY OF VIOLENCE', 'ESCAPE HISTORY'], pts=[5, 3, 2, 3]), ['How serious', 'criminal history', 'Any violence', 'Any escape'], [['tick_1', 'ev:0+6', -16], ['tick_2', 'ev:1+6', -16], ['tick_3', 'ev:2+6', -16], ['tick_1', 'ev:3+6', -16]])],
 's1d': [(0, 'ScoreScale', {}, ['zero to eleven', 'Twelve', 'Sixteen', 'Twenty-four'], [['pop_1', 'ev:0', -17], ['pop_2', 'ev:1', -17], ['pop_3', 'ev:2', -17], ['pop_1', 'ev:3', -17]])],
 's1e': [(0, 'ScoreScale', dict(marker=14, quiz=True), [], [['whoosh_soft_1', 'f:0', -18], ['counter_tick_loop', 'e:95', -20], ['tick_1', 'e:95', -14], ['tick_2', 'e:65', -14], ['tick_3', 'e:35', -14]])],
 's1f': [(0, 'ScoreScale', dict(marker=14, reveal=True, gapNote=True), ['just three points'], [['stamp_thud_2', 'f:2', -14], ['marker_scribble', 'ev:0', -18]])],
 's1g': [(0, 'TextSlide', dict(kicker='THE ONLY THING THAT SUBTRACTS POINTS', lines=T('SHOWING UP', R('ON YOUR OWN'))), ['Only one thing', 'showing up'], TK)],
 's1h': [(0, 'TextSlide', dict(lines=T('THE SCORE IS NOT FINAL')), ['the score is not final'], TK),
         ('called public', 'TextSlide', dict(kicker='OVERRIDE', lines=T(R('PUBLIC SAFETY FACTORS'), 'CAN PUSH YOU UP A LEVEL')), ['public safety', 'push you up'], TK + [['stamp_thud_1', 'ev:1', -16]])],
 's2a': [(0, *LAD(1, 0))],
 's2b': [(0, 'PerimeterScene', dict(kind='camp', title='FEDERAL PRISON CAMP', labels=['DORMITORIES', 'FEW OFFICERS', 'LITTLE OR NO FENCE']), ['Dormitories', 'very few', 'limited fencing'], TK),
         ('Dormitories', 'HousingScene', dict(kinds=['dorm'], labels=['DORMITORY · NOT CELLS']), [], [['whoosh_soft_2', 'f:0', -18]]),
         ('limited fencing', 'PerimeterScene', dict(kind='camp', labels=['NO FENCE AT ALL']), ['or none'], [['stamp_thud_2', 'ev:0', -16]])],
 's2c': [(0, 'TextSlide', dict(kicker='DESIGNED THAT WAY', lines=T('SO INMATES COULD WORK', R('LANDSCAPING & MAINTENANCE'), 'WITHOUT CHECKING IN AND OUT')), ['Camps were', 'landscaping', 'without checking'], TK)],
 's2d': [(0, 'TextSlide', dict(lines=T('AND SOMETIMES,', R('THEY JUST LEAVE'))), ['And sometimes', 'just leave'], TK),
         ('In 2021', 'WalkAway', dict(phase=0), ['29 escapes', 'Every single one'], [['paper_slide', 'f:0', -18], ['counter_tick_loop', 'ev:0', -24], ['stamp_thud_1', 'ev:1', -14]])],
 's2e': [(0, 'WalkAway', dict(phase=1), ['a single officer'], [['tick_1', 'f:4', -16], ['tick_2', 'ev:0', -16]])],
 's2f': [(0, 'TwoWords', dict(a='WALK AWAY', aWho='BUREAU OF PRISONS', b='ESCAPE', bWho='THE LAW'), ['The Bureau', 'The law'], [['pop_1', 'ev:0', -16], ['stamp_thud_2', 'ev:1', -14]])],
 's3a': [(0, *LAD(2, 1))],
 's3b': [(0, 'TextSlide', dict(lines=T('THIS IS WHERE', R('THE FENCES START'))), ['This is where', 'fences start'], TK),
         ('surrounded by', 'PerimeterScene', dict(kind='low', labels=['FENCE 1', 'FENCE 2']), ['surrounded', 'two of them'], [['whoosh_soft_3', 'ev:0', -18], ['tick_2', 'ev:1', -16]])],
 's3c': [(0, 'HousingScene', dict(kinds=['dorm', 'cubicle'], labels=['DORMITORIES', 'CUBICLES']), ['dormitories', 'cubicles'], POP),
         ('and there are more', 'TextSlide', dict(lines=T('MORE STAFF', R('WATCHING'))), ['more staff'], TK)],
 's4a': [(0, *LAD(3, 2))],
 's4b': [(0, 'PerimeterScene', dict(kind='medium', labels=['STRONGER FENCES', 'ELECTRONIC DETECTION']), ['fences get stronger', 'electronic'], [['whoosh_soft_1', 'ev:0', -18], ['click_1', 'ev:1', -14]])],
 's4c': [(0, 'HousingScene', dict(kinds=['dorm', 'cell'], labels=['DORMS', 'CELLS']), ['first level', 'cells instead'], POP),
         ('A door that locks', 'TextSlide', dict(lines=T('A DOOR THAT LOCKS', R('FROM THE OUTSIDE'))), ['A door', 'from the outside'], [['click_2', 'ev:1', -12]])],
 's5a': [(0, *LAD(4, 3))],
 's5b': [(0, 'TextSlide', dict(kicker='HIGH SECURITY', lines=T(R('UNITED STATES PENITENTIARIES'))), ['United States'], TK),
         ('Walls or reinforced', 'PerimeterScene', dict(kind='high', labels=['WALLS', 'CELLS FOR 1–2', 'MOST STAFF']), ['Walls', 'cells for one', 'most staff'], TK)],
 's5c': [(0, 'TextSlide', dict(lines=T('FOR MOST INMATES', R('THIS IS THE CEILING'))), ['For most', 'ceiling'], TK)],
 's6a': [(0, *LAD(5, 4))],
 's6b': [(0, 'TextSlide', dict(lines=T('NOT A LEVEL OF DANGER', R('A LEVEL OF PURPOSE'))), ['not really', 'purpose'], TK)],
 's6c': [(0, 'TextSlide', dict(kicker='SPECIAL MISSIONS', lines=T('WAITING FOR TRIAL', 'SERIOUS MEDICAL CARE', R('EVERY SECURITY LEVEL AT ONCE'))), ['waiting for trial', 'medical care', 'every security level'], TK)],
 's6d': [(0, 'TextSlide', dict(lines=T('AND ONE IS', R('VERY DIFFERENT'))), ['And one', 'very different'], [['sub_hit_1', 'ev:1', -16]])],
 's7a': [(0, *LAD(6, 5))],
 's7b': [(0, 'Florence', {}, ['Administrative Maximum', 'Alcatraz'], [['paper_slide', 'f:0', -18], ['stamp_thud_2', 'f:6', -18], ['tick_1', 'ev:0', -16], ['marker_scribble', 'ev:1', -18]])],
 's7c': [(0, 'ADXCell', {}, ['bed', 'the desk'], [['tick_1', 'ev:0', -16], ['tick_2', 'ev:1', -16]])],
 's7d': [(0, 'ADXCell', dict(window=True), [], [['click_1', 'f:4', -14]])],
 's7e': [(0, 'Hours23', {}, [], [['counter_tick_loop', 'f:4', -24]])],
 's7f': [(0, 'TextSlide', dict(lines=T('SOME OF THE MOST', R('NOTORIOUS CRIMINALS'), 'IN AMERICA')), ['It has held', 'notorious', 'America'], TK),
         ('Drug lord', 'Inmates', {}, ['Drug lord', 'Boston', 'Oklahoma'], POP)],
 's7g': [(0, 'NoEscape', {}, [], [['stamp_thud_1', 'f:10', -12]])],
 's7h': [(0, 'TextSlide', dict(lines=T('BUT HERE IS', R('THE TWIST'))), ['But here', 'twist'], [['sub_hit_2', 'ev:1', -14]]),
         ('According to', 'Ninety', {}, ['not sent', 'because of how'], [['whoosh_soft_2', 'f:0', -18], ['tick_3', 'ev:1', -16]])],
 'e1': [(0, 'TextSlide', dict(lines=T('NOT ABOUT', R('WHAT YOU DID'))), ['not really', 'what you did'], TK),
        ('It starts with', 'ScoreScale', dict(marker=14), [], [['whoosh_soft_1', 'f:0', -18]]),
        ('and at the very top', 'TextSlide', dict(lines=T('AT THE TOP:', R('WHAT YOU DO INSIDE'))), ['at the very top', 'once you are inside'], TK)],
 'e2': [(0, 'Outro', {}, [], [['pop_1', 'f:6', -18]])],
}

SPEC['s6c'] = [(0, 'TextSlide', dict(kicker='ADMINISTRATIVE', lines=T('PRISONS WITH', R('A SPECIFIC MISSION'))), ['Administrative', 'specific mission'], TK),
               ('like people still', 'TextSlide', dict(kicker='SPECIAL MISSIONS', lines=T('WAITING FOR TRIAL', 'SERIOUS MEDICAL CARE')), ['like people', 'medical care'], TK),
               ('They can hold', 'TextSlide', dict(lines=T('EVERY SECURITY LEVEL', R('AT ONCE'))), ['They can hold', 'at once'], TK + [['stamp_thud_2', 'ev:1', -16]])]
SPEC['s7b'] = [(0, 'Florence', {}, ['Administrative Maximum', 'opened'], [['paper_slide', 'f:0', -18], ['stamp_thud_2', 'f:6', -18], ['tick_1', 'ev:0', -16]]),
               ('often called', 'TextSlide', dict(lines=T(dict(t='"the Alcatraz of the Rockies"', hand=True, size=110, red=True))), ['often called'], [['marker_scribble', 'ev:0', -18]])]
SPEC['s7h'] = [SPEC['s7h'][0], ('According to', 'Ninety', {}, ['about 90', 'were not sent'], [['whoosh_soft_2', 'f:0', -18], ['tick_3', 'ev:1', -16]]),
               ('They were sent there', 'TextSlide', dict(lines=T('SENT THERE FOR', R('HOW THEY BEHAVED'), 'IN OTHER PRISONS')), ['They were sent', 'how they behaved', 'in other prisons'], TK + [['stamp_thud_1', 'ev:1', -14]])]
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
    if lid == 'e2':
        tail = 3.0
    if lid == 's1e':
        tail += 3.3
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
            elif kind == 'e':
                off = (e - s) - int(expr)
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
json.dump(dict(fps=FPS, total=t, beats=beats, shots=shots), open(os.path.join(ROOT, '07_render', 'src', 'prison', 'edl.json'), 'w'), indent=1)
evs = []
for s in shots:
    evs += [s['from'] + x for x in s['props']['ev']] + [s['from']]
evs = sorted(set(evs)); gaps = [(b - a) / FPS for a, b in zip(evs, evs[1:])]
print(f"{len(shots)} shots, {t / FPS:.1f}s; shot median {lens[len(lens) // 2]:.1f}s max {lens[-1]:.1f}s; visual events {len(evs)} = {len(evs) / (t / FPS) * 60:.0f}/min; longest event gap {max(gaps):.1f}s")

"""Edit for 'Every Letter in a Military Aircraft Name Explained'. Run inside /opt/tts/.venv (faster-whisper).
Event times come from Whisper word timestamps on the final VO (script word k -> spoken word k), so each
letter / card lands on the word that names it. Writes 07_render/src/aircraft/edl.json."""
import json, os, re
import soundfile as sf
from faster_whisper import WhisperModel

FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LINES = {l['id']: l['text'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'aircraft', 'vo_lines.json')))}
ORDER = [l['id'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'aircraft', 'script.json')))['lines']]
VO = os.path.join(ROOT, '03_voiceover', 'aircraft', 'final')
asr = WhisperModel('small.en', device='cpu', compute_type='int8')

T = lambda *ls: [dict(t=l) if isinstance(l, str) else l for l in ls]
R = lambda t: dict(t=t, red=True)
TK = [['tick_1', 'ev:0', -19], ['tick_2', 'ev:1', -19], ['tick_3', 'ev:2', -19]]
POP = [['pop_1', 'ev:0', -18], ['pop_2', 'ev:1', -18], ['pop_3', 'ev:2', -18], ['pop_1', 'ev:3', -18], ['pop_2', 'ev:4', -18], ['pop_3', 'ev:5', -18]]
SLOT = [['whoosh_soft_1', 'f:0', -18], ['pop_1', 'f:8', -18], ['pop_2', 'f:14', -18], ['pop_3', 'f:20', -18], ['stamp_thud_2', 'ev:9', -16]]
def CODE(code, focus=-1, plane=None, cap=None, sub=None, **k):
    p = dict(code=code, focus=focus, **k)
    if plane: p['plane'] = plane
    if cap: p['caption'] = cap
    if sub: p['sub'] = sub
    return p
def STORY(date, head, sub=None, stamp=None, plane=None, color=None):
    p = dict(date=date, head=head)
    for kk, vv in (('sub', sub), ('stamp', stamp), ('plane', plane), ('planeColor', color)):
        if vv: p[kk] = vv
    return p
ST = [['paper_slide', 'f:0', -18], ['tick_1', 'f:6', -18], ['stamp_thud_1', 'ev:1', -12]]

SPEC = {
 'h1': [(0, 'Cross', {}, ['F twenty-four'], [['whoosh_hard_1', 'f:0', -14], ['sub_hit_1', 'f:2', -12], ['marker_scribble', 'ev:0', -16], ['stamp_thud_1', 'ev:0+6', -14]])],
 'h2': [(0, 'Code', CODE(['', '', 'F', '', '24', ''], 4, 'fighter', 'NEXT NUMBER IN LINE', 'AFTER THE YF-23'), ['fighter', 'twenty-four'], SLOT)],
 'h3': [(0, 'Code', CODE(['X', '', '', '', '35', ''], 4, 'fighter', 'THE X-35 KEPT ITS NUMBER'), ['demonstrator', 'kept'], SLOT),
        ('Every letter', 'Kinetic', dict(lines=T('EVERY LETTER AND NUMBER', R('FOLLOWS A SYSTEM'))), ['Every letter', 'system'], TK)],
 'h4': [(0, 'Versus', {}, ['F four H', 'F one ten'], [['whoosh_soft_2', 'ev:0', -16], ['whoosh_soft_3', 'ev:1', -16]])],
 'h4b': [(0, 'Letters', dict(title="THE OLD NAVY NAME: F4H", items=[dict(l='F', m='FIGHTER', kind='fighter'), dict(l='4', m='4TH FROM THE MAKER'), dict(l='H', m='McDONNELL')]), ['F for', 'four for', 'H for'], POP)],
 'h5': [(0, 'Story', STORY('1962 · DEFENSE SECRETARY ROBERT McNAMARA', 'ONE NAMING SYSTEM FOR EVERY SERVICE', 'NAVY · AIR FORCE · ARMY · MARINES', None, 'fighter'), ['McNamara', 'one system'], ST),
        ('and the Phantom', 'Code', CODE(['', '', 'F', '', '4', ''], 4, 'fighter', 'F4H + F-110 → F-4'), ['Phantom', 'F four'], SLOT)],
 'h6': [(0, 'Code', CODE(['', '', 'F', '', '22', 'A'], -1, None, 'ONLY 3 PARTS ARE REQUIRED', 'BASIC MISSION · DESIGN NUMBER · SERIES LETTER', labels=True), ['status', 'modified', 'basic', 'vehicle', 'design', 'series', 'Only the basic'], [['tick_1', 'ev:0', -18], ['tick_2', 'ev:1', -18], ['tick_3', 'ev:2', -18], ['tick_1', 'ev:3', -18], ['tick_2', 'ev:4', -18], ['tick_3', 'ev:5', -18], ['stamp_thud_2', 'ev:6', -14]])],
 'm1': [(0, 'Code', CODE(['', '', 'F', '', '', ''], 2, 'fighter', 'EVERY AIRCRAFT HAS ONE'), ['basic mission'], [['whoosh_soft_1', 'f:0', -16], ['pop_2', 'f:8', -16], ['stamp_thud_2', 'ev:0', -16]])],
 'm2': [(0, 'Letters', dict(title='BASIC MISSION', items=[dict(l='A', m='ATTACK', kind='a10'), dict(l='B', m='BOMBER', kind='wing'), dict(l='C', m='CARGO', kind='cargo'), dict(l='F', m='FIGHTER', kind='fighter')]), ['A is', 'B is', 'C is', 'F is'], POP)],
 'm3': [(0, 'Letters', dict(title='THE RARER ONES', items=[dict(l='E', m='SPECIAL ELECTRONICS', kind='jumbo'), dict(l='P', m='MARITIME PATROL', kind='cargo'), dict(l='S', m='ANTI-SUBMARINE', kind='hornet'), dict(l='T', m='TRAINER', kind='trainer'), dict(l='U', m='UTILITY', kind='u2'), dict(l='X', m='SPECIAL RESEARCH', kind='fighter')]), ['E for', 'P for', 'S for', 'T for', 'U for', 'X for'], POP)],
 'm3b': [(0, 'Letters', dict(title='ON THE LIST · NEVER USED BY THE BOOK', items=[dict(l='K', m='TANKER', dim=False), dict(l='R', m='RECONNAISSANCE')]), ['K for', 'R for'], POP[:2] + [['stamp_thud_1', 'ev:1+20', -16]])],
 'm4': [(0, 'Story', STORY('U-2 · "UTILITY"', 'A SPY PLANE LABELED UTILITY', 'TO HIDE WHAT IT REALLY DID', 'COVER\nSTORY', 'u2'), ['spy plane', 'hide'], ST)],
 'm5': [(0, 'Kinetic', dict(lines=T('ATTACK VS FIGHTER', R('THE LINE HAS BLURRED'))), ['attack', 'blurred'], TK)],
 'm6': [(0, 'Story', STORY('F-117 NIGHTHAWK', 'A "FIGHTER" WITH NO AIR-TO-AIR MISSION', None, None, 'stealth', '#2A2D33'), [], [['whoosh_soft_3', 'f:0', -16], ['tick_2', 'f:10', -18]])],
 'm6b': [(0, 'Story', STORY('JULY 1986 · NEVADA', 'THE SECRET "F-19"?', 'A CRASH SITE SEALED OFF', 'RUMOR', 'stealth', '#2A2D33'), ['sealed off', 'rumors'], ST + [['riser_2s', 'ev:0', -24]])],
 'm6c': [(0, 'Story', STORY('THE TRUTH', 'IT WAS AN F-117', 'NO REAL F-19 HAS EVER BEEN SHOWN', 'STILL CLASSIFIED\nAT THE TIME', 'stealth', '#2A2D33'), ['still classified', 'No real'], ST + [['sub_hit_2', 'f:4', -14]])],
 'm7': [(0, 'Code', CODE(['', '', 'A', '', '10', ''], 2, 'a10', 'THE ONLY PLAIN "A" IN TODAY\'S AIR FORCE'), ['A ten', 'plain'], SLOT)],
 'd1': [(0, 'Code', CODE(['', '?', 'C', '', '130', ''], 1, 'cargo', 'AN EXTRA LETTER = A NEW JOB'), ['extra letter', 'different job'], SLOT)],
 'd2': [(0, 'Morph', dict(base=True), [], [['whoosh_soft_2', 'f:0', -16]])],
 'd3': [(0, 'Morph', {}, ['A in front', 'H makes', 'M makes', 'E makes', 'K makes'], [['stamp_thud_2', 'ev:0', -16], ['pop_1', 'ev:1', -16], ['pop_2', 'ev:2', -16], ['pop_3', 'ev:3', -16], ['stamp_thud_1', 'ev:4', -14]])],
 'd4': [(0, 'Kinetic', dict(lines=T('SAME AIRFRAME', R('ONE LETTER CHANGES THE JOB'))), ['Same airframe', 'One letter'], TK)],
 'd5': [(0, 'Code', CODE(['', 'K', 'C', '', '46', ''], 1, 'jumbo', 'K = TANKER · C = CARGO'), ['K for', 'C for'], SLOT)],
 'd5b': [(0, 'Code', CODE(['', 'W', 'C', '', '130', ''], 1, 'cargo', 'WEATHER RECON · HURRICANE HUNTERS'), ['W is', 'hurricanes'], SLOT)],
 'd5c': [(0, 'Breakers', dict(items=[dict(name='VC-25', why='THE PRESIDENT\'S 747', kind='jumbo'), dict(name='VH-92', why='THE PRESIDENT\'S HELICOPTER', kind='heli')]), ['V C', 'V H'], POP)],
 'd5d': [(0, 'Code', CODE(['', 'L', 'C', '', '130', ''], 1, 'cargo', 'COLD WEATHER · SKIS FOR ICE'), ['L means', 'skis'], SLOT)],
 'd5e': [(0, 'Letters', dict(title='M VS U', items=[dict(l='M', m='COMBAT · SPECIAL OPS', kind='heli'), dict(l='U', m='SUPPORT · UH-60', kind='heli')]), ['M aircraft', 'U aircraft'], POP)],
 'v1': [(0, 'Code', CODE(['', '', 'F', '', '35', ''], 3, 'fighter', 'MOST AIRPLANES LEAVE IT EMPTY'), ['vehicle type', "don't need"], SLOT)],
 'v2': [(0, 'Code', CODE(['', 'A', '', 'H', '64', ''], 3, 'heli', 'ATTACK HELICOPTER'), ['H means', 'attack helicopter'], SLOT)],
 'v3': [(0, 'Code', CODE(['', 'M', '', 'V', '22', ''], 3, 'tilt', 'VERTICAL / SHORT TAKEOFF'), ['V means', 'Osprey'], SLOT)],
 'v4': [(0, 'Code', CODE(['', 'M', '', 'Q', '9', ''], 3, 'drone', 'MULTI-MISSION · UNMANNED · DESIGN 9', order=[1, 3, 4, 0, 2, 5]), ['multi-mission', 'unmanned', 'nine'], [['whoosh_soft_1', 'f:0', -16], ['pop_1', 'ev:0', -16], ['pop_2', 'ev:1', -16], ['pop_3', 'ev:2', -16]])],
 'v5': [(0, 'Letters', dict(title='TWO MORE TYPES', items=[dict(l='S', m='SPACEPLANE'), dict(l='D', m='DRONE GROUND STATION', kind='drone')]), ['spaceplane', 'ground stations'], POP)],
 'p1': [(0, 'Code', CODE(['X', '', 'F', '', '35', ''], 0, 'fighter', 'NOT IN NORMAL SERVICE'), ['status prefix', 'normal service'], SLOT)],
 'p2': [(0, 'Code', CODE(['Y', '', 'F', '', '22', ''], 0, 'fighter', 'YF-22 PROTOTYPE → F-22'), ['Y means', 'entered service'], SLOT)],
 'p3': [(0, 'Letters', dict(title='MORE STATUS PREFIXES', color='#7A5BC4', items=[dict(l='J', m='SPECIAL TEST · TEMPORARY'), dict(l='N', m='SPECIAL TEST · PERMANENT'), dict(l='G', m='PERMANENTLY GROUNDED')]), ['J and', 'permanent', 'G means'], POP)],
 'n1': [(0, 'Code', CODE(['', '', 'F', '', '4', ''], 4, 'fighter', 'COUNTS RESTARTED IN 1962'), ['design number', 'restarted'], SLOT)],
 'n2': [(0, 'SeriesRow', {}, ['letters I'], [['pop_1', 'f:4', -20], ['pop_2', 'f:14', -20], ['pop_3', 'f:24', -20], ['marker_scribble', 'ev:0', -16]])],
 'n3': [(0, 'Story', STORY('F-4 PHANTOM II', 'THERE WAS NEVER AN F-4H', 'TOO CLOSE TO ITS OLD NAVY NAME: F4H', None, 'fighter'), ['old Navy'], ST)],
 'n4': [(0, 'Kinetic', dict(lines=T('13', R('SKIPPED IN MANY SERIES'))), ['thirteen', 'superstition'], TK)],
 'x1': [(0, 'Kinetic', dict(lines=T('THE RULE', R('BREAKERS'))), ['rule', 'breakers'], [['whoosh_hard_2', 'f:0', -14], ['stamp_thud_2', 'ev:1', -12]])],
 'x2': [(0, 'Story', STORY('SR-71 BLACKBIRD', '"RS-71" → "SR-71"', 'CURTIS LeMAY PREFERRED "STRATEGIC RECONNAISSANCE"', None, 'blackbird', '#1E1F22'), ['LeMay', 'stuck'], ST)],
 'x3': [(0, 'Code', CODE(['', '', 'B', '', '21', ''], 4, 'wing', 'NEXT IN LINE WAS B-3'), ['twenty-first', 'three'], SLOT)],
 'x3b': [(0, 'Code', CODE(['', 'M', '', 'V', '75', ''], 4, 'tilt', 'THE ARMY · FOUNDED 1775'), ['seventy-five', 'seventeen'], SLOT)],
 'x4': [(0, 'Code', CODE(['', '', 'T', '', '6', ''], 4, 'trainer', 'SKIPPED T-4 AND T-5'), ['skipped', 'tribute'], SLOT)],
 'x5': [(0, 'Code', CODE(['', '', 'F', '', '47', ''], 4, 'fighter', 'P-47 THUNDERBOLT · 1947'), ['P forty-seven', 'founded'], SLOT)],
 'x5b': [(0, 'Code', CODE(['', 'K', 'C', '', '767', ''], 4, 'jumbo', "BOEING'S MODEL NUMBER"), ['seven sixty-seven', 'model number'], SLOT)],
 'x6': [(0, 'Story', STORY('F/A-18 HORNET', "A SLASH THE RULES DON'T ALLOW", 'BY THE BOOK: AF-18', 'AF-18', 'hornet'), ['slash', 'A F eighteen'], ST)],
 'e1': [(0, 'Code', CODE(['', 'M', '', 'Q', '9', 'A'], -1, 'drone', 'MULTI-MISSION · UNMANNED · DESIGN 9 · FIRST VERSION', order=[1, 3, 4, 5, 0, 2]), ['Multi-mission', 'Unmanned', 'Design nine', 'First version'], [['pop_1', 'ev:0', -16], ['pop_2', 'ev:1', -16], ['pop_3', 'ev:2', -16], ['stamp_thud_2', 'ev:3', -14]])],
 'e2': [(0, 'Cross', {}, ['F thirty-five'], [['marker_scribble', 'ev:0', -16]])],
 'e3': [(0, 'Outro', {}, [], [['pop_1', 'f:6', -18]])],
}
STEPOF = {'h': -1, 'm': 2, 'd': 1, 'v': 3, 'p': 0, 'n': 4, 'x': 6, 'e': 6}

norm = lambda w: re.sub(r"[^a-z0-9']", '', w.lower())
def word_times(path, text, lead):
    segs, _ = asr.transcribe(path, language='en', word_timestamps=True)
    ws = [w for s in segs for w in s.words]
    sw = text.split()
    times = []
    for k in range(len(sw)):
        j = min(len(ws) - 1, round(k * (len(ws) - 1) / max(1, len(sw) - 1))) if ws else 0
        times.append(lead + (ws[j].start if ws else k * 0.3))
    return sw, times

beats, shots, t = [], [], 0
for idx, lid in enumerate(ORDER):
    path = os.path.join(VO, f'{lid}.wav')
    info = sf.info(path)
    vo = info.frames / info.samplerate
    lead = 0.08
    nxt = ORDER[idx + 1] if idx + 1 < len(ORDER) else None
    tail = 0.6 if (nxt and nxt[0] != lid[0]) else 0.3
    if lid == 'e3': tail = 3.0
    dur = round((lead + vo + tail) * FPS)
    text = LINES[lid]
    sw, times = word_times(path, text, lead)
    low = [norm(w) for w in sw]
    def frame_of(phrase):
        ph = [norm(w) for w in phrase.split()]
        for k in range(len(low)):
            if low[k:k + len(ph)] == ph:
                return t + round(times[k] * FPS)
        for k in range(len(low)):  # first-word fallback
            if low[k].startswith(ph[0]):
                return t + round(times[k] * FPS)
        raise AssertionError((lid, phrase, text))
    cuts = SPEC[lid]
    starts = [t if c[0] == 0 else frame_of(c[0]) - 5 for c in cuts]
    for k, (_, scene, props, events, sfx) in enumerate(cuts):
        s = starts[k]
        e = starts[k + 1] if k + 1 < len(cuts) else t + dur
        ev = [max(0, frame_of(p) - s) for p in events]
        props = dict(props, ev=ev)
        cues = []
        for fn, when, g in sfx:
            kind, expr = when.split(':', 1)
            if kind == 'f':
                off = int(expr)
            else:
                m = re.match(r'(\d+)([+-]\d+)?', expr)
                i = int(m.group(1))
                if i >= len(ev): continue
                off = ev[i] + (int(m.group(2)) if m.group(2) else 0)
            cues.append(dict(file=fn, frame=s + off, gain=g))
        shots.append(dict(id=f'{lid}.{k}', beat=lid, scene=scene, props=props, step=STEPOF[lid[0]], **{'from': s}, dur=e - s, cues=cues))
    beats.append(dict(id=lid, **{'from': t}, dur=dur, voStart=t + round(lead * FPS), vo=os.path.relpath(path, ROOT), voDur=round(vo, 3)))
    t += dur
for a, b in zip(shots, shots[1:]):
    assert b['from'] == a['from'] + a['dur'], ('gap', a['id'], b['id'])
json.dump(dict(fps=FPS, total=t, beats=beats, shots=shots), open(os.path.join(ROOT, '07_render', 'src', 'aircraft', 'edl.json'), 'w'), indent=1)
lens = sorted(s['dur'] / FPS for s in shots)
print(f"{len(shots)} shots, {t / FPS:.1f}s; median shot {lens[len(lens) // 2]:.1f}s, max {lens[-1]:.1f}s")

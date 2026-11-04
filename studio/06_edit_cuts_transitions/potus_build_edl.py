"""Edit for 'How Presidential Protection Actually Work' (v3 competitor format).
SPEC[line_id] = list of cuts: (at, scene, props, events, sfx)
  at     = 0 or phrase in the VO text where the cut lands
  events = phrases; each becomes a frame offset (relative to the cut) in props['ev'] -> on-screen text enters exactly as it is said
  sfx    = [file, 'ev:i' | 'f:N' | 'p:X', gain]  ('ev:i' = on event i)
STEP[line_id] = HUD step index (-1 = none).  Writes 07_render/src/armor/edl.json"""
import json, os, re
import soundfile as sf
FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LINES = {l['id']: l['text'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'potus', 'vo_lines.json')))}
ORDER = [l['id'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'potus', 'script.json')))['lines']]
VO = os.path.join(ROOT, '03_voiceover', 'potus', 'final')
T = lambda *ls: [dict(t=l) if isinstance(l, str) else l for l in ls]
R = lambda t, **k: dict(t=t, red=True, **k)
POP = [['pop_1', 'ev:0', -18], ['pop_2', 'ev:1', -18], ['pop_3', 'ev:2', -18], ['pop_1', 'ev:3', -18]]
TK = [['tick_1', 'ev:0', -19], ['tick_2', 'ev:1', -19], ['tick_3', 'ev:2', -19], ['tick_1', 'ev:3', -19]]
LAD = lambda i, frm=None: ('Rings', dict(focus=i, **({'from': frm} if frm is not None else {})), [], [['whoosh_hard_2', 'f:0', -16], ['reverse_swell_1s', 'f:0', -18], ['stamp_thud_2', 'f:22', -18]])
SHOOT = lambda: [['glass_shatter_1', 'ev:0', -14], ['sub_hit_1', 'ev:0', -16], ['stamp_thud_1', 'ev:0+4', -16]]

SPEC = {
 'a01': [(0, 'Rings', dict(focus=-1), [], [['whoosh_hard_1', 'f:0', -14], ['sub_hit_1', 'f:4', -14]]),
         ('and anyone who', 'TextSlide', dict(lines=T(R('8 LAYERS'), 'BETWEEN THE PRESIDENT', 'AND ANYONE WHO', 'WANTS TO HURT HIM')), ['and anyone', 'wants to hurt'], TK)],
 'a02': [(0, 'Airspace', dict(stage='outer'), [], [['whoosh_soft_1', 'f:0', -16]]),
         ('The last one', 'TextSlide', dict(lines=T('THE LAST ONE', R('IS A PERSON'))), ['The last one', 'a person'], TK + [['sub_hit_2', 'ev:1', -14]])],
 's1a': [(0, *LAD(0, -1))],
 's1b': [(0, 'Airspace', dict(stage='outer'), [], [['whoosh_soft_2', 'f:0', -16], ['tick_1', 'f:12', -16]])],
 's1c': [(0, 'Airspace', dict(stage='inner'), ['second ring', 'banned'], [['pop_1', 'ev:0', -16], ['stamp_thud_1', 'ev:1', -16]])],
 's1d': [(0, 'Airspace', dict(stage='intercept'), ['writes the rules', 'enforces'], [['tick_2', 'ev:0', -16], ['whoosh_hard_2', 'ev:1', -14]])],
 's1e': [(0, 'Airspace', dict(stage='count'), ['more than forty'], [['paper_slide', 'f:0', -18], ['counter_tick_loop', 'ev:0', -22], ['whoosh_soft_3', 'f:20', -16]])],
 's2a': [(0, *LAD(1, 0))],
 's2b': [(0, 'TextSlide', dict(lines=T('THE ADVANCE TEAM', R('GETS THERE FIRST'))), ['advance team', 'gets there first'], TK),
         ('For a campaign', 'LeadTime', {}, ['three to five', 'a month'], [['whoosh_soft_1', 'ev:0', -18], ['whoosh_soft_2', 'ev:1', -18]])],
 's2c': [(0, 'Checklist', dict(title='THEY WALK EVERY PLACE HE MIGHT GO', items=[dict(icon='hotel', l='THE HOTEL'), dict(icon='road', l='THE ROUTE'), dict(icon='hospital', l='THE HOSPITAL'), dict(icon='restroom', l='THE BATHROOMS')]), ['The hotel', 'the route', 'nearest hospital', 'bathrooms'], POP + [['tick_2', 'ev:3+8', -16]])],
 's2d': [(0, 'TextSlide', dict(kicker='THE LEAD AGENT', lines=T('WRITES THE SECURITY PLAN', R('EVERY LAYER FOLLOWS'))), ['lead agent', 'every other layer'], TK + [['paper_slide', 'f:0', -18]])],
 's3a': [(0, *LAD(2, 1))],
 's3b': [(0, 'Rooftop', dict(mode='watch'), ['long range'], [['whoosh_soft_3', 'f:0', -18], ['click_1', 'ev:0', -16]])],
 's3c': [(0, 'TextSlide', dict(lines=T('WHAT HAPPENS', R('WHEN ONE FAILS'))), ['what happens', 'when one fails'], TK),
         ('On July 13', 'Rooftop', dict(mode='butler'), ['climbed', 'about one hundred'], [['paper_slide', 'f:0', -18], ['marker_scribble', 'ev:1', -18]])],
 's3d': [(0, 'Rooftop', dict(mode='shots'), ['Eight shots'], [['stamp_thud_1', 'f:4', -12], ['glass_shatter_1', 'ev:0', -18], ['glass_shatter_2', 'ev:0+8', -18], ['glass_shatter_3', 'ev:0+16', -18], ['sub_hit_1', 'ev:0+40', -14]])],
 's3e': [(0, 'TextSlide', dict(kicker="THE AGENCY'S OWN REVIEW", lines=T('FAILURES IN', R('ADVANCE PLANNING'), R('& COMMUNICATION'))), ["agency's own", 'advance planning', 'communication'], TK)],
 's4a': [(0, *LAD(3, 2))],
 's4b': [(0, 'Magnetometer', {}, ['Staff', 'guests', 'reporters', 'No exceptions'], [['click_1', 'ev:0+20', -16], ['click_2', 'ev:1+20', -16], ['click_1', 'ev:2+20', -16], ['stamp_thud_2', 'ev:3', -12]])],
 's5a': [(0, *LAD(4, 3))],
 's5b': [(0, 'Motorcade', {}, ['close the roads', 'counter assault', 'an ambulance'], [['whoosh_hard_1', 'f:0', -18], ['tick_1', 'ev:0', -16], ['tick_2', 'ev:1', -16], ['tick_3', 'ev:2', -16]])],
 's5c': [(0, 'Motorcade', dict(focus='cat'), ['they fight'], [['whoosh_soft_4', 'f:0', -18], ['stamp_thud_1', 'ev:0', -16]])],
 's6a': [(0, *LAD(5, 4))],
 's6b': [(0, 'Beast', dict(labels=['SPECS: CLASSIFIED'], stamp=True), [], [['stamp_thud_1', 'f:8', -12]]),
         ('but reports describe', 'Beast', dict(labels=['DOORS ≈ 8 INCHES THICK', 'STEEL · ALUMINUM · TITANIUM · CERAMIC']), ['doors about', 'built from'], TK)],
 's6c': [(0, 'Beast', dict(labels=['≈ 8 TONS']), [], [['sub_hit_2', 'f:6', -14]])],
 's6d': [(0, 'Beast', dict(labels=["THE PRESIDENT'S BLOOD TYPE", 'IN THE TRUNK'], blood=True), ['supply', 'in case'], [['pop_2', 'ev:0', -14], ['tick_2', 'ev:1', -16]])],
 's7a': [(0, *LAD(6, 5))],
 's7b': [(0, 'TextSlide', dict(lines=T('ROTATING SHIFTS', R('A CODE NAME ON THE RADIO'))), ['rotating shifts', 'code name'], TK)],
 's7c': [(0, 'CodeNames', dict(who=True), ['does not pick', 'White House'], [['stamp_thud_2', 'ev:0', -14], ['whoosh_soft_1', 'ev:1', -16]])],
 's7d': [(0, 'CodeNames', {}, ['Renegade', 'Mogul', 'Celtic'], POP)],
 's8a': [(0, *LAD(7, 6))],
 's8b': [(0, 'TextSlide', dict(lines=T('WHEN EVERY LAYER FAILS', R("WHAT'S LEFT IS"), R("AN AGENT'S BODY"))), ['When every', 'what is left', "agent's body"], TK + [['sub_hit_1', 'ev:2', -14]])],
 's8c': [(0, 'Shield', dict(phase=0), ['shots were fired'], [['paper_slide', 'f:0', -18], ['glass_shatter_1', 'ev:0', -16]])],
 's8d': [(0, 'Shield', dict(phase=1), ['spread his body', 'He was shot'], [['whoosh_soft_2', 'f:0', -16], ['glass_shatter_2', 'ev:0', -16], ['sub_hit_2', 'ev:1', -12]])],
 's8e': [(0, 'CoinFlip', {}, ['He survived', 'not even supposed'], [['tick_1', 'ev:0', -16], ['whoosh_soft_3', 'ev:1', -18], ['click_2', 'ev:1+36', -12], ['stamp_thud_1', 'ev:1+40', -14]])],
 'e1': [(0, 'Rings', dict(focus=-1, outro=True), [], [['whoosh_hard_1', 'f:0', -16]]),
        ('eight layers of people', 'TextSlide', dict(lines=T('60 NM OF CLOSED SKY', '8 LAYERS OF PEOPLE & STEEL', R('AND AT THE CENTER:'), R('A COIN FLIP'))), ['Sixty', 'eight layers', 'at the very center', 'a coin flip'], TK + [['stamp_thud_2', 'ev:3', -12]])],
 'e2': [(0, 'Outro', {}, [], [['pop_1', 'f:6', -18]])],
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
    if lid == 'e2':
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
json.dump(dict(fps=FPS, total=t, beats=beats, shots=shots), open(os.path.join(ROOT, '07_render', 'src', 'potus', 'edl.json'), 'w'), indent=1)
evs = []
for s in shots:
    evs += [s['from'] + x for x in s['props']['ev']] + [s['from']]
evs = sorted(set(evs)); gaps = [(b - a) / FPS for a, b in zip(evs, evs[1:])]
print(f"{len(shots)} shots, {t / FPS:.1f}s; shot median {lens[len(lens) // 2]:.1f}s max {lens[-1]:.1f}s; visual events {len(evs)} = {len(evs) / (t / FPS) * 60:.0f}/min; longest event gap {max(gaps):.1f}s")

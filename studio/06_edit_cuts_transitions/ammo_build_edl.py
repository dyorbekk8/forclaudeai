"""Edit for 'Every Military Ammo Color Explained' (v3 competitor format).
SPEC[line_id] = list of cuts: (at, scene, props, events, sfx)
  at     = 0 or phrase in the VO text where the cut lands
  events = phrases; each becomes a frame offset (relative to the cut) in props['ev'] -> on-screen text enters exactly as it is said
  sfx    = [file, 'ev:i' | 'f:N' | 'p:X', gain]  ('ev:i' = on event i)
STEP[line_id] = HUD step index (-1 = none).  Writes 07_render/src/armor/edl.json"""
import json, os, re
import soundfile as sf
FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LINES = {l['id']: l['text'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'ammo', 'vo_lines.json')))}
ORDER = [l['id'] for l in json.load(open(os.path.join(ROOT, '02_scripts', 'ammo', 'script.json')))['lines']]
VO = os.path.join(ROOT, '03_voiceover', 'ammo', 'final')
T = lambda *ls: [dict(t=l) if isinstance(l, str) else l for l in ls]
R = lambda t, **k: dict(t=t, red=True, **k)
POP = [['pop_1', 'ev:0', -18], ['pop_2', 'ev:1', -18], ['pop_3', 'ev:2', -18], ['pop_1', 'ev:3', -18]]
TK = [['tick_1', 'ev:0', -19], ['tick_2', 'ev:1', -19], ['tick_3', 'ev:2', -19], ['tick_1', 'ev:3', -19]]

LU = lambda i, frm: ('Lineup', dict(focus=i, **({'from': frm} if frm is not None else {})), [], [['whoosh_soft_1', 'f:2', -16], ['pop_2', 'f:24', -16]])
HERO = lambda i, facts=None, stamp=None, ev=(): ('Hero', dict(item=i, facts=facts or [], **({'stamp': stamp} if stamp else {})), list(ev), [['stamp_thud_2', 'f:12', -16]] + [['tick_1', f'ev:{k}', -18] for k in range(1, 4)])
SPEC = {
 'o1': [(0, 'Lineup', dict(focus=-1), [], [['whoosh_hard_1', 'f:0', -14], ['pop_1', 'f:3', -20], ['pop_2', 'f:9', -20], ['pop_3', 'f:15', -20], ['pop_1', 'f:21', -20]]),
        ('And on its own', 'Hero', dict(item=0, facts=[]), ['means almost nothing'], [['whoosh_soft_2', 'f:0', -16], ['stamp_thud_1', 'ev:0', -14]])],
 'o2': [(0, 'Kinetic', dict(item=0, kicker='MIL-STD-709', lines=T("IT'S ONLY THE BASE COAT", R('THE MESSAGE IS THE STRIPE'))), ['base coat', 'the real message'], TK + [['paper_slide', 'f:0', -18]])],
 'o3': [(0, 'Tiers', {}, ['twenty millimeters', 'Smaller bullets'], [['pop_1', 'ev:0', -16], ['pop_2', 'ev:1', -16]])],
 'o4': [(0, 'Kinetic', dict(lines=T('READ THE STRIPES', R("AND THE BOMB TELLS YOU WHAT'S INSIDE"))), ['read the stripes', 'exactly'], TK)],
 'y1': [(0, *LU(1, -1)), ('high explosive', *HERO(1, facts=['THE BLAST'], ev=['high explosive']))],
 'y2': [(0, 'Filler', {}, ['Almost two hundred'], [['whoosh_soft_3', 'f:0', -16], ['counter_tick_loop', 'ev:0', -24], ['stamp_thud_2', 'ev:0+30', -16]])],
 'y3': [(0, 'BombBands', dict(mode='live'), ['yellow band', 'three inches'], [['marker_scribble', 'ev:0', -18], ['tick_2', 'ev:1', -16]])],
 'y4': [(0, 'Kinetic', dict(item=1, lines=T('TWO YELLOW BANDS', R('HAVE A STORY'))), ['two yellow', 'a story'], TK + [['reverse_swell_1s', 'ev:1-20', -20]])],
 'y5': [(0, 'Forrestal', {}, ['a fire broke out', 'exploded'], [['heat_rise', 'ev:0', -20], ['alarm_bell_distant', 'ev:0+20', -26], ['sub_hit_1', 'ev:1', -10], ['glass_shatter_1', 'ev:1', -16]])],
 'y6': [(0, 'CookOff', {}, ['After that', 'several minutes'], [['tick_1', 'ev:0', -16], ['riser_2s', 'ev:1-40', -24], ['pop_2', 'ev:1', -16]])],
 'y7': [(0, 'BombBands', dict(mode='thermal'), ['two yellow', 'buy you time'], [['marker_scribble', 'ev:0', -18], ['stamp_thud_1', 'ev:1', -12]])],
 'b1': [(0, *LU(2, 1)), ('low explosive', *HERO(2, facts=['THE PUSH'], ev=['low explosive']))],
 'b2': [(0, 'Kinetic', dict(item=2, lines=T('NOT THE BLAST', R('THE PUSH'))), ['Not the blast', 'The push'], TK)],
 'b3': [(0, 'BurnVsBlast', {}, ['burns', 'detonates'], [['heat_rise', 'ev:0', -20], ['sub_hit_1', 'ev:1', -14]])],
 'b4': [(0, 'Kinetic', dict(lines=T('CONTROLLED PRESSURE', R('VS SHATTERING FORCE'))), ['controlled', 'shattering'], TK + [['sub_hit_2', 'ev:1', -16]])],
 'b5': [(0, 'BombBands', dict(mode='brown'), ['motor is live', 'warhead'], [['marker_scribble', 'ev:0', -18], ['tick_2', 'ev:1', -16]])],
 'u1': [(0, *LU(3, 2)), ('means practice', *HERO(3, facts=['TRAINING ROUNDS'], ev=['practice']))],
 'u2': [(0, 'Practice', dict(mode='drop', nopuff=True), [], [['whoosh_soft_1', 'f:0', -16]])],
 'u3': [(0, 'Kinetic', dict(item=3, lines=T('BLUE DOES NOT MEAN', R('HARMLESS'))), ['blue does not', 'harmless'], TK),
        ('Inside is', 'Practice', dict(mode='drop'), ['puff of smoke'], [['riser_2s', 'f:0', -24], ['sub_hit_2', 'ev:0', -14], ['whoosh_soft_4', 'ev:0', -16]])],
 'u4': [(0, 'A10Drop', {}, ['hit a bird', 'northern Florida'], [['whoosh_hard_2', 'f:0', -18], ['glass_shatter_2', 'ev:0', -18], ['whoosh_soft_3', 'ev:0+6', -16], ['pop_1', 'ev:1', -16]])],
 'u5': [(0, 'Rules', dict(title="THE AIR FORCE'S ADVICE", items=["DON'T APPROACH IT", 'MARK THE SPOT', 'CALL IT IN']), ["approach", 'Mark the spot', 'call it in'], POP)],
 'u6': [(0, 'Practice', dict(mode='ranges'), ['right now'], [['counter_tick_loop', 'f:4', -22], ['stamp_thud_1', 'ev:0', -12]])],
 'g1': [(0, *LU(4, 3)), ('means smoke', *HERO(4, facts=['HIDE · MARK'], ev=['smoke']))],
 'g2': [(0, 'Smoke', {}, ['Screening', 'marking smoke'], [['water_spray_burst', 'ev:0', -22], ['water_spray_burst', 'ev:1', -22]])],
 'g3': [(0, 'M18', dict(mode='four'), ['red', 'yellow', 'green', 'violet', 'about a minute'], POP + [['tick_2', 'ev:4', -16]])],
 'g4': [(0, 'M18', dict(mode='violet'), ['toxic', 'safer version'], [['stamp_thud_1', 'ev:0', -12], ['pop_2', 'ev:1', -16]])],
 'g5': [(0, 'Kinetic', dict(item=4, lines=T('BUILT TO HIDE THINGS', R('NOT DESTROY THEM'))), ['to hide', 'not to destroy'], TK)],
 'w1': [(0, *LU(5, 4)), ('means illumination', *HERO(5, facts=['LIGHTS THE NIGHT'], ev=['illumination']))],
 'w2': [(0, 'Illum', {}, ['pushes out a flare', 'parachute'], [['whoosh_hard_2', 'f:0', -18], ['pop_3', 'ev:0', -14], ['reverse_swell_1s', 'ev:1', -20]])],
 'w3': [(0, 'Stat', dict(value='1,000,000', label='CANDLEPOWER', sub='FOR ≈ 2 MINUTES · 155 MM ROUND', item=5), ['one million', 'two minutes'], [['sub_hit_2', 'ev:0', -14], ['tick_1', 'ev:1', -16]])],
 'w4': [(0, 'Illum', dict(lit=True), ['few square'], [['reverse_swell_1s', 'f:0', -20]])],
 'k1': [(0, *LU(6, 5)), ('armor defeating', *HERO(6, facts=['PUNCHES THROUGH TANKS'], ev=['armor defeating']))],
 'k2': [(0, 'Punch', {}, ['go through tanks'], [['whoosh_hard_1', 'ev:0-8', -14], ['glass_shatter_1', 'ev:0', -14], ['sub_hit_1', 'ev:0', -12]])],
 'k3': [(0, 'Stat', dict(value='1,500+ M/S', label='TANK SABOT · MUZZLE VELOCITY', sub='A DENSE METAL DART · NO EXPLOSIVE', item=6), ['over fifteen', 'dense metal dart'], [['whoosh_hard_2', 'ev:0', -14], ['tick_2', 'ev:1', -16]])],
 'k4': [(0, 'Kinetic', dict(item=6, lines=T('SAME IDEA AS A', R('BLACK-TIP BULLET'))), ['same idea', 'black tip'], TK)],
 'r1': [(0, *LU(7, 6)), ('nobody wants', 'Kinetic', dict(item=7, lines=T('THE ONE', R('NOBODY WANTS TO SEE'))), ['nobody'], [['reverse_swell_1s', 'f:0', -18]]), ('A gray body', *HERO(7, facts=['THE BAND SAYS WHICH'], ev=['chemical']))],
 'r2': [(0, 'Chem', dict(mode='bands'), ['Dark red', 'Violet', 'Dark green'], [['marker_scribble', 'ev:0', -18], ['marker_scribble', 'ev:1', -18], ['marker_scribble', 'ev:2', -18], ['sub_hit_2', 'ev:2', -16]])],
 'r3': [(0, 'Chem', dict(mode='binary'), ['broken into', 'two chemicals'], [['tick_1', 'ev:0', -16], ['stamp_thud_2', 'ev:0+20', -14], ['whoosh_soft_2', 'ev:1', -16], ['sub_hit_1', 'ev:1+44', -14]])],
 'r4': [(0, 'DateCard', dict(date='M687 · BINARY SARIN SHELL', place='PRODUCED FROM 1987', stamp='NEVER USED\nIN COMBAT', item=7), ['never used'], [['paper_slide', 'f:0', -18], ['stamp_thud_1', 'ev:0', -12]])],
 'r5': [(0, 'DateCard', dict(date='JULY 7, 2023', place='BLUE GRASS ARMY DEPOT, KENTUCKY', stamp="LAST DECLARED U.S.\nCHEMICAL WEAPON\nDESTROYED"), ['destroyed the last'], [['paper_slide', 'f:0', -18], ['stamp_thud_2', 'ev:0', -12]])],
 'r6': [(0, 'Kinetic', dict(item=7, lines=T('NOW MOSTLY', R('A COLOR IN A MANUAL'))), ['gray shell', 'manual'], TK)],
 'e1': [(0, 'Fade', {}, ['never proof'], [['paper_slide', 'f:0', -18], ['stamp_thud_1', 'ev:0', -12]])],
 'e2': [(0, 'Lineup', dict(focus=-1, labels=True), ['yellow is', 'Brown is', 'Blue is', 'Green is', 'White is', 'Black is', 'gray is'], [['tick_1', 'ev:0', -18], ['tick_2', 'ev:1', -18], ['tick_3', 'ev:2', -18], ['tick_1', 'ev:3', -18], ['tick_2', 'ev:4', -18], ['tick_3', 'ev:5', -18], ['stamp_thud_2', 'ev:6', -14]])],
 'e3': [(0, 'Outro', {}, [], [['pop_1', 'f:6', -18]])],
}
STEP = {}
cur = -1
for lid in ORDER:
    STEP[lid] = 'oybugwkr'.index(lid[0]) if lid[0] in 'oybugwkr' else -1

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
    tail = 0.4 if (nxt and nxt.endswith('1') and nxt[0] != lid[0]) else 0.12
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
json.dump(dict(fps=FPS, total=t, beats=beats, shots=shots), open(os.path.join(ROOT, '07_render', 'src', 'ammo', 'edl.json'), 'w'), indent=1)
evs = []
for s in shots:
    evs += [s['from'] + x for x in s['props']['ev']] + [s['from']]
evs = sorted(set(evs)); gaps = [(b - a) / FPS for a, b in zip(evs, evs[1:])]
print(f"{len(shots)} shots, {t / FPS:.1f}s; shot median {lens[len(lens) // 2]:.1f}s max {lens[-1]:.1f}s; visual events {len(evs)} = {len(evs) / (t / FPS) * 60:.0f}/min; longest event gap {max(gaps):.1f}s")

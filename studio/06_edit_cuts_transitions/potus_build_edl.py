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
from PIL import Image
PHOTO_DIR = os.path.join(ROOT, '07_render', 'public', 'photos', 'potus')
CRED = {
 'n1_obama_inaugural_walk_agents': 'Photo: SSgt Timothy Kingston, U.S. Army (public domain)',
 'n1_obama_secret_service_detail': 'Photo: Marc Nozell, CC BY 2.0, via Wikimedia Commons',
 'n2_motorcade_inauguration_2017': 'Photo: Cpl. Timothy Turner, USMC (public domain)',
 'n2_motorcade_2021': 'Photo: U.S. Customs and Border Protection (public domain)',
 'n4_counter_sniper_a': 'Photo: Carlos Guerra, U.S. Secret Service (public domain)',
 'n4_counter_sniper_b': 'Photo: Carlos Guerra, U.S. Secret Service (public domain)',
 'n5_uniformed_division_screening_a': 'Photo: U.S. Department of Homeland Security (public domain)',
 'n6_f16_escorts_su27': 'Photo: TSgt Fernando Serna, U.S. Air Force (public domain)',
 'n6_f15_eagle': 'Photo: U.S. Air Force (public domain)',
 'n7_air_force_one_rushmore': 'Photo: U.S. Air Force (public domain)',
 'n8_hilton_1981_chaos': 'Photo: Michael Evans, White House (public domain)',
 'n8_washington_hilton_today': 'Photo: APK, CC BY-SA 3.0, via Wikimedia Commons',
 'n10_white_house_from_monument': 'Photo: G. Edward Johnson, CC BY 4.0, via Wikimedia Commons',
}
def P(slug, **k):
    w, h = Image.open(os.path.join(PHOTO_DIR, slug + '.jpg')).size
    return dict(src=slug + '.jpg', w=w, h=h, credit=CRED[slug], **k)
CO = lambda u, v, l, e=None, **k: dict(u=u, v=v, l=l, **({'e': e} if e is not None else {}), **k)
LAD = lambda i: ('LayerCard', dict(i=i), [], [['whoosh_hard_2', 'f:0', -14], ['sub_hit_1', 'f:2', -14], ['stamp_thud_2', 'f:14', -16]])
SHOOT = lambda: [['glass_shatter_1', 'ev:0', -14], ['sub_hit_1', 'ev:0', -16], ['stamp_thud_1', 'ev:0+4', -16]]
BLIP = [['tick_1', 'f:10', -20], ['tick_2', 'f:40', -22], ['tick_3', 'f:70', -22]]

SPEC = {
 'a01': [(0, 'PhotoShot', P('n1_obama_inaugural_walk_agents', focus=[50, 45], zoom=[1.04, 1.16], callouts=[CO(0.50, 0.60, 'THE PRESIDENT', 0, ring=90, dx=170, dy=150), CO(0.07, 0.45, 'AGENT', 1, ring=60, dx=120, dy=-120), CO(0.86, 0.22, 'AGENT', 2, ring=60, dx=-130, dy=130)]), ['President', 'United States', 'anyone'], [['whoosh_hard_1', 'f:0', -14], ['sub_hit_1', 'f:2', -14], ['pop_1', 'ev:0+8', -16], ['pop_2', 'ev:1+8', -16], ['pop_3', 'ev:2+8', -16]]),
         ('wants to hurt', 'Kinetic', dict(lines=T(R('8 LAYERS'), 'BETWEEN HIM AND', 'ANYONE WHO WANTS TO HURT HIM')), [], [['whoosh_soft_1', 'f:0', -16], ['stamp_thud_2', 'f:2', -14]])],
 'a02': [(0, 'Radar', dict(stage='diam'), [], [['whoosh_soft_1', 'f:0', -16], ['riser_2s', 'f:0', -22]] + BLIP),
         ('The last one', 'Kinetic', dict(bg='n1_obama_secret_service_detail.jpg', lines=T('THE LAST ONE', R('IS A PERSON'))), ['The last one', 'a person'], TK + [['sub_hit_2', 'ev:1', -14]])],
 's1a': [(0, *LAD(0))],
 's1b': [(0, 'PhotoShot', P('n7_air_force_one_rushmore', focus=[50, 40], zoom=[1.02, 1.14], pan=[-40, 0], pos='tl', kicker='WHEREVER HE GOES', lines=T('THE AIRSPACE', R('CLOSES'))), ['the airspace', 'closes'], [['whoosh_soft_2', 'f:0', -16], ['tick_1', 'ev:0', -18], ['stamp_thud_1', 'ev:1', -16]]),
         ('A restricted ring', 'Radar', dict(stage='outer'), [], [['whoosh_soft_3', 'f:0', -16]] + BLIP)],
 's1c': [(0, 'Radar', dict(stage='inner'), ['second ring', 'banned'], [['pop_1', 'ev:0', -16], ['stamp_thud_1', 'ev:1', -14]])],
 's1d': [(0, 'Radar', dict(stage='intercept'), ['writes the rules', 'enforces'], [['tick_2', 'ev:0', -16], ['alarm_bell_distant', 'ev:0+16', -26], ['whoosh_hard_2', 'ev:1', -14]]),
         ('with fighter jets', 'PhotoShot', P('n6_f16_escorts_su27', focus=[50, 50], zoom=[1.05, 1.2], pan=[60, 0], tag='ARCHIVE · F-16 ESCORTING AN AIRCRAFT', lines=T(R('WITH FIGHTER JETS'))), ['fighter jets'], [['whoosh_hard_1', 'f:0', -14], ['sub_hit_2', 'f:2', -16]])],
 's1e': [(0, 'Radar', dict(stage='count'), ['more than forty'], [['paper_slide', 'f:0', -18], ['counter_tick_loop', 'ev:0', -22], ['stamp_thud_2', 'ev:0+48', -14]])],
 's2a': [(0, *LAD(1))],
 's2b': [(0, 'PhotoShot', P('n4_counter_sniper_a', focus=[50, 40], zoom=[1.04, 1.18], kicker='SECRET SERVICE ADVANCE', lines=T('THE ADVANCE TEAM', R('GETS THERE FIRST')), callouts=[CO(0.66, 0.74, 'K9 SWEEP', 1, ring=80, dx=-160, dy=-150)]), ['advance team', 'gets there first'], TK + [['pop_2', 'ev:1+8', -16]]),
         ('For a campaign', 'LeadTime', {}, ['three to five', 'a month'], [['whoosh_soft_1', 'ev:0', -18], ['whoosh_soft_2', 'ev:1', -18]])],
 's2c': [(0, 'Checklist', dict(title='THEY WALK EVERY PLACE HE MIGHT GO', items=[dict(icon='hotel', l='THE HOTEL'), dict(icon='road', l='THE ROUTE'), dict(icon='hospital', l='THE HOSPITAL'), dict(icon='restroom', l='THE BATHROOMS')]), ['The hotel', 'the route', 'nearest hospital', 'bathrooms'], POP + [['tick_2', 'ev:3+8', -16]])],
 's2d': [(0, 'PhotoShot', P('n5_uniformed_division_screening_a', focus=[50, 35], zoom=[1.06, 1.2], kicker='THE LEAD AGENT', lines=T('WRITES THE SECURITY PLAN', R('EVERY LAYER FOLLOWS'))), ['lead agent', 'every other layer'], TK + [['paper_slide', 'f:0', -18]])],
 's3a': [(0, *LAD(2))],
 's3b': [(0, 'Tactical', dict(mode='watch'), ['long range'], [['whoosh_soft_3', 'f:0', -18], ['click_1', 'ev:0', -16], ['click_2', 'ev:0+8', -18]])],
 's3c': [(0, 'Kinetic', dict(lines=T('WHAT HAPPENS', R('WHEN ONE FAILS'))), ['what happens', 'when one fails'], TK + [['reverse_swell_1s', 'ev:1-20', -18]]),
         ('On July 13', 'Tactical', dict(mode='butler'), ['climbed', 'about one hundred'], [['paper_slide', 'f:0', -18], ['pop_1', 'ev:0', -16], ['marker_scribble', 'ev:1', -18]])],
 's3d': [(0, 'Tactical', dict(mode='shots'), ['Eight shots'], [['stamp_thud_1', 'f:4', -12], ['glass_shatter_1', 'ev:0', -18], ['glass_shatter_2', 'ev:0+12', -18], ['glass_shatter_3', 'ev:0+24', -18], ['sub_hit_1', 'ev:0+52', -12]])],
 's3e': [(0, 'Kinetic', dict(kicker="THE AGENCY'S OWN REVIEW", lines=T('FAILURES IN', R('ADVANCE PLANNING'), R('& COMMUNICATION'))), ["agency's own", 'advance planning', 'communication'], TK)],
 's4a': [(0, *LAD(3))],
 's4b': [(0, 'Magnetometer', {}, ['Staff', 'guests', 'reporters', 'No exceptions'], [['click_1', 'ev:0+20', -16], ['click_2', 'ev:1+20', -16], ['click_1', 'ev:2+20', -16], ['stamp_thud_2', 'ev:3', -12]])],
 's5a': [(0, *LAD(4))],
 's5b': [(0, 'PhotoShot', P('n2_motorcade_inauguration_2017', focus=[50, 60], zoom=[1.04, 1.2], kicker='WHEN HE MOVES', lines=T('LOCAL POLICE', R('CLOSE THE ROADS')), callouts=[CO(0.49, 0.70, 'THE BEAST', 1, ring=110, dx=200, dy=-160)]), ['local police', 'close the roads'], TK + [['whoosh_hard_1', 'f:0', -16], ['pop_2', 'ev:1+8', -16]]),
         ('inside a convoy', 'Motorcade', {}, ['inside a convoy', 'counter assault', 'an ambulance'], [['whoosh_soft_2', 'f:0', -18], ['tick_1', 'ev:0', -16], ['tick_2', 'ev:1', -16], ['tick_3', 'ev:2', -16]])],
 's5c': [(0, 'PhotoShot', P('n4_counter_sniper_b', focus=[50, 40], zoom=[1.06, 1.2], tag='SECRET SERVICE TACTICAL PERSONNEL · 2020', kicker='COUNTER ASSAULT TEAM · ONE JOB', lines=T('THEY FIGHT', R('SO HE GETS OUT'))), ['they fight', 'get him out'], [['whoosh_soft_4', 'f:0', -18], ['stamp_thud_1', 'ev:0', -14], ['sub_hit_2', 'ev:1', -16]])],
 's6a': [(0, *LAD(5))],
 's6b': [(0, 'PhotoShot', P('n2_motorcade_2021', focus=[50, 40], zoom=[1.05, 1.22], pan=[-30, 0], kicker="THE PRESIDENT'S LIMOUSINE", lines=T(R('SPECS: CLASSIFIED'))), ['classified'], [['whoosh_soft_1', 'f:0', -16], ['stamp_thud_1', 'ev:0', -12]]),
         ('but reports describe', 'Beast', dict(labels=['DOORS ≈ 8 INCHES THICK', 'STEEL · ALUMINUM · TITANIUM · CERAMIC']), ['doors about', 'built from'], TK)],
 's6c': [(0, 'Beast', dict(labels=['≈ 8 TONS']), [], [['sub_hit_2', 'f:6', -14]])],
 's6d': [(0, 'Beast', dict(labels=["THE PRESIDENT'S BLOOD TYPE", 'IN THE TRUNK'], blood=True), ['supply', 'in case'], [['pop_2', 'ev:0', -14], ['tick_2', 'ev:1', -16]])],
 's7a': [(0, *LAD(6))],
 's7b': [(0, 'PhotoShot', P('n1_obama_secret_service_detail', focus=[40, 40], zoom=[1.05, 1.2], lines=T('ROTATING SHIFTS', R('A CODE NAME ON THE RADIO'))), ['rotating shifts', 'code name'], TK + [['click_1', 'ev:1', -16]])],
 's7c': [(0, 'CodeNames', dict(who=True), ['does not pick', 'White House'], [['stamp_thud_2', 'ev:0', -14], ['whoosh_soft_1', 'ev:1', -16]])],
 's7d': [(0, 'CodeNames', {}, ['Renegade', 'Mogul', 'Celtic'], POP)],
 's8a': [(0, *LAD(7))],
 's8b': [(0, 'Kinetic', dict(bg='n1_obama_inaugural_walk_agents.jpg', lines=T('WHEN EVERY LAYER FAILS', R("WHAT'S LEFT IS"), R("AN AGENT'S BODY"))), ['When every', 'what is left', "agent's body"], TK + [['sub_hit_1', 'ev:2', -14]])],
 's8c': [(0, 'PhotoShot', P('n8_washington_hilton_today', focus=[50, 50], zoom=[1.02, 1.12], pos='tl', kicker='MARCH 30, 1981', lines=T('WASHINGTON HILTON')), ['March'], [['paper_slide', 'f:0', -18], ['tick_1', 'f:6', -18]]),
         ('shots were fired', 'PhotoShot', P('n8_hilton_1981_chaos', focus=[50, 55], zoom=[1.04, 1.16], flash=True, tag='MARCH 30, 1981 · WHITE HOUSE PHOTO', lines=T('SHOTS FIRED', R('AT RONALD REAGAN'))), ['shots were fired', 'Ronald Reagan'], [['glass_shatter_1', 'f:0', -14], ['sub_hit_1', 'f:0', -12]])],
 's8d': [(0, 'PhotoShot', P('n8_hilton_1981_chaos', focus=[40, 70], zoom=[1.18, 1.32], bw=True, kicker='AGENT TIM McCARTHY', lines=T('TURNED TOWARD', R('THE GUNFIRE'))), ['McCarthy', 'toward the gunfire'], [['whoosh_soft_2', 'f:0', -16], ['tick_2', 'ev:1', -16]]),
         ('spread his body', 'Shield', dict(phase=1), ['spread his body', 'He was shot'], [['whoosh_soft_3', 'f:0', -16], ['glass_shatter_2', 'ev:1', -16], ['sub_hit_2', 'ev:1', -12]])],
 's8e': [(0, 'CoinFlip', {}, ['He survived', 'not even supposed'], [['tick_1', 'ev:0', -16], ['whoosh_soft_3', 'ev:1', -18], ['click_2', 'ev:1+36', -12], ['stamp_thud_1', 'ev:1+40', -14]])],
 'e1': [(0, 'PhotoShot', P('n10_white_house_from_monument', focus=[50, 50], zoom=[1.02, 1.15], pos='c', lines=T('60 NM OF CLOSED SKY')), ['Sixty'], [['whoosh_hard_1', 'f:0', -16]]),
        ('eight layers of people', 'Kinetic', dict(lines=T('8 LAYERS OF PEOPLE & STEEL', R('AND AT THE CENTER:'), R('A COIN FLIP'))), ['eight layers', 'at the very center', 'a coin flip'], TK + [['stamp_thud_2', 'ev:2', -12]])],
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

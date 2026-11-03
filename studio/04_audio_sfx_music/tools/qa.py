"""Measure every file, write ../catalog.csv and ../qa/*.png spectrograms."""
import os
import csv
import glob
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy import signal
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = os.path.join(os.path.dirname(__file__), '..')
QA = os.path.join(ROOT, 'qa')
os.makedirs(QA, exist_ok=True)

DESC = {
    'whoosh_soft': ('Band-passed noise sweep up, panned L->R', 'tile zoom / camera move / label slide'),
    'whoosh_hard': ('Wide sweep + tonal body + low thump at peak', 'section transition, grid -> item'),
    'tick': ('Crisp sine+noise tick 45 ms', 'label appear, counter steps, checkmarks'),
    'pop': ('Soft pitched pop with downward glide', 'tile / icon appear'),
    'click': ('Double mechanical click', 'UI toggle, switch, card flip'),
    'counter_tick_loop': ('12 ticks/s, 2 s, loopable', 'thermometer number rising'),
    'heat_rise': ('2.6 s rising detuned tone + shimmer + noise, ends hard', 'build before a bulb bursts'),
    'glass_shatter': ('Crack transient + inharmonic bar-mode tinkles + short bright tail', 'glass bulb bursting'),
    'water_spray_burst': ('Hiss onset + flutter + droplets, 1.6 s, fades', 'sprinkler opening'),
    'water_spray_loop': ('3 s seamless spray loop', 'sustained spray under VO'),
    'stamp_thud': ('Low thump + body + paper slap, saturated', 'red stamp reveal'),
    'sub_hit': ('Pitch-dropping sub with saturation + click + room', 'cold-open title, big reveal'),
    'riser_2s': ('Noise + tonal sweep crescendo, stereo', 'lead-in to reveal / last item'),
    'reverse_swell_1s': ('Reversed reverb swell, stereo', 'pre-hit suck-in, scene start'),
    'paper_slide': ('Friction noise 0.32 s', 'card / document slides in'),
    'marker_scribble': ('4 marker strokes 0.5 s', 'hand-drawn underline / circle'),
    'alarm_bell_distant': ('Fire-alarm bell 18 strikes/s, band-limited, reverberant', 'fire context, cold open'),
    'bed_main_loop': ('Dm-Bb-Gm-Asus, 90 BPM, pads+sub pulse+muted plucks+air; 64 bars seamless loop', 'music under VO, body of video'),
    'bed_cold_open': ('Dark D drone + Eb tension + accelerating ticks + riser -> hit at 23.3 s', 'cold open (first 25 s)'),
    'bed_outro': ('Gm-Bb-Dm(add9) resolving, plucks thinning, fade', 'last 20 s / end screen'),
}

SPEC = ['glass_shatter_1', 'glass_shatter_2', 'water_spray_burst', 'water_spray_loop', 'whoosh_soft_1',
        'whoosh_hard_1', 'stamp_thud_1', 'heat_rise', 'alarm_bell_distant', 'sub_hit_1',
        'bed_main_loop', 'bed_cold_open', 'bed_outro']

meter = pyln.Meter(48000)
rows = []
issues = []
for path in sorted(glob.glob(os.path.join(ROOT, 'library', '*.wav')) + glob.glob(os.path.join(ROOT, 'music', '*.wav'))):
    name = os.path.splitext(os.path.basename(path))[0]
    x, sr = sf.read(path, always_2d=True)
    info = sf.info(path)
    assert sr == 48000 and info.subtype == 'PCM_24', (name, sr, info.subtype)
    mono = x.mean(axis=1)
    peak = 20 * np.log10(np.max(np.abs(x)) + 1e-12)
    tp = 20 * np.log10(np.max(np.abs(signal.resample_poly(x, 4, 1, axis=0))) + 1e-12)
    pad = x if len(x) > 0.5 * sr else np.vstack([x, np.zeros((int(0.5 * sr), x.shape[1]))])
    lufs = meter.integrated_loudness(pad)
    dc = float(np.max(np.abs(x.mean(axis=0))))
    start, end = float(np.max(np.abs(x[0]))), float(np.max(np.abs(x[-1])))
    loopjump = ''
    if 'loop' in name:
        d = np.abs(x[0] - x[-1]).max()
        typ = np.percentile(np.abs(np.diff(x, axis=0)), 99)
        loopjump = f'{d:.5f}/{typ:.5f}'
        if d > typ:
            issues.append(f'{name}: loop seam jump {d:.5f} > p99 diff {typ:.5f}')
    if tp > -1.0:
        issues.append(f'{name}: true peak {tp:.2f} dBTP > -1')
    if dc > 1e-3:
        issues.append(f'{name}: DC {dc:.5f}')
    if 'loop' not in name and (start > 1e-3 or end > 1e-3):
        issues.append(f'{name}: boundary sample {start:.4f}/{end:.4f}')
    key = next((k for k in DESC if name.startswith(k)), name)
    d, use = DESC.get(key, ('', ''))
    rows.append([os.path.relpath(path, ROOT), f'{len(x) / sr:.3f}', x.shape[1], f'{peak:.2f}', f'{tp:.2f}',
                 f'{lufs:.1f}', f'{dc:.6f}', f'{start:.5f}', f'{end:.5f}', loopjump, d, use])
    if name in SPEC:
        f, t, S = signal.spectrogram(mono[: int(min(len(mono), 30 * sr))], sr, nperseg=1024, noverlap=768)
        plt.figure(figsize=(9, 3.2))
        plt.pcolormesh(t, f, 10 * np.log10(S + 1e-12), shading='auto', vmin=-130, vmax=-30, cmap='magma')
        plt.yscale('symlog', linthresh=200)
        plt.ylim(30, 24000)
        plt.title(f'{name}  peak {peak:.1f} dBFS  {lufs:.1f} LUFS')
        plt.xlabel('s')
        plt.ylabel('Hz')
        plt.tight_layout()
        plt.savefig(os.path.join(QA, name + '.png'), dpi=80)
        plt.close()

with open(os.path.join(ROOT, 'catalog.csv'), 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['file', 'duration_s', 'channels', 'peak_dbfs', 'true_peak_dbtp', 'lufs', 'dc', 'first_sample',
                'last_sample', 'loop_seam(jump/p99diff)', 'description', 'intended_use'])
    w.writerows(rows)

for r in rows:
    print(f'{r[0]:38s} {r[1]:>8s}s ch{r[2]} pk {r[3]:>6s} tp {r[4]:>6s} {r[5]:>6s} LUFS {r[9]}')
print('ISSUES:', issues or 'none')

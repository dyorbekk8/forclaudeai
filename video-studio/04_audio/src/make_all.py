"""Re-generate the whole audio package, write README.md, run QA.

usage (from anywhere):  python3 04_audio/src/make_all.py [--no-qa]
Requires: numpy, scipy (and matplotlib for QA spectrograms).
Everything is deterministic (fixed seeds).
"""
import os
import sys
import time
from multiprocessing import Pool

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.dirname(HERE)


def _job(task):
    kind, name = task
    import numpy as np  # noqa
    if kind == 'sfx':
        import sfx
        return ('sfx', sfx.make_sfx(None))
    import music
    return ('music', music.make_music([name]))


def write_readme(sfx_info, music_info):
    import sfx
    lines = []
    lines.append('# 04_audio — procedural sound design & score')
    lines.append('')
    lines.append('Video: "What If You Aged 1 Year Every Time You Lied?" (flat 2D stick-figure, 5:01).')
    lines.append('Everything here is generated 100% procedurally with Python/numpy/scipy — no samples, no AI audio.')
    lines.append('')
    lines.append('* Format: 48 kHz, 16-bit PCM WAV (TPDF-dithered).')
    lines.append('* SFX: peak-normalised to -3 dBFS, DC-free, faded edges (no clicks). Mono for simple UI ticks/blips/pops, '
                 'stereo for everything with movement or space.')
    lines.append('* Music: stereo, integrated loudness about -16 LUFS (BS.1770, gated), sample peak below -1 dBFS, '
                 'exact lengths, click-free start, natural tail endings.')
    lines.append('* Loops (`crowd_murmur`, `cafeteria_ambience`, `room_tone_home`, `room_tone_care`) are seamless: the tail is '
                 'equal-power crossfaded into the head and the loop point sits on a near-zero sample, so they have no '
                 'fades. They are normalised to -3 dBFS like all SFX — play ambiences/room tones around -20 to -30 dB '
                 'under dialogue.')
    lines.append('* Regenerate everything: `python3 04_audio/src/make_all.py` (deterministic, about 1–2 min). '
                 'QA only: `python3 04_audio/src/qa.py` (report in `qa/qa_report.json`, spectrograms in `qa/`).')
    lines.append('')
    lines.append('## Score concept')
    lines.append('')
    lines.append('One palette across all cues (felt piano, marimba, pizzicato plucks, warm pads, ensemble strings, soft '
                 'bells / music box) and one recurring **lie motif**: **E–D–C–G** (3-2-1-5 in C major). Variations: '
                 'playful in m1/m2, minor **C–B–A–E** in m3, slow and bittersweet in m4, augmented at the climax of m5 '
                 '(E6–D6–C6 … G5), resolved **E–D–C → C** in m6, ominous detuned music-box **E–D–C–G#** in m7.')
    lines.append('')
    lines.append('## Music cues (`music/`)')
    lines.append('')
    lines.append('| file | duration | description |')
    lines.append('|---|---|---|')
    for name, (path, dur, desc) in sorted(music_info.items()):
        lines.append(f'| `music/{name}.wav` | {dur:.1f} s | {desc} |')
    lines.append('')
    lines.append('Notable timings: **m4_tender** is true digital silence from 42.0 s to 45.5 s (music decays naturally '
                 'into it) and resumes with a single piano note at 45.5 s. **m5_reveal** peaks around 45–52 s '
                 '(arrival chord at 46.7 s) and is silent by 56.0 s. **m3_tension** fades over its last 2 s. '
                 '**m7_cliffhanger** ends on a sustained unresolved Fmaj7(#11) chord fading out.')
    lines.append('')
    lines.append('## SFX (`sfx/`)')
    lines.append('')
    lines.append('| file | duration | description |')
    lines.append('|---|---|---|')
    for name, (path, dur, desc) in sorted(sfx_info.items()):
        loop = ' (loop)' if name in sfx.LOOPABLE else ''
        lines.append(f'| `sfx/{name}.wav` | {dur:.2f} s | {desc}{loop} |')
    lines.append('')
    lines.append('## Usage notes')
    lines.append('')
    lines.append('* `pop_age_1/2/3` is the signature age-up sound (~30 uses): rotate the three variations so repeats '
                 'do not feel mechanical; its transient is at 0 ms, so align the file start with the visual pop.')
    lines.append('* `riser` / `riser_short` end abruptly at their peak (4 ms anti-click only): butt the next hit '
                 '(`thud_impact_*`, `stamp_thud`) right at the file end. `reverse_swell` also ends at its peak.')
    lines.append('* `counter_roll` ding lands at about 1.0 s.')
    lines.append('')
    lines.append('## Source (`src/`)')
    lines.append('')
    lines.append('* `dsp.py` — filters, noise, oscillators (polyBLEP), envelopes, STFT spectral shaping, modal resonators, '
                 'convolution reverb with synthetic frequency-dependent IR, compressor, look-ahead limiter, BS.1770 loudness, '
                 'WAV writer.')
    lines.append('* `sfx.py` — every SFX generator. `instruments.py` — felt piano (inharmonic additive), marimba (modal), '
                 'Karplus–Strong pluck, pads, strings ensemble, bells, music box, drums. `music.py` — the 7 cues '
                 '(chords, motifs, arrangement, mix, mastering).')
    lines.append('* `qa.py` — clipping / DC / edge-click / duration / silence / loop-seam / loudness checks + spectrograms.')
    lines.append('* `make_all.py` — runs everything (parallel), writes this README, runs QA.')
    lines.append('')
    with open(os.path.join(ROOT, 'README.md'), 'w') as fh:
        fh.write('\n'.join(lines))


def main():
    t0 = time.time()
    import music
    tasks = [('sfx', None)] + [('music', n) for n in music.CUES]
    sfx_info, music_info = {}, {}
    with Pool(min(4, os.cpu_count() or 1)) as pool:
        for kind, info in pool.imap_unordered(_job, tasks):
            (sfx_info if kind == 'sfx' else music_info).update(info)
    write_readme(sfx_info, music_info)
    print(f'generated {len(sfx_info)} sfx + {len(music_info)} cues in {time.time() - t0:.0f}s')
    if '--no-qa' not in sys.argv:
        import qa
        bad = qa.main(['--spec', 'pop_age_1', 'whoosh_fast_1', 'm4_tender', 'm5_reveal', 'thud_impact_1'])
        sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()

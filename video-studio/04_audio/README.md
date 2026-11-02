# 04_audio — procedural sound design & score

Video: "What If You Aged 1 Year Every Time You Lied?" (flat 2D stick-figure, 5:01).
Everything here is generated 100% procedurally with Python/numpy/scipy — no samples, no AI audio.

* Format: 48 kHz, 16-bit PCM WAV (TPDF-dithered).
* SFX: peak-normalised to -3 dBFS, DC-free, faded edges (no clicks). Mono for simple UI ticks/blips/pops, stereo for everything with movement or space.
* Music: stereo, integrated loudness about -16 LUFS (BS.1770, gated), sample peak below -1 dBFS, exact lengths, click-free start, natural tail endings.
* Loops (`crowd_murmur`, `cafeteria_ambience`, `room_tone_home`, `room_tone_care`) are seamless: the tail is equal-power crossfaded into the head and the loop point sits on a near-zero sample, so they have no fades. They are normalised to -3 dBFS like all SFX — play ambiences/room tones around -20 to -30 dB under dialogue.
* Regenerate everything: `python3 04_audio/src/make_all.py` (deterministic, about 1–2 min). QA only: `python3 04_audio/src/qa.py` (report in `qa/qa_report.json`, spectrograms in `qa/`).

## Score concept

One palette across all cues (felt piano, marimba, pizzicato plucks, warm pads, ensemble strings, soft bells / music box) and one recurring **lie motif**: **E–D–C–G** (3-2-1-5 in C major). Variations: playful in m1/m2, minor **C–B–A–E** in m3, slow and bittersweet in m4, augmented at the climax of m5 (E6–D6–C6 … G5), resolved **E–D–C → C** in m6, ominous detuned music-box **E–D–C–G#** in m7.

## Music cues (`music/`)

| file | duration | description |
|---|---|---|
| `music/m1_curious.wav` | 56.0 s | 92 BPM curious/quirky: pizz plucks, marimba, soft pad, shaker; introduces the lie motif |
| `music/m2_comedy.wav` | 35.0 s | 112 BPM bouncy comedy: marimba/pluck oom-pah bass, claps on 2&4, cheeky melody, button ending |
| `music/m3_tension.wav` | 35.0 s | 96 BPM uneasy tension: pulsing low synth 8ths, ticking hats, rising pad, lie motif in minor; 2 s fade |
| `music/m4_tender.wav` | 75.0 s | 68 BPM tender: felt piano + warm strings; TRUE SILENCE 42.0-45.5 s, resumes with a single piano note |
| `music/m5_reveal.wav` | 56.0 s | 72 BPM emotional reveal: piano arpeggios + swelling strings, peak 45-52 s, silent by 56 s |
| `music/m6_resolve.wav` | 20.0 s | 80 BPM warm resolution in C: piano + pad + soft bells, lie motif resolves to the tonic |
| `music/m7_cliffhanger.wav` | 25.0 s | 70 BPM ominous: low drone, detuned music-box motif, heartbeat pulse, unresolved chord fade |

Notable timings: **m4_tender** is true digital silence from 42.0 s to 45.5 s (music decays naturally into it) and resumes with a single piano note at 45.5 s. **m5_reveal** peaks around 45–52 s (arrival chord at 46.7 s) and is silent by 56.0 s. **m3_tension** fades over its last 2 s. **m7_cliffhanger** ends on a sustained unresolved Fmaj7(#11) chord fading out.

## SFX (`sfx/`)

| file | duration | description |
|---|---|---|
| `sfx/bike_bell.wav` | 0.80 s | Bicycle bell ring-ring |
| `sfx/blip_1.wav` | 0.13 s | Soft UI blip |
| `sfx/blip_2.wav` | 0.13 s | Soft UI blip |
| `sfx/blip_3.wav` | 0.13 s | Soft UI blip |
| `sfx/boing_comic.wav` | 0.60 s | Comedic spring boing |
| `sfx/bus_brake.wav` | 1.50 s | Bus brake squeal + air brake hiss |
| `sfx/cafeteria_ambience.wav` | 8.00 s | Cafeteria chatter + cutlery clinks (seamless loop) (loop) |
| `sfx/camera_shutter.wav` | 0.40 s | Camera shutter click-clack + wind |
| `sfx/card_shuffle.wav` | 1.00 s | Card riffle shuffle |
| `sfx/chime_soft.wav` | 2.20 s | Gentle magical rolled chime for warm moments |
| `sfx/clock_tick.wav` | 4.00 s | Clock tick-tock, 8 beats |
| `sfx/cookie_crunch.wav` | 0.40 s | Cookie bite crunch |
| `sfx/counter_roll.wav` | 1.50 s | Accelerating counter ticks settling into a soft ding |
| `sfx/crowd_murmur.wav` | 6.00 s | Indistinct crowd chatter (seamless loop) (loop) |
| `sfx/ding_1.wav` | 1.30 s | Bright notification chime |
| `sfx/ding_2.wav` | 1.30 s | Bright notification chime |
| `sfx/door_close.wav` | 0.60 s | Door close thud + latch |
| `sfx/door_open.wav` | 1.00 s | Door latch click + creak |
| `sfx/footsteps_hall.wav` | 3.00 s | 6 steps in a hallway with echo |
| `sfx/footsteps_walk.wav` | 3.00 s | 6 soft steps on a hard floor |
| `sfx/glass_break.wav` | 1.20 s | Glass cup shattering on a floor |
| `sfx/glitch.wav` | 0.40 s | Digital glitch stutter |
| `sfx/heartbeat.wav` | 1.60 s | Two soft low heartbeats (lub-dub) |
| `sfx/magic_shimmer.wav` | 1.50 s | Magical harp-like shimmer |
| `sfx/paper_rustle.wav` | 0.80 s | Paper rustle |
| `sfx/pencil_scribble.wav` | 1.20 s | Pencil scribbling on paper |
| `sfx/phone_buzz.wav` | 1.20 s | Phone vibrating on a table, two pulses |
| `sfx/phone_ring.wav` | 2.50 s | Gentle classic phone ring, two rings |
| `sfx/pop_age_1.wav` | 0.62 s | Signature age-up: knuckle crack-pop + sub whomp + sparkle tail |
| `sfx/pop_age_2.wav` | 0.62 s | Signature age-up: knuckle crack-pop + sub whomp + sparkle tail |
| `sfx/pop_age_3.wav` | 0.62 s | Signature age-up: knuckle crack-pop + sub whomp + sparkle tail |
| `sfx/pop_ui_1.wav` | 0.09 s | Small bubbly pop for text badges |
| `sfx/pop_ui_2.wav` | 0.09 s | Small bubbly pop for text badges |
| `sfx/pop_ui_3.wav` | 0.09 s | Small bubbly pop for text badges |
| `sfx/record_scratch.wav` | 0.60 s | Vinyl record scratch / stop |
| `sfx/reverse_swell.wav` | 1.20 s | Reverse-cymbal swell, ends at peak |
| `sfx/riser.wav` | 2.00 s | Tension riser (noise + rising tone), abrupt end for a hit |
| `sfx/riser_short.wav` | 1.00 s | Short tension riser, abrupt end |
| `sfx/room_tone_care.wav` | 10.00 s | Quiet care-home room tone + faint 1 s clock tick (seamless loop) (loop) |
| `sfx/room_tone_home.wav` | 10.00 s | Warm home room tone + faint fridge hum (seamless loop) (loop) |
| `sfx/school_bell.wav` | 1.80 s | Electric school bell |
| `sfx/shaver_buzz.wav` | 1.50 s | Electric razor buzz |
| `sfx/sigh_air.wav` | 0.80 s | Breathy sigh, noise only |
| `sfx/sparkle.wav` | 1.00 s | Twinkly glints |
| `sfx/stamp_thud.wav` | 0.45 s | Rubber stamp hit |
| `sfx/swallow_gulp.wav` | 0.40 s | Comedic gulp |
| `sfx/swish_whip_1.wav` | 0.25 s | Very fast whip-pan swish |
| `sfx/swish_whip_2.wav` | 0.25 s | Very fast whip-pan swish |
| `sfx/thud_impact_1.wav` | 1.50 s | Deep cinematic impact: sub drop + transient + tail |
| `sfx/thud_impact_2.wav` | 1.50 s | Deep cinematic impact: sub drop + transient + tail |
| `sfx/tick_1.wav` | 0.04 s | Clean counter tick |
| `sfx/tick_2.wav` | 0.04 s | Clean counter tick |
| `sfx/tick_3.wav` | 0.04 s | Clean counter tick |
| `sfx/tv_static_off.wav` | 0.50 s | TV static switching off |
| `sfx/whoosh_fast_1.wav` | 0.35 s | Fast whoosh, band-pass sweep with pan movement |
| `sfx/whoosh_fast_2.wav` | 0.35 s | Fast whoosh, band-pass sweep with pan movement |
| `sfx/whoosh_fast_3.wav` | 0.35 s | Fast whoosh, band-pass sweep with pan movement |
| `sfx/whoosh_slow_1.wav` | 0.90 s | Slow whoosh with pan movement |
| `sfx/whoosh_slow_2.wav` | 0.90 s | Slow whoosh with pan movement |

## Usage notes

* `pop_age_1/2/3` is the signature age-up sound (~30 uses): rotate the three variations so repeats do not feel mechanical; its transient is at 0 ms, so align the file start with the visual pop.
* `riser` / `riser_short` end abruptly at their peak (4 ms anti-click only): butt the next hit (`thud_impact_*`, `stamp_thud`) right at the file end. `reverse_swell` also ends at its peak.
* `counter_roll` ding lands at about 1.0 s.

## Source (`src/`)

* `dsp.py` — filters, noise, oscillators (polyBLEP), envelopes, STFT spectral shaping, modal resonators, convolution reverb with synthetic frequency-dependent IR, compressor, look-ahead limiter, BS.1770 loudness, WAV writer.
* `sfx.py` — every SFX generator. `instruments.py` — felt piano (inharmonic additive), marimba (modal), Karplus–Strong pluck, pads, strings ensemble, bells, music box, drums. `music.py` — the 7 cues (chords, motifs, arrangement, mix, mastering).
* `qa.py` — clipping / DC / edge-click / duration / silence / loop-seam / loudness checks + spectrograms.
* `make_all.py` — runs everything (parallel), writes this README, runs QA.

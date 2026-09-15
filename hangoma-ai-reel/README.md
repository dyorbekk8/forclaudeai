# hangoma.ai — AI Reels ad (10-13s, 1080x1920)

Generated end-to-end with code (Pillow/numpy frame renderer + ffmpeg), per
the brief in `4d0fef47-hangoma-ai-reels-prompt.md`. No Node/Remotion/Chromium
needed — this uses the Python + Pillow + ffmpeg fallback path from that brief
(section 9), since a headless-Chromium render pipeline wasn't worth the risk
in this sandbox.

**Output:** `output/hangoma_reel.mp4` — 1080x1920, H.264, 30fps, stereo AAC,
~11.9s (ffprobe-verified, inside the 10-13s requirement).

**System deps:** `apt-get install -y ffmpeg espeak-ng`. **Python deps:**
`pip install -r requirements.txt`.

## ⚠️ Voiceover is a placeholder — read this before shipping

The brief requires `edge-tts` (`uz-UZ-SardorNeural` / `uz-UZ-MadinaNeural`) for
the Uzbek voiceover. This sandbox's network policy blocks
`speech.platform.bing.com` (and every other general-internet host — Pixabay,
Mixkit, Azure, etc. are blocked too; only pypi/npm/GitHub/Google Fonts are
reachable), so `edge-tts` cannot reach its backend here. I also checked
Piper TTS (a fully-offline neural TTS) as an alternative -- it has no Uzbek
voice at all (confirmed against its `VOICES.md`), so it's not an option
either. The current voiceover uses `espeak-ng`'s offline "uz" voice as a
stand-in -- same language, correct words, but a robotic voice, not the
neural quality the brief (or the client) wants. Everything else (visuals,
timing, SFX, music, captions, the real-footage before/after treatment) is
final quality and does **not** need to change when the voice is swapped.

### To use the real neural voice

Run this anywhere with normal internet access (i.e. not this sandbox):

```bash
pip install edge-tts
USE_EDGE_TTS=1 python3 scripts/generate_voiceover.py   # writes output/word_timings.json with real word-boundary timing
python3 scripts/render.py                               # re-renders frames to the new (likely shorter) duration
python3 scripts/mix_audio.py
ffmpeg -y -i output/silent_video.mp4 -i output/mixed_audio.wav \
  -c:v copy -c:a aac -b:a 192k -ac 2 -shortest output/hangoma_reel.mp4
```

Everything downstream (scene timing, caption sync, SFX cue points, music
ducking) is derived from `output/word_timings.json`'s segment durations, so
swapping the voice and re-running the pipeline re-times the whole video
automatically — no manual re-sync needed.

## Pipeline

```
scripts/generate_voiceover.py   -> output/voiceover.wav, output/word_timings.json
scripts/generate_sfx.py         -> assets/sfx/*.wav      (numpy-synthesized; Pixabay/Mixkit unreachable)
scripts/generate_music.py       -> assets/music/hype_beat.wav (numpy-synthesized 128 BPM loop)
scripts/render.py               -> output/silent_video.mp4 (Pillow frames piped into ffmpeg)
scripts/mix_audio.py            -> output/mixed_audio.wav (VO + ducked music + SFX cues)
ffmpeg mux (see above)          -> output/hangoma_reel.mp4
```

Re-run the whole thing from scratch:

```bash
python3 scripts/generate_voiceover.py
python3 scripts/generate_sfx.py
python3 scripts/generate_music.py 15
python3 scripts/render.py
python3 scripts/mix_audio.py
ffmpeg -y -i output/silent_video.mp4 -i output/mixed_audio.wav \
  -c:v copy -c:a aac -b:a 192k -ac 2 -shortest output/hangoma_reel.mp4
```

## Creative decisions

- **Palette:** near-black navy background, white text, one electric-blue
  accent (Apple-style minimalism per the brief — max one bright accent color).
- **Type:** Poppins Black/Bold/SemiBold (Google Fonts; SF Pro isn't
  licensable, matching the brief's own suggestion).
- **Captions:** rendered as kinetic-typography headline chunks (stat
  numbers, then AI headline, then CTA), timed proportionally within each VO
  segment's measured duration — not a literal subtitle bar, to match the
  "Apple ad" look rather than a TikTok-caption look.
- **Icons:** clock / "AI" badge / play button / DM bubble are drawn from
  scratch as generic shapes — deliberately not a reproduction of any
  trademarked app logo (e.g. Instagram's), since the brief's "Instagram DM
  icon" would otherwise risk using protected brand assets in an ad.
- **SFX & music:** numpy-synthesized (whoosh, pop, bass impact, whoop/rise,
  notification ping; 128 BPM hype beat) since Pixabay/Mixkit are unreachable
  from this sandbox. Music is ducked to ~22% under the voiceover and eased
  back up during the open/transitions/tail.
- **Transitions:** land exactly on the voiceover's inter-segment silence
  (see `SEG_GAP` in `generate_voiceover.py`, threaded through to
  `render.py`'s `build_timeline`) so cuts never drift out of sync with the
  spoken segments.
- **Real footage (before/after):** `assets/footage/hangoma_source_b.mp4` is a
  real client wedding clip, used as full-bleed background for the hook +
  AI-transformation scenes -- desaturated/dimmed with a fake "REC" timecode
  counter during the hook ("3 soat xom material"), then graded warm/vibrant
  with an "AI ENHANCED" badge during the transformation beat. Only the first
  ~4.7s of the clip is used (`FOOTAGE_USABLE_DURATION` in `render.py`) --
  it cuts to an unrelated banquet-table shot after that. The CTA scene stays
  on the clean abstract background so the brand moment isn't tied to one
  specific client's face. `render.py` falls back to the original abstract
  motion graphics automatically if `assets/footage/hangoma_source_b.mp4` is
  missing (e.g. reusing this project for a different client with no source
  clip on hand).
  **Rights note:** this clip shows real, identifiable private individuals
  (the couple). Using raw wedding footage in a *public ad* is a different
  usage than editing it for the couple privately -- confirm you have
  marketing/portfolio usage rights before publishing, not just an editing
  contract.

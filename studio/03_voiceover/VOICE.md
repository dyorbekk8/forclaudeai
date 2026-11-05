# Channel voice — LOCKED (use for every long video and Short)

- Engine: Chatterbox TTS (ResembleAI, MIT), CPU, venv `/opt/tts/.venv` (`uv pip install chatterbox-tts faster-whisper "setuptools<81"`).
- Voice identity: zero-shot from `03_voiceover/refs/ref_michael.wav` (synthetic reference made with Kokoro `am_michael`, SPEED 0.98 — no real person's voice).
- Settings: exaggeration 0.45 · cfg_weight 0.5 · temperature 0.7 · per-sentence generation.
- QA: every sentence transcribed with faster-whisper `small.en`; regenerated (up to 4 takes) until it matches the script.
- Pauses: `.`/`!` 0.42 s · `?` 0.45 s · `:`/`;` 0.30 s · between lines 0.30 s · between sections 0.60 s.
- Post: `tools/process_vo.py` (48 kHz, EQ, light compression, −18 LUFS per clip).
- Command: `. /opt/tts/.venv/bin/activate && python tools/cb_vo.py <vo_lines.json> <project>/cb_raw refs/ref_michael.wav`
- Output carries Chatterbox's built-in Perth watermark (kept on purpose).
Do not switch voice, reference or settings between videos.

# video-studio — "What If…" animated video pipeline

Every department has its own folder; each step reads the previous step's output.

| Folder | What lives here | Key file |
|---|---|---|
| 00_brief | the owner's brief | BRIEF.md |
| 01_research | niche analysis: frame sheets of reference videos, PDF thumbnails, vidIQ data | NICHE_BIBLE.md |
| 02_script | story + line-by-line VO script (speaker, text, pause) | script.md, lines.json |
| 03_voiceover | local TTS (Kokoro, runs offline) → per-line takes + timeline | build_vo.py → out/timeline.json |
| 04_audio | procedurally generated SFX library + 7 music cues (pure numpy) | src/make_all.py, README.md |
| 05_visuals | Remotion (React/SVG) animation: character rig, sets, ~80 shots | src/shots/list.ts |
| 06_edit | final mix: VO + ducked music + 200+ SFX cues → −14 LUFS | mix.py → cuesheet.json |
| 07_renders | rendered video files (not in git) | |
| 08_qa | contact-sheet stills used for frame-by-frame review | stills/*_grid.jpg |
| 09_publish | thumbnail A/B, title, description, chapters, tags | metadata.md |

## Rebuild from scratch
```bash
cd 03_voiceover && python3 build_vo.py --force          # needs models/ (Kokoro v1.0 onnx + voices)
cd ../04_audio && python3 src/make_all.py
cd .. && python3 06_edit/mix.py                          # writes 05_visuals/public/audio/mix.wav
cd 05_visuals && npm i && npx remotion render src/index.ts Main ../07_renders/video.mp4 --muted
ffmpeg -i ../07_renders/video.mp4 -i public/audio/mix.wav -c:v copy -c:a aac -b:a 320k ../07_renders/final.mp4
```
Timing is data-driven: change a line in `02_script/lines.json`, rebuild the VO, and every shot, pop,
SFX cue and music cue moves with it (shots are anchored to line IDs, not hard-coded seconds).

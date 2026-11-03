# Studio — "Every X Explained" explainer videos (YouTube, 16:9)

Goal: retention-first explainer videos in the "Every X Explained / How X Actually Works" format.
All visuals are built in code (Remotion + SVG), frame-exact, no AI-generated imagery.

## Pipeline (each stage owns one folder)

| # | Folder | Owns | Output that the next stage reads |
|---|--------|------|----------------------------------|
| 00 | `00_research/` | Niche, channel and video analysis | `format_breakdown.md`, `channels.md` |
| 01 | `01_ideas/` | Topic backlog, scoring | `backlog.md` (one row per idea) |
| 02 | `02_scripts/<slug>/` | Script, beat sheet, fact sources | `script.md`, `sources.md` |
| 03 | `03_voiceover/<slug>/` | VO takes, word timings | `vo.wav`, `timings.json` |
| 04 | `04_audio_sfx_music/` | SFX library (code-synthesised), music beds, mix rules | `library/`, `mix_rules.md` |
| 05 | `05_visual_system/` | Style guide, colour/typography tokens, tile + icon components | `style_guide.md`, SVG/TSX components |
| 06 | `06_edit_cuts_transitions/` | Cut rhythm, transition and motion rules, per-video edit decision list | `edl_<slug>.json` |
| 07 | `07_render/` | Remotion project, render scripts | `out/<slug>.mp4` |
| 08 | `08_thumbnails_titles/<slug>/` | Thumbnail (code-rendered), title variants | `thumb_A.png`, `titles.md` |
| 09 | `09_qa/<slug>/` | Final checklist, frame-by-frame review notes | `qa_report.md` |
| — | `agents/<agent-name>/` | Brief + scratch space for each sub-agent | `brief.md`, `report.md` |

## Rules
- A stage only reads the previous stage's declared output file, never another agent's scratch.
- Every factual claim in a script has a source line in `sources.md`.
- Nothing ships until `09_qa/<slug>/qa_report.md` is fully green.

## Status
See `00_research/STATUS.md`.

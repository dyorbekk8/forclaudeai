#!/usr/bin/env bash
# Full rebuild of video #1: EDL -> audio mix -> video render -> mux -> QA.
# VO source = 03_voiceover/sprinkler/final (re-create with process_vo.py from scratch/ or eleven/).
set -euo pipefail
cd "$(dirname "$0")/.."
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
OUT=07_render/out/every_fire_sprinkler_color_explained.mp4

python3 06_edit_cuts_transitions/sprinkler/build_edl_v2.py final_v2
python3 -W ignore 06_edit_cuts_transitions/sprinkler/mix.py
python3 08_thumbnails_titles/sprinkler/make_meta.py
(cd 07_render && npx remotion render src/index.ts Main out/video_silent.mp4 --browser-executable=$B \
  --codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709 --concurrency=4 --muted --log=error)
ffmpeg -v error -y -i 07_render/out/video_silent.mp4 -i 07_render/out/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$OUT"
python3 09_qa/sprinkler/qa.py "$OUT"

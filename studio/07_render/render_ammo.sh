#!/usr/bin/env bash
# Full rebuild of ammo video: EDL -> mix (lo-fi) -> render -> mux -> QA.
set -euo pipefail
cd "$(dirname "$0")/.."
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p 07_render/out/ammo
OUT=07_render/out/ammo/every_military_ammo_color_explained.mp4
python3 06_edit_cuts_transitions/ammo_build_edl.py
python3 -W ignore 06_edit_cuts_transitions/sprinkler/mix.py 07_render/src/ammo/edl.json 07_render/out/ammo lofi
(cd 07_render && npx remotion render src/index.ts Ammo out/ammo/video_silent.mp4 --browser-executable=$B \
  --codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709 --concurrency=4 --muted --log=error)
ffmpeg -v error -y -i 07_render/out/ammo/video_silent.mp4 -i 07_render/out/ammo/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$OUT"
python3 09_qa/sprinkler/qa.py "$OUT" 07_render/src/ammo/edl.json 09_qa/ammo

#!/usr/bin/env bash
# Full rebuild of video #2 (body armor): EDL -> mix (lo-fi) -> render -> mux -> QA.
set -euo pipefail
cd "$(dirname "$0")/.."
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p 07_render/out/armor
OUT=07_render/out/armor/how_body_armor_levels_actually_work.mp4
python3 06_edit_cuts_transitions/armor_build_edl.py
python3 -W ignore 06_edit_cuts_transitions/sprinkler/mix.py 07_render/src/armor/edl.json 07_render/out/armor lofi
(cd 07_render && npx remotion render src/index.ts Armor out/armor/video_silent.mp4 --browser-executable=$B \
  --codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709 --concurrency=4 --muted --log=error)
ffmpeg -v error -y -i 07_render/out/armor/video_silent.mp4 -i 07_render/out/armor/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$OUT"

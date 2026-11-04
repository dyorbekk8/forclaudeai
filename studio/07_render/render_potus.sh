#!/usr/bin/env bash
# Full rebuild of video #3 (prison): EDL -> mix (lo-fi) -> render -> mux -> QA.
set -euo pipefail
cd "$(dirname "$0")/.."
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p 07_render/out/potus
OUT=07_render/out/potus/how_presidential_protection_actually_works.mp4
python3 06_edit_cuts_transitions/potus_build_edl.py
python3 -W ignore 06_edit_cuts_transitions/sprinkler/mix.py 07_render/src/potus/edl.json 07_render/out/potus lofi
(cd 07_render && npx remotion render src/index.ts Potus out/potus/video_silent.mp4 --browser-executable=$B \
  --codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709 --concurrency=4 --muted --log=error)
ffmpeg -v error -y -i 07_render/out/potus/video_silent.mp4 -i 07_render/out/potus/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$OUT"
python3 09_qa/sprinkler/qa.py "$OUT" 07_render/src/potus/edl.json 09_qa/potus

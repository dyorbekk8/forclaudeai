#!/usr/bin/env bash
# Full rebuild of aircraft video: EDL -> mix (lo-fi) -> render -> mux -> QA.
set -euo pipefail
cd "$(dirname "$0")/.."
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p 07_render/out/nuclear
OUT=07_render/out/nuclear/every_nuclear_incident_code_word_explained.mp4
/opt/tts/.venv/bin/python 06_edit_cuts_transitions/nuclear_build_edl.py
python3 -W ignore 06_edit_cuts_transitions/sprinkler/mix.py 07_render/src/nuclear/edl.json 07_render/out/nuclear lofi
(cd 07_render && npx remotion render src/index.ts Nuclear out/nuclear/video_silent.mp4 --browser-executable=$B \
  --codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709 --concurrency=4 --muted --log=error)
ffmpeg -v error -y -i 07_render/out/nuclear/video_silent.mp4 -i 07_render/out/nuclear/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$OUT"
python3 09_qa/sprinkler/qa.py "$OUT" 07_render/src/nuclear/edl.json 09_qa/nuclear

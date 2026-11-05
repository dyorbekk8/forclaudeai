#!/usr/bin/env bash
# Ammo Shorts: VO post -> Whisper-timed EDL -> mix -> render (1080x1920) -> mux -> QA, for s1..s3.
set -euo pipefail
cd "$(dirname "$0")/.."
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
rm -rf 03_voiceover/ammo_shorts/final
python3 03_voiceover/tools/process_vo.py 03_voiceover/ammo_shorts/cb_raw 03_voiceover/ammo_shorts/final | tail -1
/opt/tts/.venv/bin/python 06_edit_cuts_transitions/ammo_shorts_build_edl.py
mkdir -p 07_render/out/ammo_shorts
for k in s1 s2 s3; do
  O=07_render/out/ammo_shorts/$k
  mkdir -p $O
  python3 -W ignore 06_edit_cuts_transitions/sprinkler/mix.py 07_render/src/short/ammo_${k}_edl.json $O lofi | tail -1
  (cd 07_render && npx remotion render src/index.ts ShortAmmo-$k out/ammo_shorts/$k/video_silent.mp4 --browser-executable=$B \
    --codec=h264 --crf=16 --pixel-format=yuv420p --color-space=bt709 --concurrency=4 --muted --log=error)
  ffmpeg -v error -y -i $O/video_silent.mp4 -i $O/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest 07_render/out/ammo_shorts/short_$k.mp4
  python3 09_qa/sprinkler/qa.py 07_render/out/ammo_shorts/short_$k.mp4 07_render/src/short/ammo_${k}_edl.json 09_qa/ammo_shorts_$k | grep -E "FAIL|PASS loud|PASS dur"
done

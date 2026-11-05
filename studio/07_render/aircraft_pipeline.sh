#!/usr/bin/env bash
# Wait for aircraft VO, re-voice fact-check-fixed lines, then render the full video.
set -uo pipefail
cd "$(dirname "$0")/.."
until grep -q DONE 03_voiceover/aircraft/cb_log.txt; do sleep 20; done
. /opt/tts/.venv/bin/activate
(cd 03_voiceover && python tools/cb_vo.py ../02_scripts/aircraft/vo_fix.json aircraft/cb_raw refs/ref_michael.wav 2>&1 | grep -E "^[a-z][0-9]+[a-z]? [0-9.]+ \|" >> aircraft/cb_log.txt)
deactivate
rm -rf 03_voiceover/aircraft/final
python3 03_voiceover/tools/process_vo.py 03_voiceover/aircraft/cb_raw 03_voiceover/aircraft/final | tail -1
bash 07_render/render_aircraft.sh 2>&1 | grep -vi memory | tail -14
echo PIPELINE_DONE

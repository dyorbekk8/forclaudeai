#!/usr/bin/env bash
cd "$(dirname "$0")/.."
while pgrep -f "cb_vo.py ../02_scripts/aircraft2/vo_lines.json" >/dev/null; do sleep 20; done
cd 03_voiceover && /opt/tts/.venv/bin/python tools/cb_vo.py ../02_scripts/aircraft2/vo_fix.json aircraft2/cb_raw refs/ref_michael.wav > aircraft2/cb_fix.log 2>&1; cd ..
n=$(ls 03_voiceover/aircraft2/cb_raw/*.wav | wc -l); echo "wavs: $n"
rm -rf 03_voiceover/aircraft2/final
python3 03_voiceover/tools/process_vo.py 03_voiceover/aircraft2/cb_raw 03_voiceover/aircraft2/final | tail -1
bash 07_render/render_aircraft2.sh 2>&1 | grep -vi memory | tail -13
echo PIPELINE_DONE

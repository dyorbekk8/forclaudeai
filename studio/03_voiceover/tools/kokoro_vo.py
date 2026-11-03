"""Scratch/fallback VO with local Kokoro TTS. Usage: kokoro_vo.py <vo_lines.json> <out_dir> [voice]"""
import json, sys, os
import soundfile as sf
from kokoro_onnx import Kokoro

here = os.path.dirname(os.path.abspath(__file__))
models = os.path.join(here, '..', 'models')
lines, out = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else 'am_michael'
os.makedirs(out, exist_ok=True)
k = Kokoro(os.path.join(models, 'kokoro-v1.0.onnx'), os.path.join(models, 'voices-v1.0.bin'))
durs = {}
for b in json.load(open(lines)):
    samples, sr = k.create(b['text'], voice=voice, speed=1.0, lang='en-us')
    sf.write(os.path.join(out, f"{b['id']}.wav"), samples, sr)
    durs[b['id']] = round(len(samples) / sr, 3)
    print(b['id'], durs[b['id']], flush=True)
json.dump(durs, open(os.path.join(out, 'durations.json'), 'w'), indent=1)

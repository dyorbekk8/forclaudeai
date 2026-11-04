"""High-quality VO with Chatterbox TTS + Whisper self-check.
Each line is split into sentences; every sentence is generated, transcribed with Whisper and
regenerated (new seed) until the transcript matches the script (or tries run out). Sentences are
joined with punctuation-aware pauses so full stops and commas are clearly audible.
Usage (inside /opt/tts/.venv): cb_vo.py <vo_lines.json> <out_dir> <ref_voice.wav> [ids,comma,separated]
"""
import json, os, re, sys, random
import numpy as np, soundfile as sf, torch

lines_path, out, ref = sys.argv[1], sys.argv[2], sys.argv[3]
only = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else None
os.makedirs(out, exist_ok=True)
torch.set_num_threads(os.cpu_count() or 4)

from chatterbox.tts import ChatterboxTTS
from faster_whisper import WhisperModel

tts = ChatterboxTTS.from_pretrained(device='cpu')
asr = WhisperModel('small.en', device='cpu', compute_type='int8')
SR = tts.sr

NUM = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'}
def norm(s):
    s = s.lower().replace('-', ' ')
    s = re.sub(r'(\d)', lambda m: ' ' + NUM[m.group(1)] + ' ', s)
    s = re.sub(r"[^a-z' ]", ' ', s)
    return s.split()

def wer(a, b):
    a, b = norm(a), norm(b)
    d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(b) + 1):
            cur = d[j]
            d[j] = min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] != b[j - 1]))
            prev = cur
    return d[len(b)] / max(1, len(a))

def trim(x, thr=0.006):
    idx = np.where(np.abs(x) > thr)[0]
    if not len(idx): return x
    a, b = max(0, idx[0] - int(0.03 * SR)), min(len(x), idx[-1] + int(0.06 * SR))
    return x[a:b]

PAUSE = {'.': 0.42, '?': 0.45, '!': 0.42, ':': 0.30, ';': 0.30}
report = {}
for item in json.load(open(lines_path)):
    lid, text = item['id'], item['text']
    if only and lid not in only: continue
    sents = [s.strip() for s in re.split(r'(?<=[.?!:;])\s+', text) if s.strip()]
    pieces, scores = [], []
    for s in sents:
        best = None
        for attempt in range(4):
            seed = random.randint(0, 10_000)
            torch.manual_seed(seed)
            wav = tts.generate(s, audio_prompt_path=ref, exaggeration=0.45, cfg_weight=0.5, temperature=0.7)
            x = trim(wav.squeeze(0).numpy().astype(np.float32))
            segs, _ = asr.transcribe(x, language='en', beam_size=5) if SR == 16000 else asr.transcribe(np.interp(np.arange(0, len(x), SR / 16000), np.arange(len(x)), x).astype(np.float32), language='en', beam_size=5)
            hyp = ' '.join(g.text for g in segs)
            e = wer(s, hyp)
            dur_ok = len(x) / SR < 0.75 * len(s.split()) + 1.5
            score = e + (0 if dur_ok else 1)
            if best is None or score < best[0]:
                best = (score, x, hyp)
            if score <= 0.05: break
        pieces.append((best[1], PAUSE.get(s[-1], 0.35)))
        scores.append(round(best[0], 3))
        print(lid, f'{best[0]:.2f}', '|', s, '||', best[2].strip(), flush=True)
    sil = lambda t: np.zeros(int(t * SR), dtype=np.float32)
    outw = np.concatenate([np.concatenate([p, sil(g)]) for p, g in pieces[:-1]] + [pieces[-1][0]])
    sf.write(os.path.join(out, f'{lid}.wav'), outw, SR)
    report[lid] = scores
json.dump(report, open(os.path.join(out, 'asr_report.json'), 'a'), indent=1)

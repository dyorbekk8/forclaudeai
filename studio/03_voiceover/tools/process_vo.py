"""Clean + level every VO clip: 48 kHz mono, HPF 70 Hz, gentle presence/warmth EQ, light compression,
each clip normalised to -18 LUFS, silence trimmed to 60 ms at both ends.
Usage: process_vo.py <src_dir> <dst_dir> [tempo]"""
import os, subprocess, sys, json
import numpy as np, soundfile as sf, pyloudnorm as pyln

src, dst = sys.argv[1], sys.argv[2]
tempo = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
os.makedirs(dst, exist_ok=True)
chain = (f"aresample=48000:resampler=soxr,highpass=f=70,"
         f"equalizer=f=180:t=q:w=1.0:g=1.5,equalizer=f=3200:t=q:w=1.2:g=1.8,equalizer=f=7500:t=q:w=2:g=-1.5,"
         f"acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2"
         + (f",atempo={tempo}" if abs(tempo - 1) > 1e-3 else ""))
meter = pyln.Meter(48000)
report = {}
for fn in sorted(os.listdir(src)):
    if not fn.endswith(('.wav', '.mp3')):
        continue
    bid = os.path.splitext(fn)[0]
    tmp = os.path.join(dst, f'{bid}.tmp.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(src, fn), '-af', chain, '-ac', '1', '-c:a', 'pcm_f32le', tmp], check=True)
    x, sr = sf.read(tmp)
    os.remove(tmp)
    thr = 10 ** (-45 / 20)
    idx = np.where(np.abs(x) > thr)[0]
    pad = int(0.06 * sr)
    x = x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]
    fade = int(0.005 * sr)
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade:] *= np.linspace(1, 0, fade)
    lufs = meter.integrated_loudness(x)
    x = pyln.normalize.loudness(x, lufs, -18.0)
    sf.write(tmp, x.astype(np.float32), sr, subtype='FLOAT')
    out = os.path.join(dst, f'{bid}.wav')
    # transparent peak control: limiter only touches the sharp TTS transients
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'alimiter=limit=0.84:attack=3:release=60:level=disabled',
                    '-c:a', 'pcm_s24le', out], check=True)
    os.remove(tmp)
    x, _ = sf.read(out)
    report[bid] = dict(dur=round(len(x) / sr, 3), lufs_in=round(lufs, 1), lufs_out=round(meter.integrated_loudness(x), 1),
                       peak_db=round(20 * np.log10(np.max(np.abs(x))), 1))
json.dump(report, open(os.path.join(dst, 'report.json'), 'w'), indent=1)
print(len(report), 'clips', round(sum(r['dur'] for r in report.values()), 1), 's')

"""Automated QA on the final mp4: format, duration match, black/frozen frames, loudness, per-beat frame sheet."""
import json, os, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
video = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '07_render', 'out', 'every_fire_sprinkler_color_explained.mp4')
edl = json.load(open(os.path.join(ROOT, '07_render', 'src', 'edl.json')))
rep = {}

def run(args):
    return subprocess.run(args, capture_output=True, text=True)

pr = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', video]).stdout)
v = next(s for s in pr['streams'] if s['codec_type'] == 'video')
a = next(s for s in pr['streams'] if s['codec_type'] == 'audio')
rep['video'] = dict(codec=v['codec_name'], w=v['width'], h=v['height'], fps=v['r_frame_rate'], pix=v['pix_fmt'], dur=float(v['duration']))
rep['audio'] = dict(codec=a['codec_name'], sr=a['sample_rate'], ch=a['channels'], dur=float(a['duration']))
rep['expected_dur'] = edl['total'] / edl['fps']
rep['av_dur_diff_s'] = round(abs(rep['video']['dur'] - rep['audio']['dur']), 3)

bd = run(['ffmpeg', '-hide_banner', '-i', video, '-vf', 'blackdetect=d=0.2:pix_th=0.10', '-an', '-f', 'null', '-']).stderr
rep['black_segments'] = [l.split('black_start:')[1].split()[0] for l in bd.splitlines() if 'black_start' in l]
fz = run(['ffmpeg', '-hide_banner', '-i', video, '-vf', 'freezedetect=n=0.001:d=4', '-an', '-f', 'null', '-']).stderr
rep['frozen_over_4s'] = [l.split('freeze_start:')[1].strip() for l in fz.splitlines() if 'freeze_start' in l]
lo = run(['ffmpeg', '-hide_banner', '-i', video, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr
summ = lo[lo.rindex('Summary'):]
for key, tag in (('lufs', 'I:'), ('lra', 'LRA:'), ('true_peak', 'Peak:')):
    line = [l for l in summ.splitlines() if tag in l][0]
    rep[key] = float(line.split(tag)[1].split()[0])

os.makedirs(os.path.join(HERE, 'frames'), exist_ok=True)
for b in edl['beats']:
    t = (b['from'] + b['dur'] * 0.55) / edl['fps']
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1', '-vf', 'scale=640:-1', os.path.join(HERE, 'frames', f"{b['id']}.jpg")])

checks = {
    '1920x1080': rep['video']['w'] == 1920 and rep['video']['h'] == 1080,
    '30fps': rep['video']['fps'] == '30/1',
    'yuv420p': rep['video']['pix'] == 'yuv420p',
    'duration≈EDL': abs(rep['video']['dur'] - rep['expected_dur']) < 0.25,
    'A/V same length': rep['av_dur_diff_s'] < 0.15,
    'no black frames': not rep['black_segments'],
    'no frozen >4s': not rep['frozen_over_4s'],
    'loudness -14±1': abs(rep['lufs'] + 14) <= 1,
    'true peak ≤ -1': rep['true_peak'] <= -0.9,
}
rep['checks'] = checks
json.dump(rep, open(os.path.join(HERE, 'qa_auto.json'), 'w'), indent=1)
for k, ok in checks.items():
    print(('PASS ' if ok else 'FAIL ') + k)
print(json.dumps({k: rep[k] for k in ('video', 'audio', 'lufs', 'true_peak', 'black_segments', 'frozen_over_4s')}))

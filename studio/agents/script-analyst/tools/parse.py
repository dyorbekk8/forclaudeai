"""Parse json3 captions into timed sentences, transcripts and base metrics."""
import csv, json, re, sys
from pathlib import Path

ROOT = Path('/home/user/forclaudeai/studio')
DATA = ROOT / '00_research/data'
OUT = ROOT / 'agents/script-analyst'

CHANNEL_FILES = ['UnclassifiedYTT', 'FieldManualYT', 'TerrainAndTactics', 'BriefedYT', 'CasualTactics']


def list_info():
    info = {}
    for ch in CHANNEL_FILES:
        for line in (DATA / f'{ch}.txt').read_text().splitlines():
            p = line.split('|')
            if len(p) >= 4:
                info[p[0]] = dict(channel=ch, title=p[1], duration=p[2], views=p[3])
    for line in (DATA / 'search_similar.txt').read_text().splitlines():
        p = line.split('|')
        if len(p) >= 6 and p[0] not in info:
            info[p[0]] = dict(channel=p[3], title=p[1], duration=p[4], views=p[5])
    return info


def words(vid):
    f = DATA / f'subs/{vid}.en-orig.json3'
    if not f.exists():
        f = DATA / f'subs/{vid}.en.json3'
    if not f.exists():
        return None, None
    ev = json.load(open(f))['events']
    out = []
    for e in ev:
        for s in e.get('segs', []) or []:
            t = s['utf8']
            if t.strip() == '':
                continue
            out.append(((e['tStartMs'] + s.get('tOffsetMs', 0)) / 1000, t.strip()))
    return out, f.name


def sentences(ws):
    sents, cur, start = [], [], None
    for t, w in ws:
        if start is None:
            start = t
        cur.append(w)
        if re.search(r'[.?!]["\')]?$', w):
            sents.append((start, ' '.join(cur)))
            cur, start = [], None
    if cur:
        sents.append((start, ' '.join(cur)))
    return sents


def mmss(t):
    return f'{int(t // 60):02d}:{int(t % 60):02d}'


def main():
    info = list_info()
    ids = (DATA / 'corpus_ids.txt').read_text().split()
    rows = []
    for vid in ids:
        meta_f = DATA / f'meta/{vid}.info.json'
        meta = json.load(open(meta_f)) if meta_f.exists() else {}
        li = info.get(vid, {})
        title = meta.get('title') or li.get('title')
        views = meta.get('view_count') or li.get('views')
        dur = meta.get('duration') or li.get('duration')
        channel = meta.get('channel') or li.get('channel')
        ws, src = words(vid)
        if ws is None:
            rows.append(dict(id=vid, channel=channel, title=title, views=views, duration_s=dur, note='NO CAPTIONS'))
            continue
        ss = sentences(ws)
        first_t, last_t = ws[0][0], ws[-1][0]
        speech_min = (last_t - first_t) / 60
        n_words = len(ws)
        with open(OUT / f'transcripts/{vid}.txt', 'w') as fh:
            fh.write(f'# {title}\n# channel={channel} views={views} duration_s={dur} src={src}\n')
            if meta.get('chapters'):
                fh.write('# chapters: ' + ' | '.join(f"{mmss(c['start_time'])} {c['title']}" for c in meta['chapters']) + '\n')
            fh.write('\n')
            for t, s in ss:
                fh.write(f'[{mmss(t)}] {s}\n')
        sl = [len(s.split()) for _, s in ss]
        hook_words = sum(1 for t, _ in ws if t < 30)
        rows.append(dict(
            id=vid, channel=channel, title=title, views=views, duration_s=dur,
            words=n_words, wpm=round(n_words / speech_min, 1) if speech_min else '',
            avg_sentence_words=round(sum(sl) / len(sl), 1), n_sentences=len(sl),
            first_word_at_s=round(first_t, 2), hook_words=hook_words,
            likes=meta.get('like_count', ''), comments=meta.get('comment_count', ''),
            upload_date=meta.get('upload_date', ''), n_chapters=len(meta.get('chapters') or []),
            src=src, note=''))
    with open(OUT / 'tools/base_metrics.json', 'w') as fh:
        json.dump(rows, fh, indent=1)
    for r in rows:
        print(r['id'], r.get('views'), r.get('duration_s'), r.get('words'), r.get('wpm'),
              r.get('avg_sentence_words'), r.get('first_word_at_s'), r.get('n_chapters'), r.get('src'), r.get('note'), '|', r.get('title'))


if __name__ == '__main__':
    main()

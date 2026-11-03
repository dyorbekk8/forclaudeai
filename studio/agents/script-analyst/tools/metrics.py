"""Compute per-video script metrics -> metrics.csv (reads tools/base_metrics.json + transcripts/)."""
import csv, json, re
from pathlib import Path

ROOT = Path('/home/user/forclaudeai/studio')
OUT = ROOT / 'agents/script-analyst'
DATA = ROOT / '00_research/data'

# Item counts for videos without YouTube chapters, counted by reading the transcript.
MANUAL_ITEMS = {'EyN93SqOyR4': 28, 'HTV0N_2v2Ps': 14, '8dCrNJwPCE0': 5}
ARCHETYPE = {  # A = catalog (item 1 at 0:01), B = ladder/journey (cold open + "you" climb), C = topic essay
    'EyN93SqOyR4': 'B', 'HTV0N_2v2Ps': 'B', 'kTSKw7vztds': 'B', '0tQDhjkngP0': 'B', 'ZHi5GFaIOao': 'B',
    '8dCrNJwPCE0': 'C',
}
CHANNEL_NAME = {'UnclassifiedYTT': 'Unclassified', 'FieldManualYT': 'Field Manual', 'TerrainAndTactics': 'Terrain & Tactics',
                'BriefedYT': 'Briefed', 'CasualTactics': 'Casual Tactics'}
# Seconds at which item #1 starts, read from transcripts where chapters don't show it.
FIRST_ITEM = {'EyN93SqOyR4': 31, 'HTV0N_2v2Ps': 28, '8dCrNJwPCE0': 41}
EXTRA_VIEWS = {'EyN93SqOyR4': 1969786}  # from search_similar.txt (channel list shows NA)

rx_sent = re.compile(r'^\[(\d\d):(\d\d)\] (.*)$')


def load_sents(vid):
    p = OUT / f'transcripts/{vid}.txt'
    out = []
    for line in p.read_text().splitlines():
        m = rx_sent.match(line)
        if m:
            out.append((int(m[1]) * 60 + int(m[2]), m[3]))
    return out


def main():
    base = json.load(open(OUT / 'tools/base_metrics.json'))
    rows = []
    for b in base:
        vid = b['id']
        r = dict(id=vid, channel=CHANNEL_NAME.get(b['channel'], b['channel']), title=b['title'],
                 views=EXTRA_VIEWS.get(vid) or b['views'], duration_s=b['duration_s'])
        if b.get('note'):
            r['note'] = b['note']
            rows.append(r)
            continue
        meta_f = DATA / f'meta/{vid}.info.json'
        chapters = json.load(open(meta_f)).get('chapters') if meta_f.exists() else None
        chapters = [c for c in (chapters or []) if not re.search(r'intro|how this list works', c['title'], re.I)]
        if ARCHETYPE.get(vid) == 'B' and chapters and not re.match(r'Step 1', chapters[0]['title']):
            chapters = [c for c in chapters if re.match(r'Step', c['title'])] or chapters
        n_items = len(chapters) or MANUAL_ITEMS.get(vid, '')
        first_item_at = FIRST_ITEM.get(vid, round(chapters[0]['start_time']) if chapters else '')
        dur = float(b['duration_s'])
        r.update(words=b['words'], wpm=b['wpm'], avg_sentence_words=b['avg_sentence_words'] if vid != 'cU4TIgi_dyU' else 'n/a (unpunctuated)',
                 n_items=n_items, s_per_item=round(dur / n_items, 1) if n_items else '',
                 first_item_at_s=first_item_at, hook_words=b['hook_words'],
                 archetype=ARCHETYPE.get(vid, 'A'))
        if vid == 'cU4TIgi_dyU':
            rows.append(r)
            continue
        ss = load_sents(vid)
        text = ' '.join(s for _, s in ss)
        words = text.split()
        nw = len(words)
        cta_t = [t for t, s in ss if re.search(r'\bsubscribe\b', s, re.I)]
        r['cta_times_s'] = ' '.join(str(t) for t in cta_t)
        r['mid_cta_pct'] = ' '.join(str(round(100 * t / dur)) for t in cta_t if t < dur - 40)
        r['you_per_100w'] = round(100 * len(re.findall(r"\byou(r|'re|'ll|'d)?\b", text, re.I)) / nw, 2)
        r['numbers_per_100w'] = round(100 * len(re.findall(r'\d[\d,.]*', text)) / nw, 2)
        r['years_per_100w'] = round(100 * len(re.findall(r'\b(1[5-9]\d\d|20[0-3]\d)\b', text)) / nw, 2)
        r['but_sentences'] = sum(1 for _, s in ss if re.match(r'(But|Yet|Still|Instead|Elsewhere)\b', s))
        r['open_loop_phrases'] = sum(len(re.findall(p, text, re.I)) for p in [
            r'\bremember(ing)? (that|this) for later\b', r'\bworth remembering\b', r'\bthat story is coming\b', r'\bcoming up\b',
            r'\blater\b', r'\bstrangest\b', r'\brarest\b', r'\bon this list\b', r'\bfitting place to end\b', r'\bbefore we keep\b'])
        r['questions_in_body'] = sum(1 for t, s in ss if s.endswith('?') and t < dur - 25)
        r['outro_s'] = round(dur - min([t for t, s in ss if re.match(r'Thanks for watching', s)] or [dur]))
        r['short_sents_le5w'] = round(100 * sum(1 for _, s in ss if len(s.split()) <= 5) / len(ss), 1)
        rows.append(r)
    keys = ['id', 'channel', 'title', 'views', 'duration_s', 'words', 'wpm', 'avg_sentence_words', 'n_items', 's_per_item',
            'first_item_at_s', 'hook_words', 'archetype', 'cta_times_s', 'mid_cta_pct', 'outro_s', 'you_per_100w',
            'numbers_per_100w', 'years_per_100w', 'but_sentences', 'open_loop_phrases', 'questions_in_body',
            'short_sents_le5w', 'note']
    with open(OUT / 'metrics.csv', 'w', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=keys, extrasaction='ignore')
        w.writeheader()
        for r in rows:
            w.writerow(r)
    for r in sorted(rows, key=lambda r: -float(r['views']) if str(r['views']).replace('.', '').isdigit() else 0):
        print('|'.join(str(r.get(k, '')) for k in keys if k not in ('title', 'note')))


if __name__ == '__main__':
    main()

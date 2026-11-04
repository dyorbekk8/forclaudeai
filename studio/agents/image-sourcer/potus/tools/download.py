"""download.py picks.json outdir -> ONE batched metadata call, then paced 1920px thumb fetches; writes credits.json"""
import json, sys, time, re, html, urllib.parse, urllib.request, urllib.error, os
UA = {'User-Agent': 'ExplainerStudioBot/1.0 (https://github.com/dyorbekk8/forclaudeai) python-urllib/3.13'}
def get(url, tries=3):
    for i in range(tries):
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except Exception as e:
            w = 60 * (i + 1) if '429' in str(e) else 8 * (i + 1)
            print('retry', str(e)[:60], 'wait', w, flush=True); time.sleep(w)
    return None
strip = lambda s: re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', s or ''))).strip()
picks = json.load(open(sys.argv[1])); out = sys.argv[2]
cpath = os.path.join(out, 'credits.json')
credits = json.load(open(cpath)) if os.path.exists(cpath) else []
have = {c['slug'] for c in credits}
todo = [p for p in picks if p[0] not in have]
q = dict(format='json', action='query', titles='|'.join(t for _, _, t in todo), prop='imageinfo', iiprop='url|size|extmetadata',
         iiurlwidth=1280, iiextmetadatafilter='LicenseShortName|Artist|ImageDescription')
d = json.loads(get('https://commons.wikimedia.org/w/api.php', 1) if False else get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(q)) or b'{}')
norm = {n['from']: n['to'] for n in d.get('query', {}).get('normalized', [])}
pages = {p['title']: p for p in d.get('query', {}).get('pages', {}).values()}
for slug, need, title in todo:
    p = pages.get(norm.get(title, title), {})
    if 'imageinfo' not in p: print('MISSING', title, flush=True); continue
    ii = p['imageinfo'][0]; m = ii.get('extmetadata', {})
    time.sleep(3)
    import hashlib; n=p['title'][5:].replace(' ','_'); h=hashlib.md5(n.encode()).hexdigest(); q=urllib.parse.quote(n)
    b = get(f'https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/1280px-{q}' + ('.jpg' if not n.lower().endswith(('.jpg','.jpeg')) else ''))
    if not b or b[:2] != b'\xff\xd8': print('FAIL', slug, flush=True); continue
    open(os.path.join(out, slug + '.jpg'), 'wb').write(b)
    credits.append(dict(slug=slug, need_no=need, title=p['title'][5:], source_page_url=ii['descriptionurl'], file_url=ii['url'],
        author=strip(m.get('Artist', {}).get('value'))[:200], license=strip(m.get('LicenseShortName', {}).get('value')), why_selected='',
        width=ii.get('thumbwidth'), height=ii.get('thumbheight'), quality_score_1_5=None,
        description=strip(m.get('ImageDescription', {}).get('value'))[:300]))
    json.dump(credits, open(cpath, 'w'), indent=1)
    print('OK', slug, ii.get('thumbwidth'), ii.get('thumbheight'), credits[-1]['license'], flush=True)

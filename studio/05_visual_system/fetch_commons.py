"""fetch_commons.py: slug|search query lines on stdin -> best free-licensed Commons image per slug + credits.json"""
import json, sys, time, urllib.parse, urllib.request, re, os
UA = {'User-Agent': 'explainer-studio/1.0 (educational video research)'}
OK = ('public domain', 'cc0', 'cc by', 'cc-by', 'pd')
def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(format='json', **params))
    for i in range(4):
        try:
            return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read())
        except Exception:
            time.sleep(2 * (i + 1))
    return {}
out = json.load(open('credits.json')) if os.path.exists('credits.json') else []
have = {c['slug'] for c in out}
for line in sys.stdin:
    slug, q = line.strip().split('|', 1)
    if slug in have: continue
    params = dict(action='query', prop='imageinfo', iiprop='url|extmetadata|size', iiurlwidth=1920, iiextmetadatafilter='LicenseShortName|Artist|LicenseUrl')
    if q.startswith('File:'): params['titles'] = q
    else: params.update(generator='search', gsrnamespace=6, gsrlimit=10, gsrsearch=q + ' filetype:bitmap')
    pages = sorted((api(params).get('query', {}).get('pages', {}) or {}).values(), key=lambda p: p.get('index', 0))
    for p in pages:
        ii = p.get('imageinfo', [{}])[0]; m = ii.get('extmetadata', {})
        lic = m.get('LicenseShortName', {}).get('value', '')
        if not any(lic.lower().startswith(o) for o in OK) or ii.get('width', 0) < 1000: continue
        urllib.request.urlretrieve(ii['thumburl'], f'{slug}.jpg') if False else open(f'{slug}.jpg', 'wb').write(urllib.request.urlopen(urllib.request.Request(ii['thumburl'], headers=UA), timeout=60).read())
        out.append(dict(slug=slug, file_title=p['title'], page_url=ii.get('descriptionurl'), license=lic,
                        author=re.sub('<[^>]+>', '', m.get('Artist', {}).get('value', 'unknown')).strip()[:80], width=ii['width'], height=ii['height']))
        print(slug, '<-', p['title'], lic, flush=True); break
    else:
        print(slug, 'NONE', flush=True)
    time.sleep(1)
json.dump(out, open('credits.json', 'w'), indent=1)

"""search.py "query" [n] -> list Commons file candidates with license and size (no download)."""
import json, sys, time, urllib.parse, urllib.request, re
UA = {'User-Agent': 'explainer-studio-research/1.0 (educational YouTube; contact via repo)'}
def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(format='json', **params))
    for i in range(5):
        try:
            return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read())
        except Exception as e:
            time.sleep(4 * (i + 1))
    return {}
q = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 12
d = api(dict(action='query', generator='search', gsrnamespace=6, gsrlimit=n, gsrsearch=q + ' filetype:bitmap', prop='imageinfo', iiprop='url|size|extmetadata', iiextmetadatafilter='LicenseShortName|Artist'))
for p in sorted((d.get('query', {}).get('pages', {}) or {}).values(), key=lambda p: p.get('index', 0)):
    ii = p['imageinfo'][0]; m = ii.get('extmetadata', {})
    lic = m.get('LicenseShortName', {}).get('value', '?')
    print(f"{ii['width']}x{ii['height']} | {lic[:22]:22s} | {p['title'][5:]}")

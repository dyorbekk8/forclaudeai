import sys, os, json
from PIL import Image, ImageDraw
edl = json.load(open('src/edl.json'))
pct = sys.argv[1] if len(sys.argv) > 1 else '65'
ids = sys.argv[2].split(',') if len(sys.argv) > 2 else [b['id'] for b in edl['beats']]
os.makedirs('out/sheets', exist_ok=True)
W, H = 640, 360
for s in range(0, len(ids), 9):
    sheet = Image.new('RGB', (W * 3, (H + 30) * 3), 'white')
    d = ImageDraw.Draw(sheet)
    for k, i in enumerate(ids[s:s + 9]):
        p = f'out/stills/{i}_{pct}.png'
        if not os.path.exists(p): continue
        im = Image.open(p).convert('RGB').resize((W, H))
        x, y = (k % 3) * W, (k // 3) * (H + 30)
        sheet.paste(im, (x, y + 30))
        d.text((x + 8, y + 8), i, fill='black')
    sheet.save(f'out/sheets/sheet_{pct}_{s // 9}.png')
print('ok')

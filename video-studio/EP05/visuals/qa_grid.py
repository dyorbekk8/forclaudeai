import json, sys
from PIL import Image, ImageDraw
outs = json.load(open('/tmp/claude-0/qa_list.json'))
W, H, cols, per = 640, 360, 3, 12
base = sys.argv[1].replace('.jpg', '')
for gi in range(0, len(outs), per):
    chunk = outs[gi:gi + per]
    rows = (len(chunk) + cols - 1) // cols
    g = Image.new('RGB', (W * cols, H * rows), (0, 0, 0))
    for i, (p, t) in enumerate(chunk):
        im = Image.open(p).convert('RGB').resize((W, H))
        d = ImageDraw.Draw(im); d.rectangle([0, 0, 90, 24], fill=(0, 0, 0)); d.text((4, 4), f"{float(t):.2f}s", fill=(255, 255, 0))
        g.paste(im, ((i % cols) * W, (i // cols) * H))
    g.save(f"{base}_{gi // per}.jpg", quality=82)
    print('grid', f"{base}_{gi // per}.jpg")

import json, sys
from PIL import Image, ImageDraw
outs = json.load(open('/tmp/claude-0/qa_list.json'))
n = len(outs); cols = 3; rows = (n + cols - 1) // cols
W, H = 640, 360
g = Image.new('RGB', (W * cols, H * rows), (0, 0, 0))
for i, (p, t) in enumerate(outs):
    im = Image.open(p).convert('RGB').resize((W, H))
    d = ImageDraw.Draw(im); d.rectangle([0, 0, 90, 24], fill=(0, 0, 0)); d.text((4, 4), f"{float(t):.2f}s", fill=(255, 255, 0))
    g.paste(im, ((i % cols) * W, (i // cols) * H))
g.save(sys.argv[1], quality=85)
print('grid', sys.argv[1])

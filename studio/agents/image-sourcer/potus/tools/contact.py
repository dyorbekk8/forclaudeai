"""contact.py dir -> contact_sheet.jpg (labelled tiles from credits.json)"""
import json, sys, os
from PIL import Image, ImageDraw, ImageFont
d = sys.argv[1]; cr = json.load(open(os.path.join(d, 'credits.json')))
W, H, cols = 480, 300, 4
rows = (len(cr) + cols - 1) // cols
sheet = Image.new('RGB', (W * cols, (H + 40) * rows), 'white'); dr = ImageDraw.Draw(sheet)
try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
except Exception: f = ImageFont.load_default()
for i, c in enumerate(cr):
    im = Image.open(os.path.join(d, c['slug'] + '.jpg')).convert('RGB'); im.thumbnail((W - 8, H - 8))
    x, y = (i % cols) * W, (i // cols) * (H + 40)
    sheet.paste(im, (x + (W - im.width) // 2, y + (H - im.height) // 2))
    dr.text((x + 6, y + H + 4), f"{i+1}. {c['slug']}", fill='black', font=f)
    dr.text((x + 6, y + H + 21), f"{c['license'][:18]} {c['width']}x{c['height']}", fill='#a00', font=f)
sheet.save(os.path.join(d, 'contact_sheet.jpg'), quality=85)
print('sheet', sheet.size)

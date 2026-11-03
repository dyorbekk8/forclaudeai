"""Build master index of reference long-form videos and contact sheets of their thumbnails."""
import csv, json, os, statistics
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "00_research/data"
ME = ROOT / "agents/packaging-analyst"

SOURCES = [
    ("Unclassified", ME / "unclassified_full.txt"),
    ("FieldManual", DATA / "FieldManualYT.txt"),
    ("TerrainTactics", DATA / "TerrainAndTactics.txt"),
    ("Briefed", DATA / "BriefedYT.txt"),
    ("CasualTactics", DATA / "CasualTactics.txt"),
]

rows = []
for ch, path in SOURCES:
    for i, line in enumerate(path.read_text().splitlines()):
        vid, title, dur, views = line.split("|")
        rows.append(dict(id=vid, channel=ch, order=i, title=title,
                         duration_s=int(float(dur)) if dur not in ("NA", "") else None,
                         views=int(views) if views not in ("NA", "") else None))
rows.append(dict(id="cU4TIgi_dyU", channel="PoshPainter", order=0,
                 title="Every Rank in the US Army Explained in 19 Minutes", duration_s=1147, views=3200514))

# fill views from meta where missing
for r in rows:
    mp = DATA / "meta" / f"{r['id']}.info.json"
    if mp.exists():
        m = json.loads(mp.read_text())
        r["views"] = m.get("view_count") or r["views"]
        r["upload_date"] = m.get("upload_date")
        r["likes"] = m.get("like_count")
        r["comments"] = m.get("comment_count")

for r in rows:
    for d in (DATA / "thumbs", ME / "thumbs_extra"):
        if (d / f"{r['id']}.jpg").exists():
            r["thumb"] = str(d / f"{r['id']}.jpg")

med = {}
for ch in {r["channel"] for r in rows}:
    v = [r["views"] for r in rows if r["channel"] == ch and r["views"]]
    med[ch] = statistics.median(v) if v else None
for r in rows:
    r["rel"] = round(r["views"] / med[r["channel"]], 2) if r["views"] and med[r["channel"]] else None

with open(ME / "index.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["id", "channel", "order", "title", "duration_s", "views", "rel",
                                      "upload_date", "likes", "comments", "thumb"], extrasaction="ignore")
    w.writeheader()
    w.writerows(rows)
print("rows", len(rows), "medians", med)

# contact sheets: 4 cols x 3 rows, 480px wide tiles, ordered by channel then upload order
font = ImageFont.load_default(size=18)
TW, TH, LH, COLS, ROWS = 480, 270, 46, 4, 3
sheet_rows = [r for r in rows if r.get("thumb")]
out = ME / "contact_sheets"
for n in range(0, len(sheet_rows), COLS * ROWS):
    chunk = sheet_rows[n:n + COLS * ROWS]
    img = Image.new("RGB", (COLS * TW, ROWS * (TH + LH)), "white")
    d = ImageDraw.Draw(img)
    for k, r in enumerate(chunk):
        x, y = (k % COLS) * TW, (k // COLS) * (TH + LH)
        t = Image.open(r["thumb"]).convert("RGB").resize((TW - 6, TH - 4))
        img.paste(t, (x + 3, y + 2))
        v = f"{r['views']/1000:.0f}K" if r["views"] else "NA"
        d.text((x + 4, y + TH), f"#{n+k} {r['id']} {v} x{r['rel']}", fill="black", font=font)
        d.text((x + 4, y + TH + 22), r["title"][:44], fill="#444", font=font)
    img.save(out / f"sheet_{n//(COLS*ROWS):02d}.jpg", quality=85)
print("sheets", (len(sheet_rows) + 11) // 12)

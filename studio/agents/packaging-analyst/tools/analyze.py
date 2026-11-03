"""Merge thumbnail catalog with stats; compute per-feature performance relative to channel median."""
import csv, json, re, statistics as st
from collections import defaultdict
from pathlib import Path

ME = Path(__file__).resolve().parents[1]
DATA = ME.parents[1] / "00_research/data"

idx = {r["id"]: r for r in csv.DictReader(open(ME / "index.csv"))}
for line in (ME / "extra_stats.txt").read_text().split():
    vid, date, views, likes, comments = line.split("|")
    idx[vid].update(views=views, upload_date=date, likes=likes, comments=comments)
for p in (DATA / "meta").glob("*.info.json"):
    m = json.loads(p.read_text())
    if m["id"] in idx:
        idx[m["id"]].update(views=str(m.get("view_count") or ""), upload_date=m.get("upload_date") or "",
                            likes=str(m.get("like_count") or ""), comments=str(m.get("comment_count") or ""))

cat = {}
for line in (ME / "catalog_raw.txt").read_text().splitlines():
    if line.startswith("#"):
        continue
    f = line.split("|")
    cat[f[1]] = dict(n_tiles=f[2], grid=f[3], bg=f[4], style=f[5], labels=f[6], red_anchor=f[7],
                     title_text_on_thumb=f[8], notes=f[9])

def num(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None

rows = []
for vid, r in idx.items():
    r = dict(r, **cat.get(vid, {}))
    r["views"] = num(r.get("views"))
    rows.append(r)

med = {}
for ch in {r["channel"] for r in rows}:
    v = [r["views"] for r in rows if r["channel"] == ch and r["views"]]
    med[ch] = st.median(v) if v else None
for r in rows:
    r["rel"] = round(r["views"] / med[r["channel"]], 2) if r["views"] and med[r["channel"]] else None

def pattern(t):
    if re.match(r"^Every .* Explained", t): return "Every X Explained"
    if re.match(r"^How .* Actually Work", t): return "How X Actually Works"
    if t.startswith("Every "): return "Every X (other)"
    if t.startswith("How "): return "How X (other)"
    return "other"

CLUSTERS = [
    ("colour/code system", r"color|colour|code|level|placard|class|notice|alert|defcon|fpcon|ines|triage|wristband|tube|marking|light|hydrant|siren|buoy|flag|camo|uniform|beret|helmet|tip"),
    ("ranks/insignia/badges/medals", r"rank|pay grade|badge|insignia|medal|decoration|award|beret|discharge"),
    ("weapons/vehicles", r"bullet|caliber|shell|weapon|missile|tank|jet|aircraft|bomber|helicopter|drone|vehicle|warship|submarine|carrier|rifle|artillery|nuclear|sniper|air defense"),
    ("agencies/units/orgs", r"agency|division|force|unit|team|command|brigade|corps|fleet|branch|department|institution|alliance|service|police|swat|seal|task force|lobby"),
    ("secrecy/legal/govt process", r"clearance|secrecy|watchlist|court|geneva|amendment|war plan|emergency power|succession|background check|punish|sanction|engagement|war officially|coup|black project|launch"),
]
def cluster(t):
    tl = t.lower()
    for name, rx in CLUSTERS:
        if re.search(rx, tl):
            return name
    return "other"

for r in rows:
    r["title_pattern"] = pattern(r["title"])
    r["topic_cluster"] = cluster(r["title"])
    r["us_focus"] = "foreign" if re.search(r"russian|chinese|british|german|french|israeli|japanese|korean|indian|ukrainian|australian|canadian|philippine|nato|eu |un |world|interpol", r["title"].lower()) else "us/universal"

fields = ["id", "channel", "title", "views", "rel", "upload_date", "likes", "comments", "duration_s",
          "n_tiles", "grid", "bg", "style", "labels", "red_anchor", "title_text_on_thumb",
          "title_pattern", "topic_cluster", "us_focus", "notes"]
with open(ME / "thumb_catalog.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
    w.writeheader()
    w.writerows(sorted(rows, key=lambda r: (r["channel"], -(r["views"] or 0))))

def table(key, subset=None, label=None):
    g = defaultdict(list)
    for r in (subset or rows):
        if r["rel"] is not None:
            g[r.get(key) or "?"].append(r["rel"])
    print(f"\n## by {label or key}  (n, median rel, mean rel, share >=2x)")
    for k, v in sorted(g.items(), key=lambda kv: -st.median(kv[1])):
        print(f"{k:32s} n={len(v):3d} med={st.median(v):6.2f} mean={st.mean(v):6.2f} hit2x={sum(x>=2 for x in v)/len(v):.0%}")

print("channel medians:", {k: v for k, v in med.items()})
table("style")
table("red_anchor")
table("bg")
table("title_pattern")
table("topic_cluster")
table("us_focus")
table("title_text_on_thumb")

def tiles_bucket(r):
    m = re.match(r"~?(\d+)", r.get("n_tiles", "") or "")
    if not m: return "?"
    n = int(m.group(1))
    return "1" if n <= 1 else "2-6" if n <= 6 else "7-12" if n <= 12 else "13-20" if n <= 20 else "21+"
for r in rows: r["tiles_bucket"] = tiles_bucket(r)
table("tiles_bucket", label="tile count")

unc = [r for r in rows if r["channel"] == "Unclassified"]
table("style", unc, "style (Unclassified only)")
table("topic_cluster", unc, "topic (Unclassified only)")
table("us_focus", unc, "US vs foreign (Unclassified only)")
table("tiles_bucket", unc, "tile count (Unclassified only)")
ct = [r for r in rows if r["channel"] == "CasualTactics"]
table("style", ct, "style (CasualTactics only)")
br = [r for r in rows if r["channel"] == "Briefed"]
table("style", br, "style (Briefed only)")

print("\n## top 25 overall by rel")
for r in sorted([r for r in rows if r["rel"]], key=lambda r: -r["rel"])[:25]:
    print(f"{r['rel']:7.2f} {r['views']:>8} {r['channel']:14s} {r['style']:14s} {r['red_anchor']:13s} {r['title']}")
print("\n## bottom 15 Unclassified")
for r in sorted([r for r in unc if r["rel"]], key=lambda r: r["rel"])[:15]:
    print(f"{r['rel']:7.2f} {r['views']:>8} {r.get('style','?'):14s} {r['title']}")

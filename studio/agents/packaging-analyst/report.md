# Packaging report — thumbnails, titles, topics

Author: packaging-analyst. Reviewed by lead (see "Lead review" at the bottom — read it before using the numbers).

## 0. Data and method
- 221 long-form videos, every thumbnail opened and hand-catalogued:
  Unclassified 162 (full long-form list), Field Manual 11, Terrain & Tactics 7, Briefed 15, Casual Tactics 25, Posh Painter 1.
- `rel` = views ÷ that channel's median views. Medians: Unclassified 25,000; Field Manual 5,900; Terrain & Tactics 9,722; Casual Tactics 2,850; Briefed 874.
- Files: `thumb_catalog.csv` (features per video), `catalog_raw.txt`, `contact_sheets/` (incl. `winners_top12.jpg`, `losers_unclassified_bottom12.jpg`), `tools/`, `analysis_output.txt`.
- Caveats: view snapshot (1–3-day-old videos understated); upload dates known for 24 videos only; `EyN93SqOyR4` (~1.97M) and `PiB52tQBx1A` lack view counts and are excluded from tables.

## 1. Grid type drives performance
| Grid type | n | median rel | ≥2× |
|---|---|---|---|
| colour-variant OR ladder | 54 | **3.52** | **61%** |
| everything else | 163 | 0.64 | 25% |
| colour-variant only | 28 | 3.12 | 57% |
| ladder only | 29 | 4.20 | 69% |

Unclassified's bottom 15 are all grids of circle photos/seals (WW1 fronts 0.07×, lobby groups 0.08×, sanctions 0.09×, tank types 0.13×).
**Rule:** every tile must differ at a glance by colour or by a count/size step. Look-alike members → kill the topic.

## 2. Topic cluster
| Cluster | n | median rel | ≥2× |
|---|---|---|---|
| ranks / insignia / badges / medals | 26 | **5.94** | 69% |
| colour / code systems | 51 | **2.48** | 53% |
| secrecy / legal / government process | 16 | 1.06 | 19% |
| agencies / units / organisations | 59 | 0.84 | 25% |
| weapons / vehicles | 38 | 0.48 | 21% |
| history / fronts / tactics | 27 | 0.35 | 7% |

US topics beat foreign ones on Unclassified (1.08× vs 0.68×). Biggest hits: DEFCON 1.3M (Unclassified) and 1.07M (Casual Tactics), Army Ranks 1.11M, Federal Law Enforcement 571K, Berets 671K, Bullet Tips 396K, Unit Size 393K, Emergency Vehicle Lights 288K, Hydrants 196K.

## 3. Thumbnail style
| Style | n | median rel | ≥2× |
|---|---|---|---|
| photo-real cutouts on white (Field Manual, Briefed) | 9 | 24.0 | 78% |
| hand-drawn sketch tiles, Scrawl look (Casual Tactics, Briefed) | 12 | 10.4 | 58% |
| flat vector objects / swatches | 39 | 1.2–9.8 | — |
| abstract poster icons | 12 | 1.28 | 33% |
| circle medallion photos/logos (older Unclassified) | 88 | 0.46–0.84 | ~25% |
| map/scene + yellow headline (older Casual Tactics) | 14 | 0.39 | 7% |

- Casual Tactics switched to the sketch grid + stamp around 2026-10-13: median ~1K views before; after: 1.97M, 1.07M, 671K, 295K, 235K, 161K, 84K, 52K (confounded with the Scrawl Explains collab).
- Unclassified newest 60: 1.78× (48% ≥2×); older 102: 0.64× (24%).
- Text on thumbnail hurts: big text 0.18–0.44×, yellow banners 0.39×. A small header above a grid is neutral (1.06×).
- Style alone isn't enough: Briefed's sketch videos on non-ladder topics (helmets, Top Gun) got 200–2,300 views.

## 4. Red anchor tile
| Anchor | n | median rel | ≥2× |
|---|---|---|---|
| red stamp on enlarged last tile | 12 | 23.75 | 67% |
| odd-one-out tile | 7 | 6.84 | 86% |
| red "?" box | 10 | 1.25 | 30% |
| none | 183 | 0.88 | 30% |

Winning anchor: last tile on the right, ~2×2 tile units or full height, thin red border, bigger object, red rubber-stamp phrase of 1–3 words rotated −8° to −12° (NEVER USED, NEVER AWARDED, NOBODY, RUST/EOD 2026), optional small red handwritten caption. A stamp states a fact; a "?" only asks.

## 5. Grid size
7–12 tiles 1.00×, 13–20 tiles 1.13×, 21+ tiles 1.16×, single-scene 0.35×. Best: 6–20 tiles + 1 anchor; two rows of 3–6 big tiles read best on a phone.

## 6. Titles
| Pattern | median rel |
|---|---|
| `Every X Explained` (n=176) | 1.00 |
| `How X Actually Works` (n=25) | 1.13 |
| `How X …` without "Actually" (n=10) | 0.39 |

Remakes cannibalise (Unclassified's second DEFCON: 7.8K vs 1.3M). A dull code stays dull (Utility Marking flopped on two channels).

## 7. Cadence and engagement
Unclassified ~every 2.4 days Jul–Sep, ~0.7/day in October. Casual Tactics every 2 days since the switch. Field Manual ~weekly.
Like rates 0.3–0.6% on viral videos → browse traffic: thumbnail + first 30 s decide everything.
Length: winners aren't shorter; target 8–12 minutes.

## Thumbnail spec
1. 1280×720. White `#FFF`, or dark `#111` only for glowing objects.
2. 6–20 tiles in 2–4 rows + enlarged anchor tile on the right. Thin grey borders or none.
3. One object family, same scale/angle/lighting, differing only by colour or ladder step. One house style.
4. Labels 1–3 words, readable at 320 px. No other text.
5. Exactly one anchor in red `#D7262E` with the most surprising fact as a stamp phrase.
6. Red only on the anchor.
7. Mobile test: at 168×94 px you still see N distinct colours/steps + one red-boxed oddity.

## Title rules
`Every <Thing> Color Explained` / `Every <Thing> Explained` / `How <System> Actually Works`. 4–7 words, US-centric, no numbers/emoji/colon/caps/"in X minutes". Title names the system; thumbnail shows the members + anchor.

## Backlog (C curiosity, G grid-ability, S evergreen search, V verifiability; 1–5 each)
Checked against all 221 reference titles and 199 adjacent search results.

| # | Topic | Score | Note |
|---|---|---|---|
| 1 | Dashboard warning lights | 19 | off-niche |
| 2 | Fire sprinkler bulb colours (NFPA 13) | 18 | |
| 3 | Body armor levels (NIJ) | 18 | |
| 4 | Hurricane categories | 18 | |
| 5 | Passport colours | 18 | |
| 6 | Hazard warning symbols | 18 | |
| 7 | Recycling numbers | 18 | |
| 8 | Laundry symbols | 18 | off-niche |
| 9 | Smoke grenade colours | 17 | |
| 10 | Beach warning flags | 17 | |
| 11 | Tornado EF ratings | 17 | |
| 12 | Wildfire danger levels | 17 | |
| 13 | Firefighter ranks | 17 | |
| 14 | Transponder squawk codes | 17 | |
| 15 | Earthquake magnitudes | 17 | |
| 16 | Electrical wire colours | 17 | |
| 17 | Radiation dose levels | 17 | |
| 18 | NFPA fire diamond | 16 | |
| 19 | OSHA safety sign colours | 16 | |
| 20 | Blade fuse colours | 16 | |
| 21 | Gas can colours | 16 | |
| 22 | Curb colours | 16 | |
| 23 | Medical gas cylinder colours | 16 | |
| 24 | Military ID cards | 16 | |
| 25 | Bulletproof glass levels | 16 | |
| 26 | Presidential vehicles | 16 | |
| 27 | Airport sign colours | 16 | |
| 28 | Aircraft light colours | 16 | |
| 29 | Military "CON" levels | 16 | overlaps DEFCON/FPCON |
| 30 | Ammunition colour codes | 15 | |
| 31 | ATC light-gun signals | 15 | |
| 32 | Military hand signals | 15 | |
| 33 | Awareness ribbons | 15 | |
| 34 | Martial arts belts | 15 | |
| 35 | Ski slope colours | 15 | |
| 36 | Pipe marking colours | 15 | |
| 37 | Hospital scrub colours | 15 | varies by hospital |
| 38 | Military shoulder cords | 14 | |
| 39 | Railroad signals | 14 | varies by railroad |
| 40 | Diplomatic license plates | 14 | |

Top 15 on-niche: Fire Sprinkler Bulb, Body Armor, Smoke Grenade, Firefighter Ranks, Hurricane, Passport, Hazard Symbols, Beach Flags, Tornado, Squawk Codes, Wildfire Danger, Radiation Dose, Dashboard Lights, Military ID, Recycling Numbers.

---

## Lead review (verified against `thumb_catalog.csv`)
- **Anchor and style multipliers are inflated.** All 12 "stamp" and all 12 "sketch" rows come from Briefed (median 874) and Casual Tactics (median 2,850, regime change mid-October). Dividing by a tiny median produces huge `rel`. Treat "stamp 23.75×" and "photo-cutout 24×" as *direction*, not size. Within Unclassified alone, the red anchor appears as "odd one out" (6 videos, 6.84×) — that is the cleaner signal.
- **Topic-cluster ranking is robust**: ranks/insignia and colour-codes lead in every channel that has them.
- **Grid-type rule (colour-variant or ladder) is robust**: it holds inside Unclassified alone and is visible in `winners_top12.jpg`.
- Visual check of `winners_top12.jpg` confirms: white background, isolated objects of one family, short labels, and (on the newest winners) one enlarged red-bordered stamp tile. Casual Tactics adds handwritten italic labels and an `EARNED, NOT ISSUED`-style one-line header.
- Backlog topics are not yet fact-checked; verifiability scores are the agent's estimate.

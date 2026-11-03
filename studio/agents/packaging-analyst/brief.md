# Brief — packaging-analyst

## Goal
Find out what makes a viewer *click* in this niche: thumbnail + title + topic. Output rules we can apply,
plus a scored backlog of topics for our own channel.

## Inputs (read only)
- `studio/00_research/data/thumbs/<id>.jpg` — thumbnails of every video on the reference channels
- `studio/00_research/data/{UnclassifiedYTT,FieldManualYT,TerrainAndTactics,BriefedYT,CasualTactics}.txt`
  — `id|title|duration_s|views` (CasualTactics views are often NA; get them from `meta/` where present)
- `studio/00_research/data/meta/<id>.info.json` — full metadata for the 26-video corpus (upload_date, likes, comments, tags, description)
- `studio/00_research/data/search_similar.txt` — `id|title|channel|handle|duration|views` for adjacent channels
- `studio/00_research/format_breakdown.md` (v0 hypotheses)

## Write only inside `studio/agents/packaging-analyst/`
- `thumb_catalog.csv` — per thumbnail: id, channel, views, n_tiles, grid (rows×cols), bg (light/dark), style (vector/photo/sketch/other), labels (y/n), red_anchor (type or none), title_text_on_thumb (y/n), notes
- `contact_sheets/` — optional montage images you make (ffmpeg/python) to compare thumbnails side by side
- `report.md`
- scripts in `tools/`

## Questions
1. Look at **every** thumbnail (open the images). Fill the catalog honestly.
2. Which thumbnail features correlate with views? (normalise per channel: views / channel median). Show the table.
3. Red anchor (? box, stamp, odd one out): how often, and does it help?
4. Tile count / grid size sweet spot.
5. Title patterns: "Every X Explained" vs "How X Actually Works" vs others — performance per pattern, per channel.
6. Topic clusters (military ranks, colour codes, medical, emergency, weapons, government/secret, etc.): which clusters win? Use views/channel-median.
7. Channel stats: videos count, upload cadence (from upload_date where known), median views.
8. Backlog: propose 40 topics in this format that are **not yet done** by these channels (check the lists), score each 1–5 on
   *curiosity*, *visual grid-ability* (can it be shown as N colour/shape-coded tiles?), *evergreen search*, *factual verifiability*. Sort by total.

## Report format
Finding → evidence (numbers, ids) → rule. End with: **Thumbnail spec** (exact rules we follow), **Title rules**, **Top-15 topics**.
Do not invent numbers. Under ~400 lines.

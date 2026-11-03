# Brief — script-analyst

## Goal
Reverse-engineer the *script* of the "Every X Explained / How X Actually Works" niche so we can write
scripts that hold viewers to the end. We are not copying text — we are extracting the formula.

## Inputs (read only)
- `studio/00_research/data/subs/<id>.en-orig.json3` (word-level timings; fall back to `<id>.en.json3`)
- `studio/00_research/data/meta/<id>.info.json` (title, duration, views, likes, comments, chapters, description)
- `studio/00_research/data/corpus_ids.txt` (26 ids)
- `studio/00_research/format_breakdown.md` (v0 hypotheses to confirm or kill)

## Write only inside `studio/agents/script-analyst/`
- `transcripts/<id>.txt` — clean plain transcript with `[mm:ss]` stamps every sentence
- `metrics.csv` — per video: id, channel, views, duration_s, words, wpm, avg_sentence_words, n_items, s_per_item, first_item_at_s, hook_words
- `report.md` — findings (format below)
- any scripts you write go in `tools/`

## Questions to answer, with numbers and quoted examples
1. **Hook (first 30 s):** exact opening lines of the top 8 videos. Pattern? How fast does the first item arrive?
2. **Structure:** intro → items → ending. Is there context (standard/history) before items? Order of items (simple→strange?).
3. **Per-item formula:** the sentence sequence used for each item (name → what it means → why → surprising fact → transition). Give the template with 3 real examples.
4. **Pacing:** WPM, sentence length, seconds per item, how long the video is vs item count.
5. **Retention devices:** open loops ("the last one…"), callbacks, humour, stakes, "you've seen this", direct "you" address. Count them per video.
6. **Transitions between items:** the exact phrases used.
7. **Ending/outro:** how they end, CTA or not, length.
8. **High vs low performers:** what do the top (>250K) do that the bottom (<15K) do not? Be concrete.
9. **Tone & voice:** formality, humour, person, tense. Is it a human VO or TTS (judge from caption style, fillers, disfluencies)?

## Report format
Short sections, each with: finding → evidence (numbers / quotes with `id@mm:ss`) → rule for our scripts.
End with a **"Script template"** we can fill in for a new topic, and a **"Do not"** list.
Keep `report.md` under ~400 lines. Do not invent data; if a caption file is missing, say so.

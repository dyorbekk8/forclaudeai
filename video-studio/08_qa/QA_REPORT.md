# EP01 QA report

| Check | Result |
|---|---|
| Resolution / fps | 1920×1080, 30 fps, H.264 + AAC 320k |
| Duration | 5:01 (301.07 s) |
| Loudness | −14.0 LUFS integrated, −1.2 dBTP (YouTube target) |
| VO over music/SFX during speech | ≈13 dB |
| Black frames | only 2 intentional fades (2:05.9, 4:18.3) |
| Frozen frames (>2.5 s) | none |
| Shots | 80, avg 3.76 s (refs: 3.8 s) |
| Age ledger 15→16→17→18→19→20→21→25→30→36→41 | HUD, pops, SFX and script agree |
| Facts on screen | Serota et al. 2010 (1,000 adults; 1.65/day; ~6/10 none; ~half from ~5%); 75/1.65 ≈ 45 days; dementia line hedged ("many", "can") with source |
| Frame review | contact sheets in stills/*_grid.jpg + final_every5s.jpg; fixed: eyelid slant, chin hair, crumbs, overlaps, scale physics, arm-over-beard, HUD in flashback |

Known limits (not verifiable here — nobody could listen):
- Voice is local Kokoro TTS (ElevenLabs credits were exhausted). Swap-in path: rebuild 03_voiceover with ElevenLabs takes → rerun mix.py → mux.
- Music/SFX are synthesised; strings/crowd/foley are the least natural-sounding elements.

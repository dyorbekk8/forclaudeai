# Status

## Done
- Workspace created (`studio/`).
- Reference PDF archived and rasterised (`reference/page-1..5.png`).
- Format breakdown v0 from thumbnails/titles/views (`format_breakdown.md`).

## Blocked
- **YouTube is not reachable from this session.** The environment's network policy denies
  `youtube.com`, `www.youtube.com`, `m.youtube.com`, `i.ytimg.com` (and `*.googlevideo.com` for video streams).
  Without them we cannot download reference videos, captions or thumbnails.
- vidIQ connector has 0 credits (renews 2026-11-15).

## Next, once YouTube is allowed
1. Pull channel video lists + stats for: Unclassified, Field Manual, Terrain & Tactics, Briefed, Casual Tactics, Scrawl Explains, plus similar channels.
2. Download 8–10 top videos (yt-dlp), extract captions, audio and frames.
3. Measure: WPM, shot length, transitions, SFX hits, music level, intro length, item rhythm.
4. Upgrade `format_breakdown.md` to v1 with measured numbers.
5. Only then: style guide, SFX library, first script.
